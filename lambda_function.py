import json
import os
from scraper import Scraper

def lambda_handler(event, context):
    try:
        Scraper().run_through_pages()
    except Exception as e:
        print(e)
        return {
            'statusCode': 200,
            'body': json.dumps(e)
        }

    return {
        'statusCode': 200,
        'body': json.dumps('Successs')
    }


