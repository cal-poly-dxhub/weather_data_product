import json
import pymysql
import boto3
import sys
import re 
from datetime import datetime
from utility import get_secret, get_logger

logger = get_logger()
BUCKET="dxhub-vafb-xui-weather-data-raw"
SECRET_NAME="Aurora"
SECRET_NAME_2 = "Aurora-reader"
s3_client = boto3.client('s3')
filepath = "" # stores bucket key for insertion later.ß


""" Initiate DB Connection """
try:
    db_credentials = eval(get_secret(SECRET_NAME))
    db_credentials_2 = eval(get_secret(SECRET_NAME_2))

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
    # reader endpoint
    conn2 = pymysql.connect(
        host=db_credentials_2['host'],
        user=db_credentials_2['username'],
        password=db_credentials_2['password'],
        database=db_credentials_2['dbname'],
        connect_timeout=5
    )
    cur2 = conn2.cursor()

except Exception as e:
    print("could not connect to the database")
    print(str(e))
    sys.exit()

""" Finish Initiation of DB """


def lambda_handler(event, context):
    successful_inserts = 0
    try:
        key = event['Records'][0]['s3']['object']['key']
        dupl = check_duplicate(key)
        if (dupl > 0): # dupl > 0 indicates file exists in db
            print("File {} is already in database. Exiting".format(key))
            return None
        successful_inserts = bucket_read(key)
    except Exception as e:
        logger.error("key: {}".format(key))
        logger.error(str(e))
        sys.exit(-1)

    print("{0} was parsed with {1} total insertion(s)".format( key, str(successful_inserts) ))
    return None
    

def check_duplicate(key):
    select_stm = """Select FileLocation from TemperatureProfilerMeasurement
    where FileLocation = '{}'""".format(key)
    try:
        cur2.execute(select_stm)
        res = cur2.fetchone()
        print(res)
        if res:
            return 1
    except Exception as e:
        logger.error(e)
        return 1
    return 0
    
 
"""
Returns the assetID for the Profiler Instrument.
"""
def getAssetIDFromDB(assetName):
    # hopefully we have connection cursor defined already
    asset_select = "SELECT AssetID FROM ProfilerInstrument WHERE Name = '{}'".format(
        assetName)
    cur2.execute(asset_select)
    return cur2.fetchone()[0]


"""
We use the same cursor that we write with to read. We need the measurementID
created by the insert statement in parseRaw/CSV.
"""
def getMaxMeasurementID(filename):
    measurement_select = "SELECT MAX(MeasurementID) From TemperatProfilerMeasurement"
    cur.execute(measurement_select)
    return cur.fetchone()[0]
    

"""
Unfortunately, asset names aren't in the raw files so we have to parse from
the file name. Since the format of raw files are the same, we should be able 
to parse LF06/SLC2 (though at the time of writing this I had no test files for
those formats).
"""
def getAssetID(filename):
    asset_name = None
    if "915_DIOSA" in filename:
        asset_name = "915_DIOSA"
    elif "915_SLC4" in filename:
        asset_name = "915_SLC4"
    elif "915_LF03" in filename:
        asset_name = "915_LF03"
    elif "915_WST" in filename:
        asset_name = "915_WST"
    elif "915_LF06" in filename:
        asset_name = "915_LF06"
    elif "915_SLC2" in filename:
        asset_name = "915_SLC2"
    else:
        print("Unsupported parsing time. Exiting")
        sys.exit(-1)
    return getAssetIDFromDB(asset_name)


