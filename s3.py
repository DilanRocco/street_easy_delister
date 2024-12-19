from io import StringIO
from operator import itemgetter
import boto3
import datetime
import csv
class S3:
    def __init__(self):
        self.s3 = boto3.client('s3')
        self.bucket_name = "sales-list"
        pass
    
    def make_file_key(self):
        now = datetime.datetime.now()
        t = f'{now:%Y-%m-%d %H:%M:%S%z}'
        return t
        
    def upload_csv_to_s3(self, csv):
        file_name = self.make_file_key()
        try:
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=csv,
                ContentType='text/csv'
            )
            return {
                "statusCode": 200,
                "body": f"CSV file successfully uploaded to {self.bucket_name}/{file_name}"
            }
        except Exception as e:
            print(f"Error uploading file: {e}")
            return {
                "statusCode": 500,
                "body": f"Error uploading file: {str(e)}"
            }
    
    def get_data_from_s3(self):
        try:
            objects = self.s3.list_objects_v2(Bucket=self.bucket_name)['Contents']
    
            sorted_objects = sorted(objects, key=itemgetter('LastModified'), reverse=True)
    
            newest_file = sorted_objects[0]['Key']

            response = self.s3.get_object(Bucket=self.bucket_name, Key=newest_file)
            file_content = response['Body'].read().decode('utf-8')
            print(file_content)
            csv_reader = csv.DictReader(StringIO(file_content))
            csv_data = {row['id']: {k: v for k, v in row.items() if k != ""} for row in csv_reader}
            
            return csv_data
        
        except Exception as e:
            raise Exception("Error trying to download recent file")