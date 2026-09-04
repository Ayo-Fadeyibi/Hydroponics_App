from predict import *

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import time

df = pd.read_csv("ml/UserDataModels/exampleCSV.csv")
num_days = 7


#Graph Testing
start = time.time()
given_data, forecast_data, domain, Range = generate_graph(df, num_days)
end = time.time()

print(f"Time taken = {end - start}")
x,y = zip(*given_data)
plt.plot(x,y,color = "blue", label = "Given")
x,y = zip(*forecast_data)
plt.plot(x,y,color = "red", label = "forecast")

plt.legend()
plt.show()

print(f"Domain {domain}, Range: {Range}")

#Accuracy Testing
start = time.time()
method, acc = get_accuracy(df, num_days)
end = time.time()
print(f"Time taken = {end - start}")
print(f"Confidence using {method} is {acc}")

#Feature Importance Testing
start = time.time()
featureImportance = get_feature_importance(df)
end = time.time()
print(f"Time taken = {end - start}")
print(featureImportance)