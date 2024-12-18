import http.client
import json


class Query:
    def __init__(self):
        pass
    
    def rapid_request(self, query: str):
        conn = http.client.HTTPSConnection("streeteasy-api.p.rapidapi.com")

        headers = {
            'x-rapidapi-key': "c95314f1f6mshe6309640cb59737p13b2c3jsn47a17333f3ec",
            'x-rapidapi-host': "streeteasy-api.p.rapidapi.com"
        }

        conn.request("GET", headers=headers, url=query)

        res = conn.getresponse()
        data = res.read()
        
        decoded_data = data.decode("utf-8")
        json_data = json.loads(decoded_data)
        return json_data