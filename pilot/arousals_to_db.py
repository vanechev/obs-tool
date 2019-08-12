import pandas as pd
import sys
import time
import numpy as np
from datetime import timedelta
import requests
import json
import time
# defining the api-endpoint 
API_ENDPOINT = "http://localhost:3000/api/v1/visualisations/saveArousalState"

#three arguments:
#id_session: id of the session 
#id_person: id of the person whose arousal points will be displayed
#arousal_filename: name where the csv file is located. Usually in arousal directory

id_session = int(sys.argv[1])
id_person = int(sys.argv[2])
arousal_filename = str(sys.argv[3])

#file = 'arousals/S4-DR_Peaks.csv'
file = 'pilot/arousals/'+arousal_filename
print(file)
df = pd.read_csv(file)

df = df.rename(index=str, columns={"Unnamed: 0": "timestamp"})
df['timestamp'] = pd.to_datetime(df['timestamp'], format="%Y-%m-%d %H:%M:%S.%f")

#timedelta is according to local time - AUS = 10 hours 
df['timestamp'] = df['timestamp'] + timedelta(hours=19)
arousal_times = list(df.timestamp)
print(arousal_times)

for peak in arousal_times:
	data = {'id_session': id_session,'person': id_person,'arousal_time':peak}
	r = requests.post(API_ENDPOINT, data = data)
	print(r.text)

