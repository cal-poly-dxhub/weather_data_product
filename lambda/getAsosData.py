import json
import sys
import pymysql
from utility import get_logger, get_secret
from datetime import datetime

SECRET_NAME = 'Aurora'
logger = get_logger()
# initialize database connection
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
    logger.error("could not connect to the database")
    logger.error(str(e))
    sys.exit()

# finish database initialization


def lambda_handler(event, context):
    logger.info("event info: {}".format(event))
    response = generate_response()
    body = {}
    endpoint = None
    instrument = None
    """ Begin Parsing Route and Query Strings """
    try:
        # example route: asos/{proxy+}
        path_args = event['path'].split("/")[1:]
        instrument = path_args[0]
        if len(path_args) > 2:
            endpoint = path_args[1]
    except Exception as e:
        logger.error("parse path arguments: {}".format(e))
        return request_error(response, 500, "Could not parse path arguments.")

    if instrument == 'asos':
        try:
            if not endpoint or len(endpoint) == 0:
                logger.info("Grabbing asos instrument data.")
                body = get_asos_instruments()
            elif endpoint == 'snapshot':
                logger.info("Grabbing asos snapshot.")
                body = get_asos_snapshot()
            else:
                return request_error(response, 500, "This endpoint /assetID is unimplemented.")
        except Exception as e:
            logger.error("Error in {}: {}".format(
                "snapshot" if endpoint == "snapshot" else "assetID", e))
            return request_error(response, 500, "Could not grab asos data.")
    else:
        logger.error("Bad endpoint: {}".format(instrument))
        return request_error(response, 400, "Bad Request: Endpoint '{}' is not supported for asos".format(instrument))
    response['body'] = json.dumps(body)

    return response


""" Retrieves information regarding ASOS assets for the /asos/ endpoint """


def get_asos_instruments():
    list_asos_stmt = """  SELECT    `AsosInstrument`.`AssetID` as asset_id,
                                    `AsosInstrument`.`TowerID` as tower_id,
                                    `AsosInstrument`.`Name` as asset_name
                          FROM AsosInstrument as AsosInstrument
                     """
    cur.execute(list_asos_stmt)
    asos = cur.fetchall()
    response = []

    for instrument in asos:
        obj = {
            "asset_id": instrument[0],
            "archive_number": instrument[1],
            "asset_name": instrument[2]
        }
        response.append(obj.copy())
    return response


""" 
Retrieves measurement data for an Asos instrument with the provided AssetID. If
start_date_time_utc or end_date_time_utc arguments are provided, results are filtered
to be after, before, or between these dates.
"""


def get_asos_measurements(assetID, start_date_time_utc=None, end_date_time_utc=None):
    asos_attributes = ["`MeasurementDateTime`", "`asos_sky_condition_report`",
                       "`asos_sky_condition_report_QCFLAG`", "`asos_visibility`", "`asos_visibility_QCFLAG`", "`asos_tower_visibility`",
                       "`asos_tower_visibility_QCFLAG`", "`asos_present_weather`", "`asos_present_weather_QCFLAG`", "`asos_urgent_weather`",
                       "`asos_urgent_weather_QCFLAG`", "`asos_sea_level_pressure`", "`asos_sea_level_pressure_QCFLAG`", "`asos_dew_point`",
                       "`asos_dew_point_QCFLAG`", "`asos_relative_humidity`", "`asos_relative_humidity_QCFLAG`", "`asos_wind_direction`",
                       "`asos_wind_direction_QCFLAG`", "`asos_wind_speed`", "`asos_wind_speed_QCFLAG`", "`asos_magnetic_wind_direction`",
                       "`asos_magnetic_wind_direction_QCFLAG`", "`asos_magnetic_wind_speed`", "`asos_magnetic_wind_speed_QCFLAG`",
                       "`asos_altimeter_pressure_setting`", "`asos_altimeter_pressure_setting_QCFLAG`", "`asos_density_altitude`",
                       "`asos_density_altitude_QCFLAG`", "`asos_pressure_altitude`", "`asos_pressure_altitude_QCFLAG`", "`asos_remark`",
                       "`asos_remark_QCFLAG`", "`asos_rain_rate`", "`asos_rain_rate_QCFLAG`", "`asos_temperature`", "`asos_temperature_QCFLAG`"]

    select_stmt = "SELECT {} FROM `AsosMeasurements` WHERE `AsosMeasurements`.`AssetID` = %s ".format(
        ",".join(asos_attributes))
    args = [assetID]
    if start_date_time_utc:
        select_stmt += "AND `AsosMeasurements`.`MeasurementDateTime` >= %s "
        args.append(start_date_time_utc)
        if start_date_time_utc == end_date_time_utc:
            select_stmt += " - INTERVAL 1 HOUR "
    if end_date_time_utc:
        select_stmt += "AND `AsosMeasurements`.`MeasurementDateTime` <= %s "
        args.append(end_date_time_utc)
    cur.execute(select_stmt, args)
    response = cur.fetchall()
    metadata = {}
    measurement_record = {}  # represents an entry in the db
    measurements = []  # contains multiple db entries
    for record in response:
        for i in range(len(asos_attributes)):
            if i != 0:
                val = record[i]
                if type(val) is bytes:
                    val = int(str(val)[-2])
                measurement_record[asos_attributes[i]] = val
            else:
                metadata["metadata"] = {"measurement_date_time": record[0].strftime(
                    "%Y-%m-%d %H:%M:%S")}
        measurements.append({"metadata": metadata["metadata"],
                            "gateResponses": [measurement_record.copy()]})
    return measurements


"""
Captures a 'snapshot' of data for every Asos instrument in the database. Due to the 
measurement resolution (every minute), only an hour's worth of data is provided.
This hour is from 1 hour before and up to the most recent measurement date time 
in the database for each asset.
"""


def get_asos_snapshot():
    recent_measurement_stmt = """ SELECT  `AsosMeasurements`.`AssetID`, 
                                            `AsosInstrument`.`Name`,
                                            MAX(`AsosMeasurements`.`MeasurementDateTime`) as MeasurementDateTime,
                                            Tower.MSLElevation as `asset_height`
                                    FROM `AsosMeasurements`
                                    JOIN `AsosInstrument` on `AsosInstrument`.`AssetID` = `AsosMeasurements`.`AssetID`
                                    Left Join Tower on Tower.ArchiveNumber = AsosInstrument.TowerID
                                    GROUP BY `AsosMeasurements`.`AssetID` """

    measurements = []
    cur.execute(recent_measurement_stmt)
    response = cur.fetchall()
    for assetID in response:
        # Interval 1 hour will only grab the last hour of data because of the large quanitity of entries.
        start_time = assetID[2].strftime(
            "%Y-%m-%d %H:%M:%S")
        location = assetID[1].split("_")
        temp_data = {
            "instrument": {
                "asset_ID": assetID[0],
                "asset_height": assetID[3],
                "location": location[1]
            },
            "measurements": get_asos_measurements(assetID[0], start_time, start_time)
        }
        measurements.append(temp_data.copy())

    return measurements


def request_error(response, status_code, body):
    response['statusCode'] = str(status_code)
    error = {"message": body}
    logger.error(body)
    response['body'] = json.dumps(error)
    return response


def generate_response():
    return {
        "isBase64Encoded": "false",
        "statusCode": "200",
        "headers": {
            "Accept": "*/*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Date,X-Amzn-Trace-Id,x-amz-apigw-id,x-amzn-RequestId,Authorization",
        },
        "body": None
    }
