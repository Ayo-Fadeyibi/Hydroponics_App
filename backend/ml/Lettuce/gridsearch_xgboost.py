import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, GridSearchCV, KFold
from sklearn.feature_selection import RFECV
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
from pathlib import Path


# Define file paths
current_dir = Path.cwd()
final_dir = current_dir.parent
lettuce_raw_data_dir = final_dir / "data" / "raw" / "Lettuce"
lettuce_processed_data_dir = final_dir / "data" / "processed" / "Lettuce"


# 1. Load your complete dataset
df = pd.read_csv(lettuce_processed_data_dir / "Hydro_ML_Augmented_Master.csv")


# 2. Feature Engineering
df['pH_sq'] = df['Avg_pH'] ** 2
df['EC_CO2_Interact'] = df['Avg_EC'] * df['Avg_CO2']

all_features = [
    'Avg_pH', 'pH_sq', 'Avg_EC', 'Avg_CO2', 'EC_CO2_Interact', 
    'Avg_RH', 'Avg_Air_Temp', 'Avg_Water_Temp', 'Avg_TDS'
]
X = df[all_features]
y = df['Yield_Weight_g']

# 3. Explicitly define the Proper CV Strategy
# Shuffling to ensure the 3 experiments are mixed evenly
cv_strategy = KFold(n_splits=5, shuffle=True, random_state=42)

# 4. Inner Loop: Pruning (RFECV)
selector = RFECV(
    estimator=xgb.XGBRegressor(objective='reg:squarederror', random_state=42),
    step=1,
    cv=cv_strategy, # Inner CV
    scoring='r2',
    n_jobs=-1
)

# 5. The Pipeline
pipeline = Pipeline([
    ('selector', selector),
    ('regressor', xgb.XGBRegressor(objective='reg:squarederror', random_state=42))
])

# 6. Outer Loop: Tuning (GridSearchCV)
param_grid = {
    'regressor__n_estimators': [300, 500],
    'regressor__max_depth': [4, 6],
    'regressor__learning_rate': [0.01, 0.05],
    'selector__min_features_to_select': [5, 7]
}

grid_search = GridSearchCV(
    pipeline, 
    param_grid, 
    cv=cv_strategy, # Outer CV
    scoring='r2', 
    verbose=1, 
    n_jobs=-1
)

# 7. Execute
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
grid_search.fit(X_train, y_train)

# 8. Results
best_pipe = grid_search.best_estimator_
selected_features = np.array(all_features)[best_pipe.named_steps['selector'].support_]

print(f"\n--- NESTED CV RESULTS ---")
print(f"Selected Features: {list(selected_features)}")
print(f"Final Test R² Score: {r2_score(y_test, best_pipe.predict(X_test)):.4f}")
print(f"Final Test MAE: {mean_absolute_error(y_test, best_pipe.predict(X_test)):.4f}")
# 9. Save the Best Pipeline
#joblib.dump(best_pipe, 'trained_models / pruned_optimized_hydro_model.joblib')
#print("\nModel saved as 'pruned_optimized_hydro_model.joblib'")