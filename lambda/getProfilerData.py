import json
import logging
import sys
import types
import pymysql
from datetime import datetime
from utility import get_logger, get_secret

# create logging instance
logger = get_logger()

SECRET_NAME = 'Aurora'

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
    print("could not connect to the database")
    print(str(e))
    sys.exit()

# finish database initialization


def lambda_handler(event, context):
    logger.info("event info: {}".format(event))

    response = generate_response()
    body = {}

    """ Begin Parsing Route and Query Strings """
    try:
        # example route: 915-profiler/temp/{proxy+}
        endpoint = None
        path_args = event['path'].split("/")[1:]
        instrument = path_args[1]
        body['instrument'] = instrument
        if len(path_args) > 2:
            endpoint = path_args[2]
            body['endpoint'] = endpoint
    except Exception as e:
        logger.error("parse path arguments: {}".format(e))
        return request_error(response, 500, "Could not parse path arguments.")

    if instrument == "temp":
        if endpoint == None:
            body = get_profiler_data()
        elif endpoint == "snapshot":
            body = get_temp_snapshot()
        else:
            return request_error(
                response, 400, "Bad request: API does not support this endpoint: temp/{}".format(endpoint))
    elif instrument == "wind":
        if endpoint == None:
            body = get_profiler_data()
        elif endpoint == "snapshot":
            body = get_wind_snapshot()
        else:
            return request_error(
                response, 400, "Bad request: API does not support this endpoint: wind/{}".format(endpoint))
    else:
        return request_error(
            response, 400, "Bad request: API does not support this endpoint: {}".format(instrument))

    response['body'] = json.dumps(body)
    return response


def get_profiler_data():
    list_profiler_stmt = """   SELECT	`ProfilerInstrument`.`AssetID` AS asset_id,
                                        `ProfilerInstrument`.`TowerID` AS archive_num,
                                        `ProfilerInstrument`.`Name` AS asset_name
                                FROM `ProfilerInstrument`;"""
    cur.execute(list_profiler_stmt)
    profiler = cur.fetchall()
    response = []

    for instrument in profiler:
        obj = {
            "asset_id": instrument[0],
            "archive_number": instrument[1],
            "asset_name": instrument[2]
        }
        response.append(obj.copy())
    return response


def get_temp_snapshot():
    recent_measurement_stmt = """ SELECT   `TemperatureProfilerMeasurement`.`AssetID`,
					                            `instrument_name`.`TowerID`,
					                            `instrument_name`.`Name`,
						                         MAX(`TemperatureProfilerMeasurement`.`MeasurementDateTime`),
                                                 Tower.MSLElevation
                                  FROM `TemperatureProfilerMeasurement`
                                  JOIN `ProfilerInstrument` as `instrument_name` on  `instrument_name`.`AssetID` = `TemperatureProfilerMeasurement`.`AssetID`
                                  LEFT JOIN Tower on Tower.ArchiveNumber = `instrument_name`.TowerID

                                  GROUP BY `TemperatureProfilerMeasurement`.`AssetID` """
    measurements = []
    cur.execute(recent_measurement_stmt)
    response = cur.fetchall()
    for assetID in response:
        # Interval 6 hour will only grab the last 6 hours of data because of the large quanitity of entries.
        start_time = assetID[3].strftime(
            "%Y-%m-%d %H:%M:%S")
        location = assetID[2].split("_")
        temp_data = {
            "instrument": {
                "asset_ID": assetID[0],
                "location": location[1],
                "asset_height": assetID[4]
            },
            "measurements": get_temp_measurements(assetID[0], start_time, assetID[3].strftime(
                "%Y-%m-%d %H:%M:%S"))
        }
        measurements.append(temp_data.copy())

    return measurements


