import csv
import sys
import json
from datetime import datetime
from db_config import RDS_HOST, NAME, PASSWORD, DB_NAME
import pymysql
import boto3

BUCKET="dxhub-vafb-xui-weather-data-raw"

tower_instrument = {
    "tower_id": None,
    "measurement_date_time": None
}

def main():
    #------------------------------------ csv --------------------------------------
    
    s3 = boto3.client('s3')

    response = s3.list_objects(
        Bucket=BUCKET,
        Prefix="tower/",
        MaxKeys=1000 #should be toggled when dealing with larger sets
    )

    file_names = [val['Key'] for val in response['Contents']]

    for tower in file_names:
        response = s3.get_object(
            Bucket=BUCKET,
            Key=tower
        )

    return {}

    try:
        conn = pymysql.connect(host=RDS_HOST, user=NAME, password=PASSWORD, database=DB_NAME, connect_timeout=5)
    except Exception as e:
        print("could not connect to the database")
        print(str(e))
        sys.exit()
    cur = conn.cursor()
    

    with open(csv_file_path, "r") as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')

        line_num = 0

        insertions = []

        for row in csv_reader:
            line_num += 1
            if line_num == 1:
                tower_instrument['tower_id'] = str(int(row[0]))
            
            elif line_num == 2:
                #convert datetime format to expected DB format
                tower_instrument['measurement_date_time'] = datetime.strftime(datetime.strptime(row[0], "%d/%m/%Y %H:%M:%S"), "%Y-%m-%d %H:%M:%S")


                insert_measurement_stmt = "INSERT INTO TowerMeasurements(TowerID, MeasurementDateTime) VALUES(%s, %s)"
                select_measurement_stmt = "SELECT MAX(MeasurementID) FROM TowerMeasurements;"
                measurement_data = [tower_instrument['tower_id'], tower_instrument['measurement_date_time']]

                cur.execute(insert_measurement_stmt, measurement_data)
                cur.execute(select_measurement_stmt)
                
                measurement_id = cur.fetchone()[0]
            
            elif line_num > 2 and len(row) >= 3:
                try:
                    #validate row[0] is a product code before appending to the insertion set?
                    insertions.append( row[:3] )
                except Exception as e:
                    print("exception occurred at line: {}".format(line_num))
                    print(str(e))
            

        insert_products_stmt = "INSERT INTO TowerProductCodeResponse(MeasurementID, ProductCode, HeightMeasurement, Value) VALUES({}, %s, %s, %s)".format(measurement_id)

        response = cur.executemany(insert_products_stmt, insertions)
        print(response)

    csv_file.close()

    conn.commit()
    conn.close()


if __name__ == "__main__":
    main()