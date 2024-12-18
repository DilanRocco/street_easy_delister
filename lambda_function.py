import json
import scraper

def lambda_handler(event, context):
    try:
        v = scraper.run_through_pages()
    except Exception as e:
        print(e)
        return {
            'statusCode': 200,
            'body': json.dumps(e)
        }

    return {
        'statusCode': 200,
        'body': json.dumps(v)
    }