def get_temp_measurements(assetID, start_date_time_utc=None, end_date_time_utc=None):
    select_temp_stmt = """ SELECT  `TemperatureProfilerMeasurement`.`MeasurementID`,
                                    `TemperatureProfilerMeasurement`.`MeasurementDateTime`
                            FROM `TemperatureProfilerMeasurement`
                            WHERE `TemperatureProfilerMeasurement`.`AssetID` = %s """

    args = [assetID]
    if start_date_time_utc:
        select_temp_stmt += "AND `TemperatureProfilerMeasurement`.MeasurementDateTime >= %s "
        args.append(start_date_time_utc)
        if start_date_time_utc == end_date_time_utc:
            select_temp_stmt += " - INTERVAL 1 HOUR "

    if end_date_time_utc:
        select_temp_stmt += "AND `TemperatureProfilerMeasurement`.MeasurementDateTime <= %s "
        args.append(end_date_time_utc)

    cur.execute(select_temp_stmt, args)
    response = cur.fetchall()
    measurements = []
    for measurement in response:
        metadata = {
            "measurement_id": measurement[0],
            "measurement_date_time": str(measurement[1]),
        }

        measurements.append(
            {
                "metadata": metadata.copy(),
                "gateResponses": get_temp_gate_responses(measurement[0])
            })

    return measurements


def get_temp_gate_responses(measurement_id):
    attributes = ["GateNum", "HT", """`HT_QCFLAG`""", "T", """`T_QCFLAG`""", "Tc", """`Tc_QCFLAG`""", "W", """`W_QCFLAG`""", "SNRT", """`SNRT_QCFLAG`""",
                  "SNRTc", """`SNRTc_QCFLAG`""", "SNRW", """`SNRW_QCFLAG`""", """`CNT-T`""", """`CNT-T_QCFLAG`""", """`CNT-Tc`""", """`CNT-Tc_QCFLAG`""", """`CNT-W`""", """`CNT-W_QCFLAG`"""]

    gate_responses_stmt = """SELECT {}
                            FROM `TemperatureProfilerGateResponse`
                            WHERE MeasurementID = %s;""".format(",".join(attributes))

    cur.execute(gate_responses_stmt, [measurement_id])

    response = cur.fetchall()
    record_data = []
    gate = {}

    for gate_response in response:
        for i in range(len(attributes)):
            val = gate_response[i]
            # tinyint values in db are stored as byte string in python. So convert back to int
            if type(val) is bytes:
                val = int(str(val)[-2])
            gate[attributes[i]] = val
        record_data.append(gate.copy())

    return record_data


def get_wind_snapshot():
    recent_measurement_stmt = """ SELECT   `WindProfilerMeasurement`.`AssetID`,
					                            `instrument_name`.`TowerID`,
					                            `instrument_name`.`Name`,
						                         MAX(`WindProfilerMeasurement`.`MeasurementDateTime`) as `MeasurementDateTime`,
                                                 Tower.MSLElevation
                                  FROM `WindProfilerMeasurement`
                                  JOIN `ProfilerInstrument` as `instrument_name` on  `instrument_name`.`AssetID` = `WindProfilerMeasurement`.`AssetID`
                                  LEFT JOIN Tower on Tower.ArchiveNumber = `instrument_name`.TowerID
                                  GROUP BY `WindProfilerMeasurement`.`AssetID` """

    measurements = []
    cur.execute(recent_measurement_stmt)
    response = cur.fetchall()
    for assetID in response:
        # Interval 6 hour will only grab the last 6 hours of data because of the large quanitity of entries.
        start_time = assetID[3].strftime(
            "%Y-%m-%d %H:%M:%S")
        location = assetID[2].split("_")
        temp_data = {
            "instrument": {
                "asset_ID": assetID[0],
                "asset_height": assetID[4],
                "location": location[1]
            },
            "measurements": get_wind_measurements(assetID[0], start_time, start_time)
        }
        measurements.append(temp_data.copy())

    return measurements


