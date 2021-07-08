import json
import pymysql
import boto3
import sys
import re
from datetime import datetime
from utility import get_secret, get_logger

logger = get_logger()
BUCKET = "dxhub-vafb-xui-weather-data-raw"
SECRET_NAME = "Aurora"
SECRET_NAME_2 = "Aurora-reader"
s3_client = boto3.client('s3')
fileLocation = ""


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
            print("File already in database. Exiting")
            return None
        else:
            successful_inserts = bucket_read(key)
    except Exception as e:
        logger.error("key: {}".format(key))
        logger.error(e)

    print("{0} was parsed with {1} total insertion(s)".format(
        key, str(successful_inserts)))
    
    return None


def check_duplicate(key):
    select_stm = """Select FileLocation from WindProfilerMeasurement 
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
    asset_select = "SELECT AssetID FROM ProfilerInstrument WHERE Name = '{}'".format(
        assetName)
    cur2.execute(asset_select)
    return cur2.fetchone()[0]


"""
Since measurement ID auto-increments in database, we should get the max mID before
insertion.
"""


def getMaxMeasurementID():
    measurement_select = "SELECT MAX(MeasurementID) From WindProfilerMeasurement"
    cur.execute(measurement_select)
    return cur.fetchone()[0]

"""
Unfortunately, asset names aren't in the raw files so we have to parse from
the file name.
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
This function parses a raw file containing 915 wind data. A note about
raw files (indexing from 1):

row 5: date/time in format YY MM DD HH MM SS and some number at the end
row 6: Number of radials is the middle value of the 3 numbers on this line
row 10: AZ/EL data for each of the radials
row 12+: gate response data in form HT SPD DIR VEL(1-N) OBS(1-N) SNR(1-N),
    where N is the number of radials.
"""
def uploadRAW(data):
    row_num = num_insertions = gate_num = 0
    insert_measurement_stmt_cols = "INSERT into WindProfilerMeasurement"
    insert_measurement_stmt_values = " VALUES "
    insert_measurement_stmt_final = ""
    # since radial count varies, we have to build our insert stmt. as we go...
    insert_gate_stmt_cols = "INSERT into WindProfilerGateResponse(MeasurementID, GateNum, HT, SPD, DIR"
    insert_gate_stmt_final = ""
    date_time = None
    asset_id = getAssetID(fileLocation)
    num_radials = None
    measurement_id = None
    for row in data:
        row_num += 1
        row_arr = row.split()
        if row_num < 5 or (row_num >= 7 and row_num <= 9) or row_num == 11:
            # nothing we need here
            continue
        elif row_num == 5:
            # date time in raw
            date = "/".join(row_arr[:3])
            time = ":".join(row_arr[3:6])
            date_time_str = date + " " + time
            date_time = datetime.strptime(
                date_time_str, "%y/%m/%d %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
        elif row_num == 6:
            # this line has the number of radials
            num_radials = int(row_arr[1])
            insert_measurement_stmt_cols += "(FileLocation, AssetID, MeasurementDateTime"
            for item in range(1, num_radials + 1):
                insert_measurement_stmt_cols += ", `AZ-{}`, `EL-{}`".format(
                    str(item), str(item))
                insert_gate_stmt_cols += ", `VEL-{0}`, `OBS-{0}`, `SNR-{0}`".format(
                    str(item))
            insert_measurement_stmt_cols += ")"
            insert_gate_stmt_cols += ")"
        elif row_num == 10:
            # measurement data
            insert_measurement_stmt_values += "('{}', {}, '{}', ".format(
                fileLocation, str(asset_id), date_time)
            insert_measurement_stmt_values += ", ".join(row_arr)
            insert_measurement_stmt_values += ")"
            insert_measurement_stmt_final += insert_measurement_stmt_cols + \
                insert_measurement_stmt_values
            # at this point in row_num 10, we have enough data to insert into our db.
            num_insertions += cur.execute(insert_measurement_stmt_final)
            measurement_id = getMaxMeasurementID()
            print("Measurement ID: " + str(measurement_id))
        else:  # gate response data
            if len(row_arr) == 1:
                break
            gate_num += 1
            radial_index = 3 # radial values begin at value 4 in each row.
            insert_gate_stmt_values = " VALUES "
            radial_vel = row_arr[radial_index: radial_index + num_radials]
            radial_obs = row_arr[radial_index +
                                 num_radials: radial_index + num_radials * 2]
            radial_snr = row_arr[radial_index +
                                 num_radials * 2: radial_index + num_radials * 3]
            # join for insert statement
            insert_gate_stmt_values += "({}, {}, {}".format(measurement_id,gate_num, 
                                                            ", ".join(row_arr[:radial_index]))
            for i in range(num_radials):
                insert_gate_stmt_values += ", {}, {}, {}".format(
                    radial_vel[i], radial_obs[i], radial_snr[i])
            insert_gate_stmt_values += ")"
            insert_gate_stmt_final = insert_gate_stmt_cols + insert_gate_stmt_values
            try:
                num_insertions += cur.execute(insert_gate_stmt_final)
            except Exception as e:
                logger.error(e)
            # print(insert_measurement_stmt_final)
            # print(insert_gate_stmt_cols)
    try:
        if (num_insertions != gate_num + 1):
            raise Exception("{} dropped insertions".format(gate_num + 1 - num_insertions))
        else:
            conn.commit()
    except Exception as e:
        print(e)
        print("Could not insert data.")
    
    return num_insertions


"""
Parses data from a CSV and uploads it into the database. Returns the number of
successful insertions in the database.

