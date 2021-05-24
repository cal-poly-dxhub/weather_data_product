import logging
import db_config
import boto3

RESOURCE = db_config.RESOURCE_ARN
SECRET = db_config.SECRET_ARN
DB = db_config.DB


def get_logger():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    return logger


'''
formats the response of a call to execute_statement as a list of dictionary objects
REQUIRED:
- The call to table.execute_statement(...) must contain the parameter `includeResultMetadata=True`.
  This allows for labeled columns to be correctly identified as the keys within each dictionary.
'''
def generate_map_from_response(response):
    response_set = []
    obj = {}
    for record in response['records']:
        for i in range(len(record)):
            obj[response['columnMetadata'][i]['label']] = list(record[i].values())[0]
        response_set.append(obj.copy())
    return response_set


def get_response(sql_stmt, params):
    table = boto3.client('rds-data')
    response = None

    if len(params) == 0 or type(params) != list or not all(isinstance(x, list) for x in params):
        return response

    if len(params) > 1:
        response = table.batch_execute_statement(
            resourceArn = RESOURCE,
            secretArn = SECRET,
            database = DB,
            sql = sql_stmt,
            parameterSets=params
        )

    elif len(params) == 1:
        response = table.execute_statement(
            resourceArn = RESOURCE,
            secretArn = SECRET,
            database = DB,
            sql = sql_stmt,
            parameters=params[0],
            includeResultMetadata=True
        )

    return response


#formats params on calls to `aurora.execute_statement(...)` as per aws doc specification: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/rds-data.html
def format_param_value(param):
    if type(param) == int:
        return {"longValue": param}
    elif type(param) == float:
        return {"doubleValue": param}
    elif type(param) == str:
        return {"stringValue": param}
    elif type(param) == bool:
        return {"booleanValue": param}
    elif param == None:
        return {"isNull": True}
    else:
        raise ValueError("Unrecognized parameter type")