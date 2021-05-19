import sys
from datetime import datetime
from db_config import RDS_HOST, NAME, PASSWORD, DB_NAME
import pymysql
import boto3

BUCKET="dxhub-vafb-xui-weather-data-raw"

s3 = boto3.client('s3')

miniSODAR_instrument = {
    "asset_id": None,
    "measurement_date_time": None,
    "mx_height": None,
    "u_noise": None,
    "v_noise": None,
    "w_noise": None
}

miniSODAR_codes = {
    '1': 'mx_height',
    '2': 'u_noise',
    '3': 'v_noise',
    '4': 'w_noise',
    '5': 'n_gates',
    '6': 'gate_record'
}

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
        Prefix="mini-sodar/",
        MaxKeys=1000 #should be toggled when dealing with larger sets
    )

    file_names = [val['Key'] for val in response['Contents']]

    csv = [file for file in file_names if file.endswith(".csv")]
    raw = [file for file in file_names if file.endswith(".raw")]

    for measurement in csv:
        successful_inserts += upload_csv(measurement)
    
    #for measurement in raw:
    #    print("handle raw measurement: {}".format(measurement))

    print("{0} file(s) were parsed with {1} total insertion(s)".format( str(len(file_names)), str(successful_inserts) ))

    return None


def upload_csv(file_key):
    response = s3.get_object(
        Bucket=BUCKET,
        Key=file_key
    )

    lines = response['Body'].read().decode('utf-8').split('\n')

    #verify full header
    if (len(lines) < 7 or                               #invalid csv file header
        len(lines[6].split(',')) < 2 or                 #invalid gate_num specification
        len(lines) < (7 + int(lines[6].split(',')[1]))):#file size does not match header specification
        print("file <{}> doesn't contain enough gate record data".format(file_key))
        return 0
    
    try:
        miniSODAR_instrument = {
            "asset_id": int(lines[0]),
            "measurement_date_time": datetime.strftime(datetime.strptime(lines[1], "%d/%m/%Y %H:%M:%S"), "%Y-%m-%d %H:%M:%S"),
            "mx_height": lines[2].split(',')[1],
            "u_noise": lines[3].split(',')[1],
            "v_noise": lines[4].split(',')[1],
            "w_noise": lines[5].split(',')[1]
        }
    except Exception as e:
        print("could not parse header information")
        print(e)
        return 0
    
    try:
        measurement_id = insert_measurement(miniSODAR_instrument)
    except Exception as e:
        print("Could not insert miniSODAR measurement: {}".format(miniSODAR_instrument))
        print(e)
        return 0

    insertions = []

    for row in lines[7:]:
        try:
            if miniSODAR_codes.get(row[0]) == "gate_record":
                insertions.append( row.split(',')[1:] )
            else:
                print("encountered gate_record without proper gate code: {}".format(row))
        except Exception as e:
            print("exception occured with lin: {}".format(row))
    
    insert_gate_records = """INSERT INTO `MiniSODARGateResponse`(`MeasurementID`,`GateNum`,`HT`,`HT_QCFLAG`,`SPD`,`SPD_QCFLAG`,`DIR`,`DIR_QCFLAG`,`GSPD`,`GSPD_QCFLAG`,
                                                                `GDIR`,`GDIR_QCFLAG`,`W`,`W_QCFLAG`,`SDW`,`SDW_QCFLAG`,`NW`,`NW_QCFLAG`,`IW`,`IW_QCFLAG`,
                                                                `SNRW`,`SNRW_QCFLAG`,`U`,`U_QCFLAG`,`SDU`,`SDU_QCFLAG`,`NU`,`NU_QCFLAG`,`IU`,`IU_QCFLAG`,
                                                                `SNRU`,`SNRU_QCFLAG`,`V`,`V_QCFLAG`,`SDV`,`SDV_QCFLAG`,`NV`,`NV_QCFLAG`,`IV`,`IV_QCFLAG`,
                                                                `SNRV`,`SNRV_QCFLAG`,`SDW5`,`SDW5_QCFLAG`,`SDW10`,`SDW10_QCFLAG`)
                            VALUES({},%s,%s,%s,%s,%s,%s,%s,%s,%s,
                                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                                    %s,%s,%s,%s,%s,%s);""".format(str(measurement_id))
    try:
        response = cur.executemany(insert_gate_records, insertions)
        if response < len(insertions):
            raise Exception("{} dropped execution(s)".format(str(len(insertions) - response)))
    except Exception as e:
        print("Failed to execute all insertions for file: {}".format(file_key))
        print(str(e))

    conn.commit()
    print(response)
    return response


def insert_measurement(miniSODAR_instrument):
    insert_measurement_stmt = """INSERT INTO MiniSODARMeasurement(AssetId, MeasurementDateTime, MxHeight, UNoise, VNoise, WNoise)
                                VALUES(%s, %s, %s, %s, %s, %s)"""
    insert_args = [
        miniSODAR_instrument['asset_id'],
        miniSODAR_instrument['measurement_date_time'],
        miniSODAR_instrument['mx_height'],
        miniSODAR_instrument['u_noise'],
        miniSODAR_instrument['v_noise'],
        miniSODAR_instrument['w_noise']
    ]
    cur.execute(insert_measurement_stmt, insert_args)

    select_measurement_stmt = "SELECT MAX(MeasurementID) FROM MiniSODARMeasurement;"
    cur.execute(select_measurement_stmt)

    return cur.fetchone()[0]

def upload_raw(file_key):
    response = s3.get_object(
        Bucket=BUCKET,
        Key=file_key
    )

    lines = response['Body'].read().decode('utf-8').split('\n')

    return lines


    '''

    #------------------------------------ raw --------------------------------------

    with open(raw_file_path, "r") as raw_file:

        print("RAW!")

        file_rows = [line.split() for line in raw_file]
        
        miniSODAR_instrument = {
            "asset_id": None,
            "measurement_date_time": " ".join(file_rows[0][1:3]),
            "mx_height": file_rows[2][10],
            "u_noise": file_rows[2][12],
            "v_noise": file_rows[2][14],
            "w_noise": file_rows[2][16]
        }

        insert_measurement_stmt = """INSERT INTO MiniSODARMeasurement(AssetId, MeasurementDateTime, MxHeight, UNoise, VNoise, WNoise)
                                    VALUES({}, '{}', {}, {}, {}, {})""".format(miniSODAR_instrument['asset_id'], miniSODAR_instrument['measurement_date_time'], miniSODAR_instrument['mx_height'], miniSODAR_instrument['u_noise'], miniSODAR_instrument['v_noise'], miniSODAR_instrument['w_noise'])

        print(insert_measurement_stmt)
        print("\n" + "MeasurementId returned by statement execution (ex. 123)" + "\n")

        data = file_rows[4:]

        insert_stmt = """INSERT INTO MiniSODARGateResponse(MeasurementID, GateNum, HT, ...)
                        VALUES(123, {});""".format(", ".join(data[0])) #skip row[0] b/c it's the row identifier
        print(insert_stmt)


        #data = [line.split() for line in raw_file][4:]
        #print(data)
    '''

if __name__ == "__main__":
    main()