NOTE: Wind CSV files need to account for the number of radials in the file,
given on line 4 of the CSV.
"""


def uploadCSV(csv_data):
    wind_profiler_instrument = {
        "asset_id": None,
        "measurement_date_time": None
    }
    measurementID =-1
    insert_array = []
    line_num = 0
    num_insertions = 0
    num_radials = 0
    gate_num = 0
    radials = []
    insert_measurement = ""
    insert_gate_response = ""
    for row in csv_data:
        line_num += 1
        if line_num == 1:
            # grab assetID, remove leading zero in csv.
            wind_profiler_instrument['asset_id'] = row[0][1:]
        elif line_num == 2:
            # grab datetime
            wind_profiler_instrument['measurement_date_time'] = datetime.strftime(
                datetime.strptime(row[0], "%d/%m/%Y %H:%M:%S"), "%Y-%m-%d %H:%M:%S")
        elif line_num ==3:
            continue
        elif line_num == 4:
            # get number of radials to determine insert_statement columns
            num_radials = int(row[1])
            if num_radials > 5:
                num_radials = 5
            for i in range(1,num_radials + 1):
                radials.append("`AZ-{}`".format(str(i)))
                radials.append("`EL-{}`".format(str(i)))
            insert_measurement = """INSERT INTO WindProfilerMeasurement
            (FileLocation, AssetID, MeasurementDateTime, {}) """.format(", ".join(radials))
        elif line_num == 5:
            values = row[1: 1 + num_radials * 2]
            insert_measurement += """VALUES ('{}',{},'{}',{})""".format(fileLocation, wind_profiler_instrument['asset_id'],wind_profiler_instrument['measurement_date_time'],", ".join(values))
            num_insertions += cur.execute(insert_measurement)
            measurementID = getMaxMeasurementID()
        else:
            gate_num += 1
            # we are at the gate data
            gate_response_columns = [] # stores non-variable columns
            gate_response_radial_columns = [] # stores variable column names
            gate_response_columns.append("MeasurementID")
            gate_response_columns.append("GateNum")
            gate_response_columns.append("HT")
            gate_response_columns.append("`HT_QCFLAG`")
            gate_response_columns.append("SPD")
            gate_response_columns.append("`SPD_QCFLAG`")
            gate_response_columns.append("DIR")
            gate_response_columns.append("`DIR_QCFLAG`")
            insert_gate_response = """INSERT INTO WindProfilerGateResponse({},""".format(", ".join(gate_response_columns))
            for i in range(1,num_radials + 1):
                gate_response_radial_columns.append("`VEL-{}`".format(str(i)))
                gate_response_radial_columns.append("`VEL-{}_QCFLAG`".format(str(i)))
                gate_response_radial_columns.append("`OBS-{}`".format(str(i)))
                gate_response_radial_columns.append("`OBS-{}_QCFLAG`".format(str(i)))
                gate_response_radial_columns.append("`SNR-{}`".format(str(i)))
                gate_response_radial_columns.append("`SNR-{}_QCFLAG`".format(str(i)))
            insert_gate_response += """{})""".format(", ".join(gate_response_radial_columns))
            # items in row: 8 + (6 columns per radial) * num radials
            insert_gate_response += """VALUES ({}, {})""".format(str(measurementID),", ".join(row[1: 8 + num_radials * 6]))
            num_insertions += cur.execute(insert_gate_response)
    try:
        if (num_insertions != gate_num + 1):
            print(gate_num, num_insertions)
            raise Exception("{} dropped insertions".format(gate_num + 1 - num_insertions))
        else:
            conn.commit()
    except Exception as e:
        print(e)
        print("Could not insert data.")
        return 0

    
    return num_insertions


"""
Reads a file from a bucket and parses it depending on the file extension.
"""


def bucket_read(fileName):
    global fileLocation
    fileLocation = fileName
    try:
        res = s3_client.get_object(Bucket=BUCKET, Key=fileName)
    except Exception as e:
        logger.error(e)
        return 0
    if ".raw" in fileName:
        lines = res['Body'].read().decode('utf-8').split('\n')
        insertions = uploadRAW(lines)
    else:
        lines = res['Body'].read().decode('utf-8').split('\n')
        lines = [line.split(",") for line in lines]
        if len(lines[len(lines) - 1]) == 1:
            lines.pop(len(lines) - 1)
            print("Removing empty line at the end...")
        insertions = uploadCSV(lines)
    return insertions
