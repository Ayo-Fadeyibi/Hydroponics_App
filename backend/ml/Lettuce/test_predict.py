import pandas as pd
import predict
from pathlib import Path
import time
import matplotlib.pyplot as plt

# Define file paths
current_dir = Path.cwd()
final_dir = current_dir.parent
lettuce_raw_data_dir = final_dir / 'data' / 'raw' / 'Lettuce'
lettuce_processed_data_dir = final_dir / 'data' / 'processed' / 'Lettuce'

# --- EXAMPLE USAGE ---
# Input sensor data (these values can be changed to test different scenarios)
# Needs to be averages over a period of time to ensure correct measurements
new_sensor_readings = {
    'Avg_pH': 6.5,          # Water pH 
    'Avg_EC': 1.85,         # Electrical Conductivity 
    'Avg_CO2': 455.0,       # Carbon Dioxide (PPM) 
    'Avg_RH': 58.5,         # Relative Humidity % 
    'Avg_Air_Temp': 22,   # Room Air Temp (°C) 
    'Avg_Water_Temp': 25, # Water Temp (°C) 
    'Avg_TDS': 0.92         # Total Dissolved Solids g/L
}

model_file = 'trained_models\Lettuce\pruned_optimized_hydro_model.joblib'
forecasted_yield = predict.predict_yield_with_rails(new_sensor_readings)

print(f"Sensor data inputted: {new_sensor_readings}")
print(f"--- HYDRO-YIELD FORECAST ---")
print(f"Predicted Harvest Weight: {forecasted_yield:.2f} grams") 

# --- Speed Test ---
predictions = 1
start_time = time.time()
for _ in range(predictions):
    predict.predict_yield_with_rails(new_sensor_readings)
end_time = time.time()

print(f"--- Speed Test ---")
print(f"Time taken for {predictions} predictions: {end_time - start_time:.4f} seconds")


# --- Biological Limits TEST ---
sensor_data = {
    'Avg_pH': 6.2, 
    'Avg_EC': 1.8, 
    'Avg_CO2': 450, 
    'Avg_RH': 60, 
    'Avg_Air_Temp': 22, 
    'Avg_Water_Temp': 100, # BOILING WATER TEST
    'Avg_TDS': 0.8
}

result = predict.predict_yield_with_rails(sensor_data)
print(f"--- Safety Rail Test ---")
print(f"Safety Rail Result: {result:.2f}g (Expected: 0.00g due to boiling water)")
sensor_data = {
    'Avg_pH': 7.5, # high pH test
    'Avg_EC': 1.8, 
    'Avg_CO2': 450, 
    'Avg_RH': 60, 
    'Avg_Air_Temp': 22, 
    'Avg_Water_Temp': 25,
    'Avg_TDS': 0.8
}
result = predict.predict_yield_with_rails(sensor_data)
print(f"--- Safety Rail Test ---")
print(f"Safety Rail Result: {result:.2f}g (Expected: low due to 7.5 pH)")

# --- curve function test ---
final_weight = 250  # Example final weight in grams
growth_curve = predict.generate_lettuce_growth_curve(final_weight)
print(f"--- Growth Curve Test ---")
print(f"Generated growth curve for {final_weight}g final weight:")
for day, weight in growth_curve:
    print(f"Day {day}: {weight}g")

# Plot the growth curve
days, weights = zip(*growth_curve)
plt.figure(figsize=(10, 6))
plt.plot(days, weights, marker='o')
plt.title('Simulated Lettuce Growth Curve')
plt.xlabel('Day')
plt.ylabel('Weight (grams)')
plt.grid()
plt.show()