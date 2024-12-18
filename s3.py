import boto3
import datetime

class S3:
    def __init__(self):
        self.s3 = boto3.client('s3')
        self.bucket_name = "delisted_sales_list"
        pass
    
    def make_file_key(self):
        now = datetime.now()
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