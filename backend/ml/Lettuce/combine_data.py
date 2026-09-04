import pandas as pd
import numpy as np
from pathlib import Path


# Define file paths
current_dir = Path.cwd()
final_dir = current_dir.parent
lettuce_raw_data_dir = final_dir / 'data' / 'raw' / 'Lettuce'
lettuce_processed_data_dir = final_dir / 'data' / 'processed' / 'Lettuce'

# --- 1. SETUP & CONFIGURATION ---
files = {
    'EXP1': lettuce_raw_data_dir / 'EXP.1. Environmental Conditions and Plant Measurements.xlsx',
    'EXP2': lettuce_raw_data_dir / 'EXP.2. Environmental Conditions and Plant Measurements.xlsx',
    'EXP3': lettuce_raw_data_dir / 'EXP.3. Environmental Conditions and Plant Measurements.xlsx'
}

# Specific sheet names and skip-logic for different Excel structures
SHEETS = {
    'EXP1': {'senso': 'Water quality measurments Senso', 'port': 'Water quality parametersPortabl', 'harv': 'Harvest measurements 842024', 'skip': 1},
    'EXP2': {'senso': 'Water quality measurments Senso', 'port': 'Water quality parametersPortabl', 'harv': 'Harvest measurements', 'skip': 1},
    'EXP3': {'senso': 'Water quality measurments Senso', 'port': 'Water quality parametersPortabl', 'harv': 'Harvest measurements 1862024', 'skip': 2}
}

def normalize_rep(name):
    if pd.isna(name): return name
    return str(name).replace('Replicate ', 'R').replace(' ', '-').strip()

# --- 2. DATA EXTRACTION ---
all_exp_data = []

for exp_id, file_path in files.items():
    print(f"Processing {exp_id}...")
    cfg = SHEETS[exp_id]
    
    # A. Room Data (Senso) - RH, Air Temp, CO2
    df_s = pd.read_excel(file_path, sheet_name=cfg['senso'], skiprows=1)
    room_stats = {
        'Avg_RH': pd.to_numeric(df_s.iloc[:, 8], errors='coerce').mean(),
        'Avg_Air_Temp': pd.to_numeric(df_s.iloc[:, 9], errors='coerce').mean(),
        'Avg_CO2': pd.to_numeric(df_s.iloc[:, 10], errors='coerce').mean()
    }

    # B. Water Quality (Portable) - pH, EC, TDS, Water Temp
    df_p = pd.read_excel(file_path, sheet_name=cfg['port'], header=None)
    reps_row, params_row = df_p.iloc[1], df_p.iloc[2]
    
    rep_metrics = {}
    curr_rep = None
    for i in range(len(df_p.columns)):
        if pd.notna(reps_row[i]):
            curr_rep = normalize_rep(reps_row[i])
            if curr_rep not in rep_metrics: rep_metrics[curr_rep] = {}
        
        # STRICT FILTER: Skip anything related to T3
        if curr_rep and "T3" not in curr_rep:
            p_name = str(params_row[i]).strip().lower()
            vals = pd.to_numeric(df_p.iloc[3:, i], errors='coerce').dropna()
            if 'ph' in p_name: rep_metrics[curr_rep]['Avg_pH'] = vals.mean()
            elif 'ec' in p_name: rep_metrics[curr_rep]['Avg_EC'] = vals.mean()
            elif 'tds' in p_name: rep_metrics[curr_rep]['Avg_TDS'] = vals.mean()
            elif 'water temp' in p_name: rep_metrics[curr_rep]['Avg_Water_Temp'] = vals.mean()

    # C. Harvest Data (Yield)
    df_h = pd.read_excel(file_path, sheet_name=cfg['harv'], skiprows=cfg['skip'])
    df_h.columns = [str(c).strip() for c in df_h.columns]
    weight_col = [c for c in df_h.columns if 'Total weight' in c][0]
    
    active_rep = None
    for _, row in df_h.iterrows():
        first_val = str(row.iloc[0]).strip()
        
        # Check for Replicate Header or EXP3 System Column
        if 'R' in first_val and '-' in first_val:
            active_rep = None if 'T3' in first_val else first_val
            continue
        if 'System' in df_h.columns:
            active_rep = str(row['System']).strip()
            if 'T3' in active_rep: active_rep = None

        if active_rep:
            try:
                weight = pd.to_numeric(row[weight_col], errors='coerce')
                if pd.isna(weight) or weight == 0: continue
                
                all_exp_data.append({
                    'Experiment': exp_id, 'Replicate': active_rep, 'Yield_Weight_g': weight,
                    **room_stats, **rep_metrics.get(active_rep, {})
                })
            except: continue

# Create Base Dataframe
df_base = pd.DataFrame(all_exp_data).dropna()

# --- 3. DATA AUGMENTATION (Gaussian Noise) ---
def augment_data(df, multiplier=10):
    """Creates new rows by adding small random noise to sensor features."""
    augmented_frames = [df]
    
    # Define standard deviations for biologically realistic noise
    noise_levels = {
        'Avg_pH': 0.02, 'Avg_EC': 0.05, 'Avg_TDS': 0.02,
        'Avg_RH': 0.5, 'Avg_Air_Temp': 0.2, 'Avg_Water_Temp': 0.2, 'Avg_CO2': 5.0
    }
    
    for _ in range(multiplier - 1):
        df_new = df.copy()
        for feature, std in noise_levels.items():
            if feature in df_new.columns:
                df_new[feature] += np.random.normal(0, std, size=len(df_new))
        augmented_frames.append(df_new)
        
    return pd.concat(augmented_frames, ignore_index=True)

# Expand the dataset 20x
df_augmented = augment_data(df_base, multiplier=20)

# Save Results
df_augmented.to_csv(lettuce_processed_data_dir / 'Hydro_ML_Augmented_Master.csv', index=False)

print(f"Merge Complete. T3 excluded.")
print(f"Original valid plants: {len(df_base)}")
print(f"Final Augmented dataset: {len(df_augmented)} rows.")