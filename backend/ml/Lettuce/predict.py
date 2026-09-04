import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from scipy.optimize import differential_evolution
import warnings
from sklearn.exceptions import DataConversionWarning

# --- SETUP & MODEL LOADING ---
current_dir = Path.cwd()
final_dir = current_dir.parent
lettuce_processed_data_dir = final_dir / "data" / "processed" / "Lettuce"
model_path = current_dir / "trained_models" / "Lettuce" / "pruned_optimized_hydro_model.joblib"

MODEL = joblib.load(model_path)
df_augmented = pd.read_csv(lettuce_processed_data_dir / "Hydro_ML_Augmented_Master.csv")

SENSOR_ORDER = ['Avg_pH', 'Avg_EC', 'Avg_CO2', 'Avg_RH', 'Avg_Air_Temp', 'Avg_Water_Temp', 'Avg_TDS']

# --- PRE-CALCULATED NUMPY CONSTANTS (SPEED BOOST) ---
# We calculate these ONCE at startup so the optimizer doesn't do lookups or quantiles in the loop.
OPT_MIN = np.array([df_augmented[s].quantile(0.01) for s in SENSOR_ORDER])
OPT_MAX = np.array([df_augmented[s].quantile(0.99) for s in SENSOR_ORDER])

# Map safety config to arrays ordered exactly like SENSOR_ORDER
safety_config = {
    'Avg_pH':         {'dead': (4.5, 7.5),  'k': 6.0}, 
    'Avg_Water_Temp': {'dead': (15, 28.0), 'k': 5.0}, 
    'Avg_EC':         {'dead': (1, 4.5),  'k': 3.5}, 
    'Avg_TDS':        {'dead': (0.3, 3.5),  'k': 3.5}, 
    'Avg_Air_Temp':   {'dead': (15, 32.0),  'k': 3.0}, 
    'Avg_RH':         {'dead': (35.0, 85.0),'k': 2.5},
    'Avg_CO2':        {'dead': (350, 1300),  'k': 1.5}
}

def get_safety_config():
    return safety_config

DEAD_MIN = np.array([safety_config[s]['dead'][0] for s in SENSOR_ORDER])
DEAD_MAX = np.array([safety_config[s]['dead'][1] for s in SENSOR_ORDER])
K_VALS = np.array([safety_config[s]['k'] for s in SENSOR_ORDER])

# --- FAST BIOLOGICAL LOGIC ---
def get_fast_multiplier(x_array):
    """
    Helper function to calculate a penalty based on how far the current metrics are from the optimal range.
    Uses NumPy math instead of dictionary loops for speed.
    Parameters:
    ----------------------
    x_array: numpy array of current metric values
    Returns:
    ----------------------
    A float representing the penalty.
    """
    # 1. Instant Death Check
    if np.any((x_array <= DEAD_MIN) | (x_array >= DEAD_MAX)):
        return 0.0
    
    # 2. Distance Calculation (0 if inside optimal range)
    dist_low = np.maximum(0, OPT_MIN - x_array) / (OPT_MIN - DEAD_MIN)
    dist_high = np.maximum(0, x_array - OPT_MAX) / (DEAD_MAX - OPT_MAX)
    dist = dist_low + dist_high
    
    # 3. Exponential Penalty
    penalties = np.exp(-K_VALS * (dist ** 2))
    return np.prod(penalties)