"""
uploadRaw takes .raw data from an s3 bucket object and inserts it into the
database. A note about Temp .raw files (which differ a bit from Wind .raw):

row 5 contains the date/time, and so does the filename.
row 12+ contains the data we want.

Data is only inserted into the database if the insert statement for the
TemperatureProfilerMeasurement table is successful, and all rows of data 
from rows 12+ are successfully parsed.
"""
def uploadRAW(data):
    row_num = num_insertions = gate_num = 0
    insert_measurement_stmt_cols = "INSERT into TemperatureProfilerMeasurement(FileLocation, AssetID, MeasurementDateTime)"
    insert_measurement_stmt_values = " VALUES "
    insert_measurement_stmt_final = ""
    insert_gate_stmt_cols = """INSERT into TemperatureProfilerGateResponse
        (MeasurementID, GateNum, HT, T, Tc, W, `CNT-T`, `CNT-Tc`, `CNT-W`, `SNRT`, `SNRTc`, `SNRW`)"""
    insert_gate_stmt_final = ""
    date_time = None
    asset_id = getAssetID(filepath)
    measurement_id = None
    for row in data:
        row_num += 1
        row_arr = row.split()
        if row_num < 5 or (row_num >= 6 and row_num <= 11):
            # nothing we need here
            continue
        elif row_num == 5:
            # date time in raw
            date = "/".join(row_arr[:3])
            time = ":".join(row_arr[3:6])
            date_time_str = date + " " + time
            date_time = datetime.strptime(
                date_time_str, "%y/%m/%d %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
            # We have enough to insert into tempProfilerMeasurement table
            insert_measurement_stmt_values += "('{}', {}, '{}')".format(
                filepath, str(asset_id), date_time)
            insert_measurement_stmt_final += insert_measurement_stmt_cols + \
                insert_measurement_stmt_values
            num_insertions += cur.execute(insert_measurement_stmt_final)
            measurement_id = getMaxMeasurementID(filepath)
            if not measurement_id:
                logger.error("Could not get measurement ID. Exiting.")
                return 0
        else:  # gate response data
            if len(row_arr) == 1:
                break
            gate_num += 1
            insert_gate_stmt_values = " VALUES "
            # join for insert statement
            insert_gate_stmt_values += "({}, {}, {})".format(measurement_id, gate_num,
                                                             ", ".join(row_arr))
            insert_gate_stmt_final = insert_gate_stmt_cols + insert_gate_stmt_values
            try:
                num_insertions += cur.execute(insert_gate_stmt_final)
            except Exception as e:
                logger.error(e)
    try:
        if (num_insertions != gate_num + 1):
            raise Exception("{} dropped insertions".format(
                gate_num + 1 - num_insertions))
    except Exception as e:
        logger.error(e)
        logger.error("Could not insert data.")
    conn.commit()
    return num_insertions


"""
Parses data from a CSV and uploads it into the database. Returns the number of
successful insertions in the database..
"""
def uploadCSV(csv_data):
    temp_profiler_instrument = {
        "asset_id": None,
        "measurement_date_time": None
    }

    insert_array = []
    line_num = 0
    num_insertions = 0
    for row in csv_data:
        line_num += 1
        if line_num == 1:
            # remove leading zero
            temp_profiler_instrument['asset_id'] = row[0][1:]
        elif line_num == 2:
            temp_profiler_instrument['measurement_date_time'] = datetime.strftime(
                    datetime.strptime(row[0], "%d/%m/%Y %H:%M:%S"), "%Y-%m-%d %H:%M:%S")
        elif line_num >= 3 and len(row) != 1:
            if line_num == 3:
                insert_measurement_stmt = """INSERT INTO TemperatureProfilerMeasurement(AssetId, FileLocation, MeasurementDateTime)
                                        VALUES({}, '{}', '{}')""".format(temp_profiler_instrument['asset_id'], filepath, temp_profiler_instrument['measurement_date_time'])
                result = cur.execute(insert_measurement_stmt)
                measurementID = getMaxMeasurementID(filepath)
                if not measurementID:
                    logger.error("Could not get measurement ID. Exiting.")
                    sys.exit()
            else:
                insert_stmt = """INSERT INTO 
                TemperatureProfilerGateResponse
                (MeasurementID, GateNum, HT, `HT_QCFLAG`, T, `T_QCFLAG`, Tc, 
                `Tc_QCFLAG`, W, `W_QCFLAG`, SNRT, `SNRT_QCFLAG`, SNRTc, 
                `SNRTc_QCFLAG`, SNRW, `SNRW_QCFLAG`, `CNT-T`, `CNT-T_QCFLAG`,
                `CNT-Tc`, `CNT-Tc_QCFLAG`, `CNT-W`, `CNT-W_QCFLAG`)
                        VALUES({}, {});""".format(measurementID, ", ".join(row[1:]))  # skip row[0] b/c it's the row identifier
                insert_array.append(insert_stmt)
                num_insertions += cur.execute(insert_stmt)
    try:
        if num_insertions < len(insert_array):
            raise Exception("{} dropped execution(s)".format(
                str(len(insert_array) - num_insertions)))
        elif result != 1:
            raise Exception("Could not insert Profiler Measurement.")
    except Exception as e:
        print("Failed to execute all insertions for file")
        print(e)
    
    conn.commit()
    return num_insertions + result


"""
Reads a file from a bucket and parses it depending on the file extension.
"""
def bucket_read(fileName):
    global filepath
    filepath = fileName
    try:
        res = s3_client.get_object(Bucket=BUCKET, Key=fileName)
    except Exception as e:
        print("Could not read {} from bucket.".format(fileName))
        return 0
    logger.info("Parsing {}".format(fileName))
    if ".raw" in fileName:
        lines = res['Body'].read().decode('utf-8').split('\n')
        insertions = uploadRAW(lines)
    else:
        print("CSV detected. Parsing data.")
        lines = res['Body'].read().decode('utf-8').split('\n')
        lines = [line.split(",") for line in lines]
        if len(lines[len(lines) - 1]) == 1:
            lines.pop(len(lines) - 1)
            print("Removing empty line at the end...")
        insertions = uploadCSV(lines)
    return insertions
