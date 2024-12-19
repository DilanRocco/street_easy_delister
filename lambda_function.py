import json
from scraper import Scraper

def lambda_handler(event, context):
    try:
        query = 'https://streeteasy-api.p.rapidapi.com/sales/search?areas=all-downtown%2Call-midtown&minPrice=1000000&limit=15'
        Scraper().run_through_pages(query)
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
