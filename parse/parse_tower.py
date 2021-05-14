import sys
from datetime import datetime
from db_config import RDS_HOST, NAME, PASSWORD, DB_NAME
import pymysql
import boto3

BUCKET="dxhub-vafb-xui-weather-data-raw"

s3 = boto3.client('s3')

try:
    conn = pymysql.connect(host=RDS_HOST, user=NAME, password=PASSWORD, database=DB_NAME, connect_timeout=5)
    cur = conn.cursor()

except Exception as e:
    print("could not connect to the database")
    print(str(e))
    sys.exit()

def main():
    #------------------------------------ csv --------------------------------------
    successful_inserts = 0

    response = s3.list_objects(
        Bucket=BUCKET,
        Prefix="tower/",
        MaxKeys=1000 #should be toggled when dealing with larger sets
    )

    file_names = [val['Key'] for val in response['Contents']]

    for tower in file_names:
        #for presentation, insert_into_db returns # of insertions performed per file
        successful_inserts += insert_into_db(tower)

    print("{0} file(s) were parsed with {1} total insertion(s)".format( str(len(file_names)), str(successful_inserts) ))
    
    conn.close()
    return None

def insert_into_db(file_key):
    tower_archive_num = None
    measurement_date_time = None

    response = s3.get_object(
        Bucket=BUCKET,
        Key=file_key
    )

    lines = response['Body'].read().decode('utf-8').split('\n')

    if len(lines) < 3:
        raise Exception("Tower file missing sufficient product code entries")

    #grab header information
    tower_archive_num = int(lines[0])
    measurement_date_time = datetime.strftime(datetime.strptime(lines[1], "%d/%m/%Y %H:%M:%S"), "%Y-%m-%d %H:%M:%S")

    #insert header information
    insert_measurement_stmt = "INSERT INTO TowerMeasurements(TowerID, MeasurementDateTime) VALUES(%s, %s)"

    cur.execute(insert_measurement_stmt, [tower_archive_num, measurement_date_time])
    
    #grab MeasurementID to associate with the following tower product code recordings
    select_measurement_stmt = "SELECT MAX(MeasurementID) FROM TowerMeasurements;"

    cur.execute(select_measurement_stmt)
    
    measurement_id = cur.fetchone()[0]
    insertions = []

    #iterate over slice not including header to build list of data to perform bulk insert
    for row in lines[2:]:
        try:
            #validate row[0] is a product code before appending to the insertion set?
            if len(row) >= 3:
                insertions.append( row.split(',')[:3] )
        except Exception as e:
            print("exception occurred with line: {}".format(row))
            print(str(e))
        

    insert_products_stmt = "INSERT INTO TowerProductCodeResponse(MeasurementID, ProductCode, HeightMeasurement, Value) VALUES({}, %s, %s, %s)".format(measurement_id)

    try:
        #returns the number of executions
        response = cur.executemany(insert_products_stmt, insertions)
        
        if response < len(insertions):
            raise Exception("{} dropped execution(s)".format(str(len(insertions) - response)))
    except Exception as e:
        print("Failed to execute all insertions for file: {}".format(file_key))
        print(str(e))

    conn.commit()

    return response


if __name__ == "__main__":
    main()