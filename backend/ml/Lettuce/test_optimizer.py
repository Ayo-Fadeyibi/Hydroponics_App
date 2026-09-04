import predict
import time

# --- EXAMPLE USAGE ---
# Define your constraints (Min, Max)
# If you want to freeze Air Temp at 24 and CO2 at 450:
my_ranges = {
    'Avg_Air_Temp': 24,   # FROZEN
    'Avg_CO2': 450     # FROZEN

}

start_time = time.time()
# Get the labeled results
best_env = predict.get_optimal_environment(my_ranges)

# Print for readability
print("--- OPTIMIZED ENVIRONMENT ---")
for sensor, value in best_env.items():
    print(f"{sensor:15}: {value:.3f}")

optimal_yield = predict.predict_yield_with_rails(best_env)
print(f"Predicted Yield at Optimal Environment: {optimal_yield:.2f} grams")
end_time = time.time()
print(f"Time taken for optimization: {end_time - start_time:.4f} seconds")

my_ranges = {
}

start_time_2 = time.time()
# Get the labeled results
best_env = predict.get_optimal_environment(my_ranges)

# Print for readability
print("--- OPTIMIZED ENVIRONMENT no restrictions ---")
for sensor, value in best_env.items():
    print(f"{sensor:15}: {value:.3f}")

optimal_yield = predict.predict_yield_with_rails(best_env)
print(f"Predicted Yield at Optimal Environment: {optimal_yield:.2f} grams")
end_time_2 = time.time()
print(f"Time taken for optimization: {end_time_2 - start_time_2:.4f} seconds")