# --- THE OPTIMIZER ---
def get_optimal_environment(locked_params=None, seed=42):
    """Function to get optimal environment for lettuce growth given locked parameters.
    Parameters:
    ----------------------
        
    locked_params: dictionary mapping of parameters that the user cannot change (e.g. "Temperature: 25")
    seed: random seed for reproducibility
    Returns:
            
    A dictionary mapping each parameter to its optimal value for growth."
    """
    if locked_params is None or len(locked_params) == 0:
        precomputed_optimal = {
            'Avg_pH': 6.29, 'Avg_EC': 2.31, 'Avg_CO2': 445.27,
            'Avg_RH': 59.12, 'Avg_Air_Temp': 21.05, 'Avg_Water_Temp': 23.80, 'Avg_TDS': 1.56
        }
        return precomputed_optimal  

    # Check for invalid keys
    invalid_keys = [k for k in locked_params if k not in SENSOR_ORDER]
    if invalid_keys:
        raise ValueError(f"Error: Invalid sensor names: {invalid_keys}. Use {SENSOR_ORDER}")

    # 1. Default Search Bounds
    default_bounds = {
        'Avg_pH':         (4.5, 8.5),
        'Avg_EC':         (0.5, 4.0),
        'Avg_CO2':        (300, 2000),
        'Avg_RH':         (30, 95),
        'Avg_Air_Temp':   (10, 35),
        'Avg_Water_Temp': (10, 32),
        'Avg_TDS':        (0.2, 2.5)
    }

    # 2. Build ordered bounds (Locking logic)
    ordered_bounds = []
    for s in SENSOR_ORDER:
        if s in locked_params:
            val = locked_params[s]
            ordered_bounds.append((val, val)) 
        else:
            ordered_bounds.append(default_bounds[s])

    # 3. OBJECTIVE FUNCTION
    def objective(x):
        """Processes one guess using pure NumPy to avoid Pandas overhead."""
        # A. Biological Penalty
        health_score = get_fast_multiplier(x)
        if health_score == 0:
            return 0.0
        
        # B. NumPy Feature Engineering
        # Ordered features: [pH, pH_sq, EC, CO2, Interaction, RH, AirT, WaterT, TDS]
        x_eng = np.array([[
            x[0],           # Avg_pH
            x[0]**2,        # pH_sq
            x[1],           # Avg_EC
            x[2],           # Avg_CO2
            x[1] * x[2],    # Interaction (EC * CO2)
            x[3],           # Avg_RH
            x[4],           # Avg_Air_Temp
            x[5],           # Avg_Water_Temp
            x[6]            # Avg_TDS
        ]])
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            raw_yield = MODEL.predict(x_eng)[0]
        return -float(raw_yield * health_score)

    # 4. Run Optimization
    result = differential_evolution(
        objective, 
        ordered_bounds, 
        strategy='best1bin', 
        popsize=15, 
        tol=0.01, 
        seed=seed,
        polish=False 
    )

    return {SENSOR_ORDER[i]: result.x[i] for i in range(len(SENSOR_ORDER))}

def predict_yield_with_rails(raw_input):
    """Dictionary-based prediction for single calls.
    Parameters:
    ----------------------
    raw_input: dictionary mapping each parameter to its current value
    Returns:
    ----------------------  
    A float representing the predicted yield in grams.
    """
    # Convert dict to array for the fast multiplier
    x_arr = np.array([raw_input[s] for s in SENSOR_ORDER])
    health_score = get_fast_multiplier(x_arr)
    
    if health_score == 0: return 0.0
    
    df_in = pd.DataFrame([raw_input])
    df_in['pH_sq'] = df_in['Avg_pH'] ** 2
    df_in['EC_CO2_Interact'] = df_in['Avg_EC'] * df_in['Avg_CO2']
    
    features = ['Avg_pH', 'pH_sq', 'Avg_EC', 'Avg_CO2', 'EC_CO2_Interact', 
                'Avg_RH', 'Avg_Air_Temp', 'Avg_Water_Temp', 'Avg_TDS']
    
    raw_yield = MODEL.predict(df_in[features])[0]

    return float(raw_yield * health_score)

def generate_lettuce_growth_curve(current_values, locked_variables):
    """
    Simulates growth points based on a quadratic curve.
    Formula: weight = a * (day^2)
    Parameters:
    ----------------------
    current_values: A dictionary containing the current values for the growth simulation.
    locked_variables: A dictionary containing the variables that are locked at specific values.
    Returns:
    ----------------------
    A list of tuples (day, weight) representing the growth curve from day 0 to day 40.
    """

    # Get the predicted final weight at day 40 using current values
    final_weight = predict_yield_with_rails(current_values)
    #get the predicted weight if the metrics are optimized
    optimal_values = get_optimal_environment(locked_variables)
    optimal_weight = predict_yield_with_rails(optimal_values)
    # Calculate the growth coefficient 'a'
    # Derived from: final_weight = a * (40^2) 
    a = final_weight / (1600)
    b = optimal_weight / (1600)
    
    # Generate the list of tuples (day, weight)
    growth_data_baseline = []
    growth_data_optimized = []
    for day in range(41):
        # Calculate weight for the current day
        current_weight = a * (day ** 2)
        optimized_weight = b * (day ** 2)
        
        # Store as (day, weight) 
        growth_data_baseline.append((day, round(current_weight, 2)))
        growth_data_optimized.append((day, round(optimized_weight, 2)))

        
    return growth_data_baseline, growth_data_optimized