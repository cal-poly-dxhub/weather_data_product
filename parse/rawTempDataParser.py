"""
File that parses 915-Profiler RAW Temperature data.
"""

import re
import sys
from db_config import RDS_HOST, NAME, PASSWORD, DB_NAME
import pymysql
import boto3

BUCKET = "dxhub-vafb-xui-weather-data-raw"
s3 = boto3.client('s3')


try:
    conn = pymysql.connect(host=RDS_HOST, user=NAME,
                           password=PASSWORD, database=DB_NAME, connect_timeout=5)
    cur = conn.cursor()
except Exception as e:
    print("could not connect to the database")
    print(str(e))
    sys.exit()

raw_file_path = "./915ProfilerTempCNS.915_DIOSA.20200201001617.raw"

NUM_COLUMNS = -1  # only modify in genRegEx function!!
COLUMN_NAMES = []  # only modify in genRegEx function!!

"""
Generates the regular expression used to find the numerical data from columns in the file.
Also sets the global value of columns and column names to help with formatting later.
Note, datetime regex should apply for all files so is left for parseRawTempFile().
"""


def genRegEx(file):
    global NUM_COLUMNS, COLUMN_NAMES
    if "WST" in file:
        NUM_COLUMNS = 10
        COLUMN_NAMES = ["HT", "T", "Tc", "W", "CNT-T",
                        "CNT-Tc", "CNT-W", "SNRT", "SNRTc", "SNRW"]
        return (r"\s*HT\s*T\s*Tc\s*W\s*CNT\sCNT\sCNT\sSNR\sSNR\sSNR\n"), "915_WST"
    elif "DIOSA" in file:
        NUM_COLUMNS = 10
        COLUMN_NAMES = ["HT", "T", "Tc", "W", "CNT-T",
                        "CNT-Tc", "CNT-W", "SNRT", "SNRTc", "SNRW"]
        return (r"\s*HT\s*T\s*Tc\s*W\s*CNT\s*SNR\s*\n"), "915_DIOSA"
    else:
        print("Could not generate RegEx. Exiting.")
        sys.exit(-1)


"""
Uses a regular expression to parse data found after the columns indicated
in the raw data file. Data found is then stored into data_numbers array
and returned.

File input variable is path to the raw data file.
"""


def parseRawTempFile(file):
    with open(file, "r") as raw:
        raw_data = raw.read()
        try:
            regExString, asset_name = genRegEx(file)
            # split file into two: before and after column names
            raw_data_split = re.split(regExString, raw_data)
            date_time = re.findall(
                r"([0-9][0-9])\s(0[0-9]|1[0-2])\s([0-2][0-9]|3[0-1])\s([0-1][0-9]|2[0-3])\s([0-5][0-9])\s([0-5][0-9])", raw_data_split[0])[0]
         # grab data after columns
            data_numbers = re.findall(
                r"[-+]?\d*\.\d+|[-+]?\d+", raw_data_split[1])
        except Exception as e:
            print("Exception occured while parsing file.")
            print(e)
            sys.exit(-1)
    if (len(asset_name) > 0 and len(date_time) == 6 and len(data_numbers) > 0):
        sensor_info = [asset_name, date_time]
        return data_numbers, sensor_info
    else:
        print("Could not parse data correctly. Exiting.")
        sys.exit(-1)


"""
Enters the parsed data from the raw file into a python dictionary.
ht_dict's key values are the sensor height, and the value is an array
containing the sensor data. Each index of the array corresponds to a
column in the raw file. Return value is the dictionary.

'Parsed' input variable is data returned from parseRawTempFile().

See column names set in genRegex() for index meaning.
"""


def formatParsedData(parsed):
    global NUM_COLUMNS
    ht_dict = {}
    key_counter = 0
    for data in parsed:
        if key_counter % NUM_COLUMNS == 0:
            # we are at height value
            ht_dict[data] = []
            last_key_added = data
        else:
            # append sensor data to height value
            ht_dict[last_key_added].append(data)
        key_counter += 1
    return ht_dict


"""
Returns the assetID for the Profiler Instrument.
"""


def getAssetIDFromDB(assetName):
    # hopefully we have connection cursor defined already
    asset_select = "SELECT AssetID FROM ProfilerInstrument WHERE Name = '{}'".format(
        assetName)
    # curr.execute(select_statement)
    # return cur.fetchone()[0]
    return 123


"""
Since measurement ID auto-increments in database, we should get the max mID before 
insertion. 
"""


def getMaxMeasurementID():
    measurement_select = "SELECT MAX(MeasurementID) From TemperatureProfilerMeasurement"
    curr.execute(measurement_select)
    return cur.fetchone()[0]
    return "12123"


"""
Generates SQL statements needed to input data from file into the database.

Data_dict is dictionary returned from formatParsedData(), and sensor_info
should be an array containing the asset name[0] and dateTime[1] recorded.
"""


def prepareInsertStatement(data_dict, sensor_info):
    gate_num = 1
    data_insert_array = []
    assetID = getAssetIDFromDB(sensor_info[0])
    instrument_name = "TemperatureProfilerMeasurement(AssetID, MeasurementDateTime)"
    # ideally we would use a built in function, change later.
    format_date = "{}-{}-20{} {}:{}:{}".format(
        sensor_info[1][1], sensor_info[1][2], sensor_info[1][0], sensor_info[1][3], sensor_info[1][4], sensor_info[1][5])
    insert_instrument = "INSERT INTO {} VALUES('{}', '{}')".format(
        instrument_name, assetID, format_date)
    # cur.execute(insert_instrument)
    measurementID = getMaxMeasurementID()
    for data in data_dict:
        insert_data = "INSERT INTO TemperatureProfilerGateResponse(MeasurementID, GateNum, {}) VALUES({}, {}, {}, {})".format(
            ", ".join(COLUMN_NAMES), measurementID, gate_num, data, ", ".join(data_dict[data]))
        data_insert_array.append(insert_data)
        gate_num += 1

    try:
        response = cur.executemany(data_insert_array)
        if response < len(data_insert_array):
            raise Exception("{} dropped execution(s)".format(
                str(len(data_insert_array) - response)))
    except Exception as e:
        print("Failed to execute all insertions for file:")
        print(e)

    # print(insert_instrument)
    # for statement in data_insert_array:
        # print(statement)


"""
Wrapper for main parsing
"""


def beginParsing(file_key):
    response = s3.get_object(Bucket=BUCKET, Key=file_key)
    print(response)


if __name__ == "__main__":
    successful_inserts = 0
    response = s3.list_objects(
        Bucket=BUCKET, Prefix="915-profiler/temp/", MaxKeys=1000)

    file_names = [val['Key'] for val in response['Contents']]
    csv = [file for file in file_names if file.endswith(".csv")]
    raw = [file for file in file_names if file.endswith(".raw")]
    # this only parses raw at the moment
    for measurement in raw:
        beginParsing(raw)
    #to_format, sensor_info = parseRawTempFile(raw_file_path)
    #data_dict = formatParsedData(to_format)
    #prepareInsertStatement(data_dict, sensor_info)
