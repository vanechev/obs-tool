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


file = 'arousals/S4-DR_Peaks.csv'
df = pd.read_csv(file)

df = df.rename(index=str, columns={"Unnamed: 0": "timestamp"})
df['timestamp'] = pd.to_datetime(df['timestamp'], format="%Y-%m-%d %H:%M:%S.%f")
df['timestamp'] = df['timestamp'] + timedelta(hours=10)
arousal_times = list(df.timestamp)
print(arousal_times)

for peak in arousal_times:
	data = {'id_session':'119','person':'292','arousal_time':peak}
	r = requests.post(API_ENDPOINT, data = data)
	print(r.text)

