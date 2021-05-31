import boto3
import logging

def get_logger():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    return logger


def get_secret(secret_name):
    client = boto3.client("secretsmanager")

    response = client.get_secret_value(
        SecretId=secret_name
    )
    
    return response.get('SecretString')