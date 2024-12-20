import datetime
import http.client
import json
import os


class Query:
    def __init__(self):
        pass
    
    def rapid_request(self, query: str):
        conn = http.client.HTTPSConnection("streeteasy-api.p.rapidapi.com")

        headers = {
            'x-rapidapi-key': "c95314f1f6mshe6309640cb59737p13b2c3jsn47a17333f3ec",
            'x-rapidapi-host': "streeteasy-api.p.rapidapi.com"
        }
        print(query)
        conn.request("GET", headers=headers, url=query)

        res = conn.getresponse()
        data = res.read()
        
        decoded_data = data.decode("utf-8")
        json_data = json.loads(decoded_data)
        return json_data
    
    def get_date(self, days_ago):
        current_date = datetime.datetime.now()
        two_days_ago = current_date - datetime.timedelta(days=days_ago)
        formatted_date = two_days_ago.strftime("%Y-%m-%d")
        return formatted_date

    def get_rapid_query(self):
        date = self.get_date(2)
        query = 'https://streeteasy-api.p.rapidapi.com/sales/past/search?areas=all-downtown%2Call-midtown%2Call-upper-west-side%2Call-upper-east-side%2Cgreenpoint%2Cwilliamsburg%2Csunset-park%2Cdowntown-brooklyn%2Cfort-greene%2Cboerum-hill%2Cdumbo%2Cbedford-stuyvesant%2Cbushwick%2Cred-hook%2Cpark-slope%2Cgowanus%2Ccarroll-gardens%2Ccobble-hill%2Cwindsor-terrace%2Ccrown-heights%2Cprospect-heights%2Ccolumbia-st-waterfront-district%2Cprospect-lefferts-gardens%2Cbay-ridge%2Cdyker-heights%2Cdyker-heights%2Cbensonhurst%2Cbath-beach%2Cgravesend%2Cborough-park%2Cocean-parkway%2Ckensington%2Cconey-island%2Cbrighton-beach%2Cditmas-park%2Cseagate%2Cflatbush%2Cmidwood%2Csheepshead-bay%2Cmanhattan-beach%2Cbrownsville%2Cprospect-park-south%2Ceast-flatbush%2Ccanarsie%2Cflatlands%2Cmarine-park%2Cmill-basin%2Cbergen-beach%2Cclinton-hill%2Cold-mill-basin%2Cgreenwood&status=delisted&closedAfter='+date+'&minPrice=1000000&limit=' + os.environ.get('LIMIT')
        return query