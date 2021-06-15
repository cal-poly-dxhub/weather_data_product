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
s3_client = boto3.client('s3')
fileLocation = ""


""" Initiate DB Connection """
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

""" Finish Initiation of DB """


def lambda_handler(event, context):
    successful_inserts = 0
    try:
        key = event['Records'][0]['s3']['object']['key']
        dupl = check_duplicate(key)
        if (dupl != 0):  # dupl > 0 indicates file exists in db
            print("File already in database. Exiting")
            conn.close()
            return None
        successful_inserts = bucket_read(key)
    except Exception as e:
        logger.error("key: {}".format(key))
        logger.error(e)
        sys.exit()

    print("{0} was parsed with {1} total insertion(s)".format(
        key, str(successful_inserts)))
    # bucket_read()
    conn.close()
    return None


def check_duplicate(key):
    select_stm = """Select FileLocation from AsosMeasurements
    where FileLocation = '{}'""".format(key)
    res = cur.execute(select_stm)
    if (res == 0):
        return 0
    return cur.fetchone()[0]


# grabs assetID for an ASOS instrument with asset_name
def get_assetID(asset_name):
    res = 0
    select_stm = "SELECT AssetID from AsosInstrument where Name = '{}'".format(
        asset_name)
    res = cur.execute(select_stm)
    if res < 1:
        print("Could not fetch from database asset_name: {}".format(asset_name))
        sys.exit(-1)
    return cur.fetchone()[0]


# parses the asset_name from the filename and sends to get_assetID
def get_assetname_from_filename(filename):
    asset_name = ""
    if "ASOS_AIRFLD" in filename:
        asset_name = "ASOS_AIRFLD"
    elif "ASOS_SLC4" in filename:
        asset_name = "ASOS_SLC4"
    elif "ASOS_MM" in filename:
        asset_name = "ASOS_MM"
    else:
        print("No support for assetID.")
        sys.exit(-1)
    return get_assetID(asset_name)


"""
Parses the necessary information from an ASOS raw file for successful db 
insertion. Each Asos file represents one insertion into AsosMeasurements.

A note about raw files:
All data is printed onto one line for each raw file making parsing a bit more 
difficult due to the non-uniform spacing. With that, a regEx is used to strip
the column names and produces an array called data containing 15 entries. 
Each entry (except the last) is required for the database.

Data[0] -> Datetime and location, though location isn't needed.
Data[1:12] -> Each index i of data corresponds to index i-1 in the decoder array.
             Meaning, Data[5] would represent Decoder[4], representing sea_level_press.
             Note: Some entries of decoder are arrays. This is due to multiple db
             column values being placed onto one line in a raw file (namely, Dew/Temp and Wind).
             To account for this, the parser strips both values for the db. 
Data[13] -> Contains the remarks of an Asos measurement. See metar_decoder for 
            a translation of these remarks.

Data[14] -> Contains the METAR measurements from the file. I am unsure at this 
            time if these values are needed, since the raw files contain the necessary 
            db information above the METAR statement.
            
Lastly, ASCII values in raw files may be left blank if no values are present.
However, numerical values may also be left blank, but a unit of 'M' is still 
present. So a valid numerical measurement could be 360/09, M / 09, M / M, or 
M / M C.
If a value is not present, it is not inserted into the database.
"""


def uploadRAW(raw_data):
    res = 0
    parsed = {}
    insert_stmt_cols = "INSERT INTO AsosMeasurements("
    insert_stmt_vals = "VALUES ("
    # decoder maps raw file data to column names using line no.
    decoder = ['`asos_sky_condition_report`', '`asos_visibility`', '`asos_tower_visibility`', '`asos_present_weather`', '`asos_sea_level_pressure`', ['`asos_temperature`', '`asos_dew_point`'],
               '`asos_relative_humidity`', ['`asos_wind_direction`', '`asos_wind_speed`'], ['`asos_magnetic_wind_direction`', '`asos_magnetic_wind_speed`'], '`asos_altimeter_pressure_setting`', '`asos_density_altitude`', '`asos_pressure_altitude`', '`asos_remark`']
    data = re.split(
        r'SKY|VSBY|TWR\sVSBY|PREWX|SEA\sPRES|TEMP/DP|REL\sHUM|WIND|MAG\sWIND|ALT\sSET|DEN\sALT|PRES\sALT|REMARKS|METAR', raw_data)
    timestamp = data[0].split()
    if len(timestamp) < 2:
        print("Could not parse file.")
        sys.exit(-1)
    DateTime = datetime.strptime(
        timestamp[1] + " " + timestamp[0], "%m/%d/%y %H:%M:%S")
    assetID = get_assetname_from_filename(fileLocation)
    # parse data into parsed dict.
    for i in range(1, 13):
        if i != 6 and i != 8 and i != 9:
            if i == 1 or i == 4:
                parsed[decoder[i-1]] = """'{}'""".format(data[i].strip())
            else:
                parsed[decoder[i-1]] = data[i].strip()

        else:  # handle multiple values
            temp = data[i].strip()
            temp = temp.split("/")
            parsed[decoder[i-1][0]] = temp[0].strip()
            parsed[decoder[i-1][1]] = temp[1].strip()
    # add remarks into dict.
    parsed[decoder[12]] = "'{}'".format(data[13].strip())
    # generate insert statement
    insert_stmt_cols += "AssetID, FileLocation, MeasurementDateTime"
    insert_stmt_vals += "{}, '{}', '{}'".format(
        assetID, fileLocation, DateTime)
    for key in parsed:
        val = parsed[key]
        # remove empty values from insertion
        if (parsed[key] == "''" or parsed[key] == "" or parsed[key] == "M" or parsed[key] == "M C"):
            continue
        # strip units of SM
        elif ("SM" in parsed[key]):
            val = parsed[key][:-2]
        # remove highest-recorded gust
        elif ("G" in parsed[key]):
            val = parsed[key].index("G")
            val = parsed[key][: val]
        insert_stmt_cols += ", {}".format(key)
        insert_stmt_vals += ", {}".format(val)
    # add closing parens
    insert_stmt_cols += ")"
    insert_stmt_vals += ")"
    # combine the two
    final_insert_stmt = insert_stmt_cols + insert_stmt_vals
    print(final_insert_stmt)
    res = cur.execute(final_insert_stmt)

    if (res > 0):
        conn.commit()
    else:
        print("Could not insert into database.")
    return res


