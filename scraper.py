#!/usr/bin/env python3
import math
import pandas as pd
from db import DB
from query import Query
from s3 import S3

class Scraper:
    def __init__(self):
        self.db = DB()
        self.s3 = S3()
        self.query = Query()
        self.seen_recently = [] # pull from the database
        self.important_info = {}

    keys_to_include = {"daysOnMarket", "address"}
    # goes through listings, makes requests to listening we haven't seen before
    def getSalesInfo(self, listings):
        res = []
        
        for listing in listings:
            id = listing['id']
            query = '/sales/' + id
            if id not in self.seen_recently:
                response = self.query.rapid_request(query=query)
                filtered_dict = {key: response[key] for key in self.keys_to_include}
                self.important_info[id] = filtered_dict
            else:
                self.important_info[id] = self.seen_recently[id]
            print(list(self.important_info)[-1])
        return res
            
    # creates a CSV from the sales
    def create_csv(self, all_sales):
        df = pd.DataFrame(all_sales)
        csv = df.to_csv()
        return csv


    # Gets all pages from a specific query
    def run_through_pages(self, query: str):
        nextOffset = 1
        count = None
        all_listings = []
        runs = 0
        while runs < 5 and not count or nextOffset < count:
            runs += 1
            print(f'Starting offset for listings: {str(nextOffset)}')
            new_query = query + '&offset=' + str(nextOffset-1) 
            response = self.query.rapid_request(new_query)
            count = response['pagination']['count']
            nextOffset = response['pagination']['nextOffset']

            listings = response['listings']
            all_listings += self.getSalesInfo(listings)
            
        csv = self.create_csv(all_listings)
        self.s3.upload_csv_to_s3(csv)
        self.db.upload_sales_to_database(all_listings)


if __name__ == "__main__":
    query = 'https://streeteasy-api.p.rapidapi.com/sales/search?areas=all-downtown%2Call-midtown&minPrice=1000000&limit=5'
    Scraper().run_through_pages(query)