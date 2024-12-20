#!/usr/bin/env python3
import datetime
import json
import pandas as pd
from query import Query
from s3 import S3
import os
class Scraper:
    def __init__(self):
        self.s3 = S3()
        self.query = Query()
        self.setup()

    def setup(self):
        t = self.s3.get_file_from_s3(bucket_name="seen-sales", file_name="master.txt")
        self.seen_already = set(t.split(","))

    keys_to_include = {"closedAt", "daysOnMarket", "address","price"} # first key must be the value you are sorting on

    def make_se_url(self, id):
        return f'https://www.streeteasy.com/sale/{id}'
    
    # goes through listings, makes requests to listening we haven't seen before
    def getSalesInfo(self, listings):
        res = []
        for listing in listings:
            id = listing['id']
            query = '/sales/' + id
            #if True:
            if id not in self.seen_already:
                response = self.query.rapid_request(query=query)
                if response["status"] != "delisted":
                    self.seen_already.add(id)
                    continue
                filtered_dict = {key: response[key] for key in self.keys_to_include}
                filtered_dict["link"] = self.make_se_url(id)
                sale = filtered_dict
                res.append(sale)
                self.seen_already.add(id)
        return res
            
    # creates a CSV from the sales
    def create_csv(self, all_sales, file_name: str = None):
        df = pd.DataFrame(all_sales)
        if file_name:
            df.to_csv('delisted.csv')
            return
        csv = df.to_csv()
        return csv

    def make_file_key(self):
        now = datetime.datetime.now()
        t = f'{now:%Y-%m-%d %H:%M:%S%z}'
        return t
    
    # Gets all pages from a specific query
    def run_through_pages(self, download_csv: bool = False):
        query = self.query.get_rapid_query()
        nextOffset = int(os.environ.get('START_OFFSET'))
        count = None
        all_listings = []
        runs = 0
        while runs < int(os.environ.get('RUNS')) and (not count or nextOffset < count):
            runs += 1
            print(f'Starting offset for listings: {str(nextOffset)}')
            new_query = query + '&offset=' + str(nextOffset-1) 
            response = self.query.rapid_request(new_query)
            print(response)
            count = response['pagination']['count']
           

            listings = response['listings']
            all_listings += self.getSalesInfo(listings)
            sorted_listing = sorted(all_listings, key=lambda x: x['daysOnMarket'])
            if 'nextOffset' not in response['pagination']:
                break
            nextOffset = response['pagination']['nextOffset']
        print(all_listings)
        if download_csv:
            self.create_csv(sorted_listing, "delisted.csv")
            return 
        csv = self.create_csv(sorted_listing)
        self.s3.upload_file_to_s3(bucket_name="sales-list", file_name=self.make_file_key(), file=csv, content_type='text/csv')
        master = ",".join(map(str, self.seen_already))
        self.s3.upload_file_to_s3(bucket_name="seen-sales", file_name="master.txt", file=master, content_type="text/plain")


if __name__ == "__main__":
    print(os.environ.get('LIMIT'))
    print(os.environ.get('RUNS'))
    
    Scraper().run_through_pages(download_csv=False)