def get_wind_measurements(assetID, start_date_time_utc=None, end_date_time_utc=None):
    select_wind_stmt = """ SELECT  `WindProfilerMeasurement`.`MeasurementID`,
                                    `WindProfilerMeasurement`.`MeasurementDateTime`,
                                    `WindProfilerMeasurement`.`AZ-1`,
                                    `WindProfilerMeasurement`.`AZ-2`,
                                    `WindProfilerMeasurement`.`AZ-3`,
                                    `WindProfilerMeasurement`.`AZ-4`,
                                    `WindProfilerMeasurement`.`AZ-5`,
                                    `WindProfilerMeasurement`.`EL-1`,
                                    `WindProfilerMeasurement`.`EL-2`,
                                    `WindProfilerMeasurement`.`EL-3`,
                                    `WindProfilerMeasurement`.`EL-4`,
                                    `WindProfilerMeasurement`.`EL-5`
                            FROM `WindProfilerMeasurement`
                            WHERE `WindProfilerMeasurement`.`AssetID` = %s """

    args = [assetID]
    if start_date_time_utc:
        select_wind_stmt += "AND `WindProfilerMeasurement`.MeasurementDateTime >= %s "
        args.append(start_date_time_utc)
        if start_date_time_utc == end_date_time_utc:
            select_wind_stmt += " - INTERVAL 1 HOUR "

    if end_date_time_utc:
        select_wind_stmt += "AND `WindProfilerMeasurement`.MeasurementDateTime <= %s "
        args.append(end_date_time_utc)

    cur.execute(select_wind_stmt, args)
    response = cur.fetchall()
    measurements = []
    for measurement in response:
        metadata = {
            "measurement_id": measurement[0],
            "measurement_date_time": str(measurement[1]),
            "AZ-1": measurement[2],
            "AZ-2": measurement[3],
            "AZ-3": measurement[4],
            "AZ-4": measurement[5],
            "AZ-5": measurement[6],
            "EL-1": measurement[7],
            "EL-2": measurement[8],
            "EL-3": measurement[9],
            "EL-4": measurement[10],
            "EL-5": measurement[11],

        }

        measurements.append(
            {
                "metadata": metadata.copy(),
                "gateResponses": get_wind_gate_responses(measurement[0]),
            })

    return measurements


def get_wind_gate_responses(measurement_id):
    attributes = ["GateNum", "HT", """`HT_QCFLAG`""", "SPD", "`SPD_QCFLAG`", "DIR", "`DIR_QCFLAG`", "`VEL-1`", "`VEL-1_QCFLAG`", "`OBS-1`", "`OBS-1_QCFLAG`", "`SNR-1`", "`SNR-1_QCFLAG`", "`VEL-2`", "`VEL-2_QCFLAG`", "`OBS-2`", "`OBS-2_QCFLAG`", "`SNR-2`",
                  "`SNR-2_QCFLAG`", "`VEL-3`", "`VEL-3_QCFLAG`", "`OBS-3`", "`OBS-3_QCFLAG`", "`SNR-3`", "`SNR-3_QCFLAG`", "`VEL-4`", "`VEL-4_QCFLAG`", "`OBS-4`", "`OBS-4_QCFLAG`", "`SNR-4`", "`SNR-4_QCFLAG`", "`VEL-5`", "`VEL-5_QCFLAG`", "`OBS-5`", "`OBS-5_QCFLAG`", "`SNR-5`", "`SNR-5_QCFLAG`"]

    gate_responses_stmt = """SELECT {}
                            FROM `WindProfilerGateResponse`
                            WHERE MeasurementID = %s;""".format(",".join(attributes))

    cur.execute(gate_responses_stmt, [measurement_id])

    response = cur.fetchall()
    record_data = []
    gate = {}

    for gate_response in response:
        for i in range(len(attributes)):
            val = gate_response[i]
            # tinyint values in db are stored as byte string in python. So convert back to int
            if type(val) is bytes:
                val = int(str(val)[-2])
            gate[attributes[i]] = val
        record_data.append(gate.copy())

    return record_data


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
