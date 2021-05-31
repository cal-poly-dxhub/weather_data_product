import json
import logging
from datetime import datetime

import pymysql
from utility import get_logger, get_secret

logger = get_logger()

SECRET_NAME = 'Aurora'

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
    logger.info("event info: {}".format(event))
    
    result = None
    response = {
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

    body = {}
    ''' #expected output
    {
        "tower": {
            ...
        },
        "instrument": {
            ...
        },
        "measurements": [
            {
                "metadata": {...},
                "gateResponses": [{...},...,{...}]
            },
            ...,
            {...}
        ]
    }
    '''
    
    instrument = event['resource']

    try:
        asset_id = event['queryStringParameters']['assetId']
    except:
        return request_error(response, 400, "assetId missing from request parameters")
    
    start_date_time_utc = event['queryStringParameters'].get('startDateTimeUTC')
    end_date_time_utc = event['queryStringParameters'].get('endDateTimeUTC')
    
    if start_date_time_utc:
        try:
            start_date_time_utc = datetime.strftime(datetime.strptime(start_date_time_utc, "%Y-%m-%dT%H:%M:%S"), "%Y-%m-%d %H:%M:%S")
        except:
            return request_error(response, 400, "required datetime format: YYYY-MM-DDTHH:MM:SS")

    if end_date_time_utc:
        try:
            end_date_time_utc = datetime.strftime(datetime.strptime(end_date_time_utc, "%Y-%m-%dT%H:%M:%S"), "%Y-%m-%d %H:%M:%S")
        except:
            return request_error(response, 400, "required datetime format: YYYY-MM-DDTHH:MM:SS")

    if instrument == "/mini-sodar":
        try:
            body['instrument'] = get_instrument(asset_id)
        except Exception as e:
            logger.error(e)
            return request_error(response, 400, "could not determine instrument info from assetId")
        
        try:
            body['tower'] = get_tower(body['instrument']['tower_id'])
        except Exception as e:
            logger.error(e)
            return request_error(response, 500, "asset ID in DB not connected to a tower")
        
        try:
            body['measurements'] = get_minisodar_measurements(asset_id, start_date_time_utc, end_date_time_utc)
        except Exception as e:
            logger.error(e)
            return request_error(response, 400, "could not determine instrument from asset ID")
    
    elif instrument == "/tower":
        try:
            body['tower'] = get_tower(asset_id)
        except Exception as e:
            logger.error(e)
            return request_error(response, 400, "could not determine tower from assetId")

        try:
            body['measurements'] = get_tower_measurements(asset_id, start_date_time_utc, end_date_time_utc)
        except Exception as e:
            logger.error(e)
            return request_error(response, 400, "could not acquire tower measurements")
    
    else:
        return request_error(response, 404, "unknown path parameter: {}".format(instrument))

    response['body'] = json.dumps(body)
    return response


def get_tower_measurements(asset_id, start_date_time_utc, end_date_time_utc):
    select_instrument = """ SELECT 	TowerMeasurement.`MeasurementID`,
                                    TowerMeasurement.`MeasurementDateTime`
                            FROM TowerMeasurement
                            WHERE TowerMeasurement.`TowerID` = %s"""
    args = [asset_id]
    
    if start_date_time_utc:
        select_instrument += "AND TowerID.`MeasurementDateTime` >= %s "
        args.append( start_date_time_utc )
    
    if end_date_time_utc:
        select_instrument += "AND TowerID.`MeasurementDateTime` <= %s "
        args.append( end_date_time_utc )    

    cur.execute(select_instrument, args)

    response = cur.fetchall()
    measurements = []
    for measurement in response:
        metadata = {
            "measurement_id": measurement[0],
            "measurement_date_time": str(measurement[1])
        }

        gate_query = """SELECT	TowerGateResponse.`ProductCode`,
                                TowerGateResponse.`HeightMeasurement`,
                                TowerGateResponse.`Value`
                        FROM TowerGateResponse
                        WHERE MeasurementID = %s"""
        args = [metadata['measurement_id']]

        cur.execute(gate_query, args)

        response = cur.fetchall()

        record_data = []
        gate = {}

        for gate_record in response:
            gate = {
                "product_code": gate_record[0],
                "height": gate_record[1],
                "value": gate_record[2]
            }
            record_data.append( gate.copy() )

        measurements.append(
            {
                "metadata": metadata.copy(),
                "gateResponses": record_data
            }
        )

    return measurements


def get_instrument(asset_id):
    select_instrument = """ SELECT 	MiniSODARInstrument.`AssetID`,
                                    MiniSODARInstrument.`TowerID`,
                                    MiniSODARInstrument.`Name`,
                                    MiniSODARInstrument.`Latitude`,
                                    MiniSODARInstrument.`Longitude`,
                                    MiniSODARInstrument.`AssetHeight`
                            FROM MiniSODARInstrument
                            WHERE MiniSODARInstrument.`AssetID` = %s;"""
    cur.execute(select_instrument, [asset_id])

    response = cur.fetchone()

    instrument = {
        "asset_id": response[0],
        "tower_id": response[1],
        "asset_name": response[2],
        "latitude": response[3],
        "longitude": response[4],
        "height": response[5]
    }
    return instrument


def get_tower(tower_id):
    select_tower = """SELECT	Tower.ArchiveNumber,
                                Tower.TowerNumber,
                                Tower.Latitude,
                                Tower.Longitude,
                                Tower.MSLElevation,
                                Tower.Location
                        FROM Tower 
                        WHERE Tower.ArchiveNumber = %s;"""
    cur.execute(select_tower, [tower_id])

    response = cur.fetchone()
    tower = {
        "archive_num": response[0],
        "tower_num": response[1],
        "latitude": response[2],
        "longitude": response[3],
        "msl_elevation": response[4],
        "location": response[5]
    }

    return tower


def get_minisodar_measurements(asset_id, start_date_time_utc = None, end_date_time_utc = None):
    select_instrument = """ SELECT  MiniSODARMeasurement.`MeasurementID`,
                                    MiniSODARMeasurement.`MeasurementDateTime`,
                                    MiniSODARMeasurement.`MxHeight`,
                                    MiniSODARMeasurement.`UNoise`,
                                    MiniSODARMeasurement.`VNoise`,
                                    MiniSODARMeasurement.`WNoise`
                            FROM MiniSODARMeasurement
                            WHERE MiniSODARMeasurement.AssetID = %s """
    args = [asset_id]
    
    if start_date_time_utc:
        select_instrument += "AND MiniSODARMeasurement.MeasurementDateTime >= %s "
        args.append(start_date_time_utc)
    
    if end_date_time_utc:
        select_instrument += "AND MiniSODARMeasurement.MeasurementDateTime <= %s "
        args.append(end_date_time_utc)    

    cur.execute(select_instrument, args)

    response = cur.fetchall()
    measurements = []
    for measurement in response:
        metadata = {
            "measurement_id": measurement[0],
            "measurement_date_time": str(measurement[1]),
            "mx_height": measurement[2],
            "u_noise": measurement[3],
            "v_noise": measurement[4],
            "w_noise": measurement[5]
        }

        gate_responses = get_gate_responses(metadata['measurement_id'])

        measurements.append(
            {
                "metadata": metadata.copy(),
                "gateResponses": gate_responses
            }
        )

    return measurements


def get_gate_responses(measurement_id):
    attributes = [
        "GateNum",
        "HT",
        "SPD",
        "DIR",
        "GSPD",
        "GDIR",
        "W",
        "SDW",
        "NW",
        "IW",
        "SNRW",
        "U",
        "SDU",
        "NU",
        "IU",
        "SNRU",
        "V",
        "SDV",
        "NV",
        "IV",
        "SNRV",
        "SDW5",
        "SDW10"
    ]
    gate_responses_stmt = """SELECT {}
                            FROM `MiniSODARGateResponse`
                            WHERE MeasurementID = %s;""".format(",".join(attributes))
    cur.execute(gate_responses_stmt, [measurement_id])

    response = cur.fetchall()
    record_data = []
    gate = {}

    for gate_response in response:
        for i in range(len(attributes)):
            gate[attributes[i]] = gate_response[i]
        record_data.append( gate.copy() )

    return record_data



def request_error(response, status_code, body):
    response['statusCode'] = str(status_code)
    error = { "message": body }
    logger.error(body)
    response['body'] = json.dumps(error)
    return response