import sys
from datetime import datetime
from dateutil.parser import parse
from utility import get_response, generate_map_from_response, get_logger, format_param_value
import logging
import boto3

logger = get_logger()

s3_resource = boto3.resource('s3')
s3_client = boto3.client('s3')
BUCKET="dxhub-vafb-xui-weather-data-raw"


def lambda_handler(event, context):
    #------------------------------------ csv --------------------------------------
    #get() does not store in memory
    try:
        key = event['Records'][0]['s3']['object']['key']
        obj = s3_resource.Object(BUCKET, key).get()['Body']
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
    
    return None

def insert_into_db(file_key):
    tower_archive_num = None
    measurement_date_time = None

    response = s3_client.get_object(
        Bucket=BUCKET,
        Key=file_key
    )

    lines = response['Body'].read().decode('utf-8').split('\n')
    lines = [line.split(',') for line in lines]

    if len(lines) < 3:
        raise Exception("Tower file missing sufficient product code entries")

    #grab header information
    tower_archive_num = int(lines[0][0])
    try:
        measurement_date_time = datetime.strftime(parse(lines[1][0], dayfirst=True), "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        raise Exception("measurement datetime format could not be determined: {}".format(e))

    #returns the ID associated from the newly-created record
    measurement_id = insert_measurement(tower_archive_num, measurement_date_time, file_key)

    if not measurement_id:
        raise Exception("Could not create measurement for file: {}".format(file_key))

    insertions = []

    #iterate over slice not including header to build list of data to perform bulk insert
    for row in lines[2:]:
        if len(row) >= 3:
            params = [
                { "name": "product_code", "value": format_param_value(row[0]) },
                { "name": "height_measurement", "value": format_param_value(row[1]) },
                { "name": "value", "value": format_param_value(row[2]) }
            ]
            insertions.append( params )
        else:
            logger.error("row in improper format; expected (at least) 3 entries: {}".format(row))
        

    insert_products_stmt = "INSERT INTO TowerCodeResponse(MeasurementID, ProductCode, HeightMeasurement, Value) VALUES({}, :product_code, :height_measurement, :value)".format(measurement_id)

    #returns the number of executions
    response = get_response(insert_products_stmt, insertions)

    inserts = response and response['generatedFields'][0]['longValue']
    
    if not inserts or inserts < len(insertions):
        raise Exception("{} dropped execution(s)".format(str(len(insertions) - response)))

    return inserts


def insert_measurement(tower_archive_num, measurement_date_time, file_key):
    #insert header information
    insert_measurement_stmt = "INSERT INTO TowerMeasurement(TowerID, FileLocation, MeasurementDateTime) VALUES(:tower_id, :file_location, :measurement_date_time)"

    parameter_sets = [[
        { "name": "tower_id", "value": format_param_value( tower_archive_num ) },
        { "name": "file_location", "value": format_param_value( file_key ) },
        { "name": "measurement_date_time", "value": format_param_value( measurement_date_time ) }
    ]]

    response = get_response(insert_measurement_stmt, parameter_sets) # could be None
    
    return response and response['generatedFields'][0]['longValue']