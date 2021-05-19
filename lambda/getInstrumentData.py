import json
import pymysql
import logging
from datetime import datetime
from db_config import RDS_HOST, NAME, PASSWORD, DB_NAME

logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn = pymysql.connect(host=RDS_HOST, user=NAME, password=PASSWORD, database=DB_NAME, connect_timeout=5)
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

    #if event.get('queryStringParameters'):
    try:
        asset_id = event['queryStringParameters']['assetId']
    except:
        return request_error(response, 400, "assetId missing from request parameters")
    
    start_date_time_utc = event['queryStringParameters'].get('startDateTimeUTC')
    end_date_time_utc = event['queryStringParameters'].get('endDateTimeUTC')
    
    if start_date_time_utc and end_date_time_utc:
        try:
            start_date_time_utc = datetime.strftime(datetime.strptime(start_date_time_utc, "%Y-%m-%dT%H:%M:%S"), "%Y-%m-%d %H:%M:%S")
            end_date_time_utc = datetime.strftime(datetime.strptime(end_date_time_utc, "%Y-%m-%dT%H:%M:%S"), "%Y-%m-%d %H:%M:%S")
        except:
            return request_error(response, 400, "required datetime format: YYYY-MM-DDTHH:MM:SS")
    
    elif (start_date_time_utc and not end_date_time_utc) or (end_date_time_utc and not start_date_time_utc):
        return request_error(response, 400, "must provide both start and end datetime values in format")

    if instrument == "/mini-sodar":
        try:
            body['instrument'] = get_instrument(asset_id)
        except Exception as e:
            logger.error(e)
            return request_error(response, 400, "could not determine instrument info from assetId")
        
        try:
            body['tower'] = get_tower(body['instrument']['towerId'])
        except Exception as e:
            logger.error(e)
            return request_error(response, 500, "asset ID in DB not connected to a tower")
        
        try:
            body['measurements'] = get_minisodar_measurements(asset_id, start_date_time_utc, end_date_time_utc)
        except Exception as e:
            logger.error(e)
            return request_error(response, 400, "could not determine instrument from asset ID")

    response['body'] = json.dumps(body)
    return response


def get_instrument(asset_id):
    select_instrument = """ SELECT 	MiniSODARInstrument.`AssetID`,
                                    MiniSODARInstrument.`TowerID`,
                                    MiniSODARInstrument.`Name`
                            FROM MiniSODARInstrument
                            WHERE MiniSODARInstrument.`AssetID` = %s;"""
    cur.execute(select_instrument, [asset_id])

    response = cur.fetchone()

    instrument = {
        "assetId": response[0],
        "towerId": response[1],
        "assetName": response[2]
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
                            WHERE MiniSODARMeasurement.AssetID = %s {}""".format("") #start_date, end_date
    cur.execute(select_instrument, [asset_id])

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