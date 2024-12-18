#!/usr/bin/env python3
import http.client
import json
import math

def rapid_request(query: str):
    conn = http.client.HTTPSConnection("streeteasy-api.p.rapidapi.com")

    headers = {
        'x-rapidapi-key': "c95314f1f6mshe6309640cb59737p13b2c3jsn47a17333f3ec",
        'x-rapidapi-host': "streeteasy-api.p.rapidapi.com"
    }

    conn.request("GET", headers=headers)

    res = conn.getresponse()
    data = res.read()
    
    decoded_data = data.decode("utf-8")
    json_data = json.loads(decoded_data)
    return json_data

seen_recently = [] # list of ids, probably need to be in some database
important_info = {}


keys_to_include = {"dayOnMarket", "address", "url"}
# goes through listings, makes requests to listening we haven't seen before
def findListings(listings):
    res = []
    
    for listing in listings:
        id = listing['id']
        query = '/sales/' + id
        if id not in seen_recently:
            response = rapid_request(query=query)
            filtered_dict = {key: response[key] for key in keys_to_include}
            important_info['id'] = filtered_dict
        else:
            important_info[id] = seen_recently[id]
    return res
        
def create_csv():
    pass

def upload_sales_to_database():
    pass

# Gets all pages from a specific query
def run_through_pages(query: str):
    nextOffset = 0
    count = math.inf
    all_listings = []
    while nextOffset < count:
        new_query = query + str(nextOffset)
        response = rapid_request(new_query)
        count = response['pagination']['count']
        nextOffset = response['pagination']['nextOffset']

        listings = response['listings']
        all_sales = findListings(listings)
        csv = create_csv(all_sales)
        upload_sales_to_database(all_sales)

if __name__ == "__main__":
    pass
    #run_through_pages()
