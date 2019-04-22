# importing the requests library
import requests
import json
import time
# defining the api-endpoint 
API_ENDPOINT = "http://localhost:3000/api/v1/location/insertLocationPoint"

i = 0
for line in open('log-3-1.txt', 'r'):
    print(i)
    location_data = json.loads(line)
    print(location_data['x'])
    data = {'id_session':'38',
    'id':location_data['id'],
    'x':location_data['x'],
    'y':location_data['y'],
    'timestamp':location_data['timestamp']}
    r = requests.post(API_ENDPOINT, data = data)
    print(r.text)
    i+=1
    time.sleep(0.2)