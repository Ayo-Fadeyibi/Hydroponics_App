from predict import *
import time

test_sensor_data = {"Avg_Air_Temp": 31.219,
                 "Avg_RH":64.178, 
                 "Avg_CO2":449.833,
                 "Avg_EC":3.2, #Might have to lower, seems high
                 "Avg_pH":4.3,
                 "Avg_DLI":43}


locked_data = {

    "Avg_RH": 60,
    "Avg_pH": 6,
    "Avg_CO2": 1000
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


print(optimize())


optimal, val = optimize(empty_data)
print(f"{predict(optimal)} {val}")

optimal, val = optimize(locked_data)

print(f"{predict(optimal)} {val}")