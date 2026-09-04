from predict import *
import time
import matplotlib.pyplot as plt

test_sensor_data = {"Avg_Air_Temp": 21.57714092664413,
                 "Avg_RH":99.88713243066651, 
                 "Avg_CO2":521.5402481952933,
                 "Avg_EC":4.295712514262041, 
                 "Avg_pH":6.241688615990526,
                 "Avg_DLI":48.824944611711764}


locked_data = {

    "Avg_Air_Temp":22,
    "Avg_RH": 40
}


empty_data = {}

start = time.time()
print(predict(test_sensor_data))
end = time.time()

print(f"Time Taken to Predict: {end - start}")

start = time.time()
print(optimize(locked_data))
end = time.time()

print(f"Time Taken to Optimize = {end - start}")

start = time.time()
print(optimize(empty_data))
end = time.time()

print(f"Time Taken to Optimize Empty: {end - start}")


optimal, val = optimize(empty_data)
print(f"{predict(optimal)} {val}")

optimal, val = optimize(locked_data)

print(f"{predict(optimal)} {val}")

current,optimal,domain,Range = generate_graph(test_sensor_data, optimal)

print(f"Domain is {domain}, Range is {Range}")

x,y = zip(*current)
plt.plot(x, y, label = "Current")
x, y = zip(*optimal)
plt.plot(x,y,label = "Optimal")
plt.legend()
plt.show()

