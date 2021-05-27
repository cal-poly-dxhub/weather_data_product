import sys
from datetime import datetime
from dateutil.parser import parse
from utility import get_secret, get_logger

import pymysql
import boto3

logger = get_logger()

BUCKET="dxhub-vafb-xui-weather-data-raw"
SECRET_NAME="Aurora"

s3_client = boto3.client('s3')

try:
    db_credentials = eval(get_secret(SECRET_NAME))
except Exception as e:
    logger.error(e)
    logger.error("could not obtain secret")
    sys.exit()

try:
    conn = pymysql.connect(
        host=db_credentials['host'],
        user=db_credentials['username'],
        password=db_credentials['password'],
        database=db_credentials['dbname'],
        connect_timeout=5
    )
    cur = conn.cursor()

except Exception as e:
    print("could not connect to the database")
    print(str(e))
    sys.exit()


def lambda_handler(event, context):
    #------------------------------------ csv --------------------------------------
    #get() does not store in memory
    try:
        key = event['Records'][0]['s3']['object']['key']
    except Exception as e:
        logger.error("key: {}".format(key))
        logger.error(e)
        logger.error("S3 Object could not be opened.")
        sys.exit()

    successful_inserts = 0

    try:
        successful_inserts = insert_into_db(key)
    except Exception as e:
        logger.error("{0}: {1}".format(key, e))

    logger.info("{0} was parsed with {1} total insertion(s)".format(key, str(successful_inserts) ))
    
    conn.close()
    return None

def insert_into_db(file_key):
    tower_archive_num = None
    measurement_date_time = None

    response = s3_client.get_object(
        Bucket=BUCKET,
        Key=file_key
    )

    lines = response['Body'].read().decode('utf-8').split('\n')
    lines = [line.split(",") for line in lines]

    if len(lines) < 3:
        raise Exception("Tower file missing sufficient product code entries")

    #grab header information
    tower_archive_num = int(lines[0][0])
    measurement_date_time = datetime.strftime(parse(lines[1][0], dayfirst=True), "%Y-%m-%d %H:%M:%S")

    #returns the ID associated from the newly-created record
    measurement_id = insert_measurement(tower_archive_num, measurement_date_time, file_key)

    insertions = []

    #iterate over slice not including header to build list of data to perform bulk insert
    for row in lines[2:]:
        if len(row) >= 3:
            insertions.append( row[:3] )
        else:
            logger.error("row in improper format; expected 3 entries: {}".format(row))
        

    insert_products_stmt = "INSERT INTO TowerGateResponse(MeasurementID, ProductCode, HeightMeasurement, Value) VALUES({}, %s, %s, %s)".format(measurement_id)

    #returns the number of executions
    response = cur.executemany(insert_products_stmt, insertions)
    
    if response < len(insertions):
        raise Exception("{} dropped execution(s)".format(str(len(insertions) - response)))

    conn.commit()

    return response


def insert_measurement(tower_archive_num, measurement_date_time, file_key):
    #insert header information
    insert_measurement_stmt = "INSERT INTO TowerMeasurement(TowerID, FileLocation, MeasurementDateTime) VALUES(%s, %s, %s)"

    cur.execute(insert_measurement_stmt, [tower_archive_num, file_key, measurement_date_time])
    
    #grab MeasurementID to associate with the following tower product code recordings
    select_measurement_stmt = "SELECT MAX(MeasurementID) FROM TowerMeasurement;"

    cur.execute(select_measurement_stmt)
    
    return cur.fetchone()[0]