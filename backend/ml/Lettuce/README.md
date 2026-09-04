# Note for Mac Users:

After downloading dependencies, you need to run the following installation:

```
brew install libomp
```

# Prediction Usage Guide

## **PREDICTION:**

To generate a prediction, import the function and pass a dictionary of your current sensor readings.

```
from predict import predict_yield_with_rails

# 1. Define your sensor inputs
current_sensors = {
    'Avg_pH': 6.5,          # Water pH
    'Avg_EC': 1.85,         # Electrical Conductivity
    'Avg_CO2': 455.0,       # Carbon Dioxide (PPM)
    'Avg_RH': 58.5,         # Relative Humidity %
    'Avg_Air_Temp': 22,   # Room Air Temp (°C)
    'Avg_Water_Temp': 25, # Water Temp (°C)
    'Avg_TDS': 0.92         # Total Dissolved Solids g/L
}
# 2. Run the prediction
predicted_grams = predict_yield_with_rails(current_sensors)

print(f"Predicted Harvest Weight: {predicted_grams:.2f}g")
```

**Output:**

Predicted Harvest Weight: 279.56 grams

---

## **OPTIMIZER:**

To find the optimized values, import the function get_optimal_environment() and pass a dictionary of range tuples to it. If any metric is to be frozen, use the same number in the tuple

note that the output is in a dictionary with label:value pairs. This is compatible with predict_yield_with_rails, and can be used as is to generate the maximum possible yield with the given ranges.

### **USE THESE VALUES FOR THE SLIDER END POINTS:**

    default_bounds= {

    'Avg_pH':         (4.5, 8.5),

    'Avg_EC':         (0.5, 4.0),

    'Avg_CO2':        (300, 2000),

    'Avg_RH':         (30, 95),

    'Avg_Air_Temp':   (10, 35),

    'Avg_Water_Temp': (10, 32),

    'Avg_TDS':        (0.2, 2.5)

    }

```
from predict import get_optimal_environment

# Define your locked variables
# If you want to freeze Air Temp at 24 and CO2 at 450:
my_ranges = {
    'Avg_CO2': 450,       # FROZEN
    'Avg_Air_Temp': 24,    # FROZEN
}

# Get the labeled results
best_env = predict.get_optimal_environment(my_ranges)
for sensor, value in best_env.items():
    print(f"{sensor:15}: {value:.3f}")

optimal_yield = predict.predict_yield_with_rails(best_env)
print(f"Predicted Yield at Optimal Environment: {optimal_yield:.2f} grams")

```

Output:

Avg_pH : 6.223
Avg_EC : 2.310
Avg_CO2 : 450.000
Avg_RH : 57.996
Avg_Air_Temp : 24.000
Avg_Water_Temp : 25.198
Avg_TDS : 1.173
Predicted Yield at Optimal Environment: 365.64 grams

## Growth curve

To generate a growth curve, use the function below:

```
generate_lettuce_growth_curve(final_weight)
```

It will return 40 data points in the form of a list of tuples (day, weight) to be plotted.
