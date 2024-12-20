from io import StringIO
from operator import itemgetter
import boto3
import datetime
import csv
class S3:
    def __init__(self):
        self.s3 = boto3.client('s3')
        pass

        
    def upload_file_to_s3(self, bucket_name, file_name, file, content_type):
        try:
            self.s3.put_object(
                Bucket=bucket_name,
                Key=file_name,
                Body=file,
                ContentType=content_type
            )
            print(f"CSV file successfully uploaded to {bucket_name}/{file_name}")
        except Exception as e:
            raise Exception("There is an trying to upload to S3")

    def get_file_from_s3(self, bucket_name, file_name):
        response = self.s3.get_object(Bucket=bucket_name, Key=file_name)
        file_content = response['Body'].read().decode('utf-8')
        return file_content


    # def get_data_from_s3(self):
    #     try:
    #         objects = self.s3.list_objects_v2(Bucket=self.bucket_name)['Contents']
    
    #         sorted_objects = sorted(objects, key=itemgetter('LastModified'), reverse=True)
    
    #         newest_file = sorted_objects[0]['Key']

    #         file_content = self.get_file_from_s3(self.bucket_name, newest_file)
    #         csv_reader = csv.DictReader(StringIO(file_content))
    #         csv_data = {row['id']: {k: v for k, v in row.items() if k != ""} for row in csv_reader}
            
    #         return csv_data
        
    #     except Exception as e:
    #         raise Exception("Error trying to download recent file")