def uploadCSV(csv_data):
    # these map codes to an array containing the column names.
    decoder = {'1000': ['`asos_sky_condition_report`',
                        '`asos_sky_condition_report_QCFLAG`'],
               '1001': ['`asos_visibility`', '`asos_visibility_QCFLAG`'],
               '1002': ['`asos_tower_visibility`', '`asos_tower_visibility_QCFLAG`'],
               '1003': ['`asos_present_weather`', '`asos_present_weather_QCFLAG`'],
               '1004': ['`asos_urgent_weather`', '`asos_urgent_weather_QCFLAG`'],
               '1005': ['`asos_sea_level_pressure`', '`asos_sea_level_pressure_QCFLAG`'],
               '1007': ['`asos_dew_point`', '`asos_dew_point_QCFLAG`'],
               '1008': ['`asos_relative_humidity`', '`asos_relative_humidity_QCFLAG`'],
               '1009': ['`asos_wind_direction`', '`asos_wind_direction_QCFLAG`'],
               '1010': ['`asos_wind_speed`', '`asos_wind_speed_QCFLAG`'],
               '1011': ['`asos_magnetic_wind_direction`', '`asos_magnetic_wind_direction_QCFLAG`'],
               '1012': ['`asos_magnetic_wind_speed`', '`asos_magnetic_wind_speed_QCFLAG`'],
               '1013': ['`asos_altimeter_pressure_setting`', '`asos_altimeter_pressure_setting_QCFLAG`'],
               '1014': ['`asos_density_altitude`', '`asos_density_altitude_QCFLAG`'],
               '1015': ['`asos_pressure_altitude`', '`asos_pressure_altitude_QCFLAG`'],
               '1016': ['`asos_remark`', '`asos_remark_QCFLAG`'],
               '1018': ['`asos_rain_rate`', '`asos_rain_rate_QCFLAG`'],
               '1020': ['`asos_temperature`', '`asos_temperature_QCFLAG`']}
    row_number = 0
    num_insertions = 0  # this should only increment by one per file
    insert_statement_columns = "INSERT into AsosMeasurements"
    insert_statement_values = "VALUES"
    insert_statement_final = ""
    for row in csv_data:
        row_number += 1
        if row_number == 1:
            insert_statement_columns += "(AssetID"
            insert_statement_values += "({}".format(row[0][1:])
            # place file location while we are at it
            insert_statement_columns += ", FileLocation"
            insert_statement_values += ", '{}'".format(fileLocation)
        elif row_number == 2:
            insert_statement_columns += ", MeasurementDateTime"
            insert_statement_values += ", '{}'".format(datetime.strptime(
                row[0], '%d/%m/%Y %H:%M:%S').strftime('%Y-%m-%d %H:%M:%S'))
        else:
            measurement = row[2]
            qc_flag = row[3]
            if len(measurement) == 0:
                measurement = 'NULL'
            # format column value
            insert_statement_columns += ", {}".format(decoder[row[0]][0])
            # format column QC flag
            insert_statement_columns += ", {}".format(decoder[row[0]][1])
            if (row[0] == '1000' or row[0] == '1003' or row[0] == '1004' or row[0] == '1016') and measurement != 'NULL':
                # insert measurement as a string
                insert_statement_values += ", '{}'".format(measurement)
            else:
                # insert null
                insert_statement_values += ", {}".format(measurement)
            insert_statement_values += ", {}".format(qc_flag)
    # add closing parens to insert statement columns/values
    insert_statement_columns += ") "
    insert_statement_values += ")"
    insert_statement_final = insert_statement_columns + insert_statement_values
    # execute statement into database
    num_insertions += cur.execute(insert_statement_final)
    if (num_insertions != 1):
        print("Could not insert into database.")
        return 0
    else:
        conn.commit()
        return num_insertions


"""
Reads a file from a bucket and parses it depending on the file extension.
"""


def bucket_read(fileName):
    global fileLocation
    fileLocation = fileName
    res = s3_client.get_object(Bucket=BUCKET, Key=fileName)
    if ".raw" in fileName:
        lines = res['Body'].read().decode('utf-8')
        insertions = uploadRAW(lines)
    else:
        lines = res['Body'].read().decode('utf-8').split('\n')
        lines = [line.split(",") for line in lines]
        if len(lines[len(lines) - 1]) == 1:
            lines.pop(len(lines) - 1)
            print("Removing empty line at the end...")
        insertions = uploadCSV(lines)
    return insertions
