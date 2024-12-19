#!/usr/bin/env python3
from s3 import S3


class Tests():
    def run(self):
        print(S3().get_data_from_s3())



if __name__ == "__main__":
    Tests().run()