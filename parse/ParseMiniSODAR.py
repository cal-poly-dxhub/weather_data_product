import sys
import re
from datetime import datetime
from dateutil.parser import parse
import boto3

from utility import get_secret, get_logger
import pymysql

BUCKET="dxhub-vafb-xui-weather-data-raw"
SECRET_NAME="Aurora"

s3_client = boto3.client('s3')

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
    try:
        key = event['Records'][0]['s3']['object']['key']
        file_type = key.split(".")[-1]
    except Exception as e:
        logger.error("key: {}".format(key))
        logger.error(e)
        sys.exit()

    successful_inserts = 0

    if file_type == "csv":
        successful_inserts = upload_csv(key)
    elif file_type == "raw":
        successful_inserts = upload_raw(key)
    else:
        logger.error("unknown file type <{}> from file: {}".format(file_type, key))

    print("{0} was parsed with {1} total insertion(s)".format( key, str(successful_inserts) ))

    conn.close()
    return None


def upload_csv(file_key):
    response = s3.get_object(
        Bucket=BUCKET,
        Key=file_key
    )

    lines = response['Body'].read().decode('utf-8').split('\n')
    lines = [line.split(",") for line in lines]

    #verify full header
    if (len(lines) < 7 or                               #invalid csv file header
        len(lines[6]) < 2 or                 #invalid gate_num specification
        len(lines) < (7 + int(lines[6][1]))):#file size does not match header specification
        print("file <{}> doesn't contain enough gate record data".format(file_key))
        return 0
    
    try:
        miniSODAR_instrument = {
            "asset_id": int(lines[0][0]),
            "measurement_date_time": datetime.strftime(parse(lines[1][0], dayfirst=True), "%Y-%m-%d %H:%M:%S"),
            "mx_height": lines[2][1],
            "u_noise": lines[3][1],
            "v_noise": lines[4][1],
            "w_noise": lines[5][1]
        }
    except Exception as e:
        print("could not parse header information")
        print(e)
        return 0
    
    try:
        measurement_id = insert_measurement(miniSODAR_instrument.copy(), file_key)
    except Exception as e:
        print("Could not insert miniSODAR measurement: {}".format(miniSODAR_instrument))
        print(e)
        return 0

    insertions = []

    for row in lines[7:len(lines) - 1]:
        try:
            if miniSODAR_codes.get(row[0]) == "gate_record":
                insertions.append( row[1:] )
            else:
                print("encountered gate_record without proper gate code: {}".format(row))
        except Exception as e:
            print("exception occured with line: {}".format(e))
    
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
        successful_inserts = cur.executemany(insert_gate_records, insertions)
        if successful_inserts < len(insertions):
            raise Exception("{} dropped execution(s)".format(str(len(insertions) - successful_inserts)))
    except Exception as e:
        print("Failed to execute all insertions for file: {}".format(file_key))
        print(str(e))

    conn.commit()
    return successful_inserts


def get_asset_id(asset_name):
    asset_search = "SELECT AssetID FROM MiniSODARInstrument WHERE `Name` = %s"
    cur.execute(asset_search, [asset_name])

    return cur.fetchone()[0]


def upload_raw(file_key):
    response = s3.get_object(
        Bucket=BUCKET,
        Key=file_key
    )

    #use asset name in filename to grab asset id
    asset_name = file_key.split('.')[1]
    asset_id = get_asset_id(asset_name)

    lines = [re.split('\s+',line) for line in response['Body'].read().decode('utf-8').split('\n')]
   
    #verify full header
    if len(lines) < 4: #invalid raw file header
        print("file <{}> doesn't contain enough gate record data".format(file_key))
        return 0

    try:
        miniSODAR_instrument = {
            "asset_id": asset_id,
            "measurement_date_time": datetime.strftime(datetime.strptime(lines[0][1] + " " +  lines[0][2], "%m/%d/%Y %H:%M:%S"), "%Y-%m-%d %H:%M:%S"),
            "mx_height": lines[2][lines[2].index("MXHT") + 1],
            "u_noise": lines[2][lines[2].index("UNOISE") + 1],
            "v_noise": lines[2][lines[2].index("VNOISE") + 1],
            "w_noise": lines[2][lines[2].index("WNOISE") + 1]
        }
    except Exception as e:
        print("could not parse header information")
        print(lines[2])
        print(e)
        return 0

    try:
        measurement_id = insert_measurement(miniSODAR_instrument.copy(), file_key)
    except Exception as e:
        print("Could not insert miniSODAR measurement: {}".format(miniSODAR_instrument))
        print(e)
        return 0

    insertions = []
    gate_num = 0

    #each iteration is a cleaned row of gate record data (not including the last array of empty space)
    for gate_record in [ line[1:] for line in lines[4:len(lines) - 1] ]:
        gate_num += 1
        attributes = [gate_num] + gate_record

        insertions.append( attributes )

    insert_gate_records = """INSERT INTO `MiniSODARGateResponse`(`MeasurementID`,`GateNum`, {})
                            VALUES({}, {});""".format(", ".join(lines[3][1:]), #header info details attribute names
                                                        str(measurement_id),
                                                        ", ".join(["%s" for attr in range(len(lines[3][1:]) + 1)]))

    try:
        successful_inserts = cur.executemany(insert_gate_records, insertions)
        if successful_inserts < len(insertions):
            raise Exception("{} dropped execution(s)".format(str(len(insertions) - successful_inserts)))
    except Exception as e:
        print("Failed to execute all insertions for file: {}".format(file_key))
        print(str(e))

    conn.commit()
    return successful_inserts


def insert_measurement(miniSODAR_instrument, file_key):
    insert_measurement_stmt = """INSERT INTO MiniSODARMeasurement(AssetId, MeasurementDateTime, MxHeight, UNoise, VNoise, WNoise, FileLocation)
                                VALUES(%s, %s, %s, %s, %s, %s, %s)"""
    insert_args = [
        miniSODAR_instrument['asset_id'],
        miniSODAR_instrument['measurement_date_time'],
        miniSODAR_instrument['mx_height'],
        miniSODAR_instrument['u_noise'],
        miniSODAR_instrument['v_noise'],
        miniSODAR_instrument['w_noise'],
        file_key
    ]
    cur.execute(insert_measurement_stmt, insert_args)

    select_measurement_stmt = "SELECT MAX(MeasurementID) FROM MiniSODARMeasurement;"
    cur.execute(select_measurement_stmt)

    return cur.fetchone()[0]