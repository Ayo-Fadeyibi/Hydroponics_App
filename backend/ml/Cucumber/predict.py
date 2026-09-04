import numpy as np
import joblib
from pathlib import Path
import optuna



#------------------------------------------------------
# Model Setup/Loading
#------------------------------------------------------
#Order Of Parameters (needed for linear algebra)
PARAMETER_ORDER = ["Avg_Air_Temp","Avg_RH", "Avg_CO2","Avg_EC","Avg_pH","Avg_DLI", "days"]


#Prelearned Optimal Parameters and Values for Efficienty
PRELEARNED_OPTIMAL = {'Avg_Air_Temp': 27.7, 
                      'Avg_RH': 100.0, 
                      'Avg_CO2': 499.5, 
                      'Avg_EC': 3.5, 
                      'Avg_pH': 6.9,
                      'Avg_DLI': 44.8, 
                      'days': 100.0}

PRELEARNED_OPTIMAL_VALUE = 398.74611383828

#Function to Load the scikit learn models from file
def load_models():
    """Function to load models from .pkl file if file exists. Only loads scikit-learn regression
        components rather than full model class."""
    current_file = Path(__file__).resolve()
    backend_folder = current_file.parent.parent.parent
    trained_models_path = backend_folder / "trained_models" / "Cucumber"

    PROBABILITY_MODEL_PATH = trained_models_path / "CucumberProbabilityModel.pkl"
    GROWTH_MODEL_PATH = trained_models_path / "CucumberGrowthModel.pkl"

    prob_model, growth_model = None, None
    if PROBABILITY_MODEL_PATH.exists() and GROWTH_MODEL_PATH.exists():
        prob_model = joblib.load(PROBABILITY_MODEL_PATH)
        growth_model = joblib.load(GROWTH_MODEL_PATH)
        if not hasattr(prob_model, 'multi_class'):
            prob_model.multi_class = 'ovr'

    return prob_model, growth_model

probModelRegressor, growthModelRegressor = load_models()

#Class Definitions For Model
class ProbabilityModel():
    """Model to predict the probability of fruit growth. Uses Logistic Regression and a penalty
      function that enforces real-world biological constraints
      (i.e ensures that parameters are realistic)"""

    def __init__(self, regressor):
        self.LogReg = regressor #Loaded from .pkl file

        self.upper = np.array([26, 100, 1300, 6, 7.0, 44, 200]) #Upper Parameter Limits
        self.lower = np.array([20, 40, 500, 1.0, 5.5, 0, 0])  #Lower Parameter Limits

        self.weights = np.array([ #Weights for each paramter
            1/23.909,  # temperature
            1/86,  # humidity
            1/748,  # CO2 
            1/2.65,  # EC
            1/6,  # pH 
            1/26,  # DLI
            0.0   # days (Not Penalised)
            ])
    def fit(self, X, y): #Shouldn't be called as model is already trained
        self.LogReg.fit(X.values,y.values)
    def predict(self, X):
        """
        Parameters
        -----------------------
            X : Numpy Array of values in specific order (see PARAMETER_ORDER)
        Returns
        ---------------------------
            p : probability of fruit growth (as array)"""
        preds = self.LogReg.predict_proba(X)[:,1]

        penalty = self.penalty(X)
        return preds * penalty
    
    def penalty(self, X):
        """Penalty term for 'biologically unrealistic' parameter values.
            Weighted based on self.weights"""
        X = np.asarray(X)

        violation = np.clip(self.lower - X, 0, None) + np.clip(X - self.upper, 0, None)

        weights = self.weights 

        weighted_violation = (violation ** 2) * weights

        penalty = np.exp(-0.5 * weighted_violation)
        return np.prod(penalty, axis=1)
    def score(self, X,y): #Won't be used, for testing purposes only
        score = self.LogReg.score(X,y)
        return score


class GrowthModel():
    """Model to predict the amount of cumulative growth of fruit given the fact that
    the plant is growing fruit. Uses linear regression with interaction terms"""
    def __init__(self, regressor):
        self.LinReg = regressor
    def fit(self, X, y):
        self.LinReg.fit(X.values, y.values)
    def predict(self, X):
        preds = self.LinReg.predict(X)
        preds = np.clip(preds, 0, None)

        return preds
    def score(self, X,y):
        score = self.LinReg.score(X,y)
        return score


#Loaded models into class objects
probModel = ProbabilityModel(probModelRegressor)
growthModel = GrowthModel(growthModelRegressor)




#----------------------------------------
#Predict Functions
#-----------------------------------------
def predict(sensor_data) -> list:
    """Predicts weight of plant given parameters at day 100
        Parameters
        -----------------------------
        sensor_data: dictionary mapping environemnt parameter names (from PARAMETER_ORDER)
                     to parameter values.
        Returns
        ------------------------------
        p: Probability of fruit growth at day 150 given parameters
        mu: Expected fruit growth given that fruits exist
        p*mu: Predicted weight of fruits grown given parameters
        """
    day = 100.0

    data = np.full((len(PARAMETER_ORDER)), day) #Have to leave space for the "days" column
    for key in sensor_data:
        if key in PARAMETER_ORDER:
           data[PARAMETER_ORDER.index(key)] = sensor_data[key] #Loading data into array

    data = data.reshape(1, -1)
    #Prob Model represents the probability of fruit growth
    
    p = probModel.predict(data)

    #Growth Model represent expected growth given the plant is growing
    

    mu = growthModel.predict(data)


    return p * mu


#----------------------------------------
#Optimisation Functions
#-----------------------------------------
def expected_growth(x):
    """Helper Function For Optimization. Predicts weight given array of parameters
        Parameters
        -----------------
        x: Array of parameters in order PARAMETER_ORDER
        Returns
        -----------------
        p*m: Scalar value representing predicted growth given x"""
    x = np.array(x).reshape(1, -1)

    p = probModel.predict(x)
    m = growthModel.predict(x)

    return (p * m)[0]

def objective_optuna(trial, fixed_params):
    """Function used in optuna optimisation.
        Parameters
        ---------------------
        trial: Values of free parameters in current trial
        fixed_params: Values of fixed parameters in optimisation setup
        Returns
        ---------------------
        expected_growth(x): Expected weight of fruit given parameters"""
    x = [None] * 7

    bounds = [
        (14, 35),
        (30, 100),
        (300, 1500),
        (0.5, 5.5),
        (4.5, 8),
        (8, 60),
        (100, 100),
    ]


    for i, (low, high) in enumerate(bounds):
        if fixed_params and PARAMETER_ORDER[i] in fixed_params:
            x[i] = fixed_params[PARAMETER_ORDER[i]]
        elif i == 6:
            x[i] = 100
        else:
            x[i] = trial.suggest_float(f"{PARAMETER_ORDER[i]}", low, high, step=0.1)

    return expected_growth(x)

def optimize(sensor_data = {}) -> dict:
    """Optimsation Function. Returns optimal paramter values for custom setup using optuna study
        Parameters
        ------------------------
        sensor_data: dictionary containing fixed parameters in optimisation setup
        Returns
        ------------------------
        optimal_conds_dict: dictionary mapping parameter names (see PARAMETER_ORDER) to
                            optimal values. Contains free and fixed parameters
        optimal_val:        Predicted weight of fruit grown given optimal setup"""

    if not sensor_data:
        #Empty dictionary, all parameters free, return pretrained optimal
       return PRELEARNED_OPTIMAL, PRELEARNED_OPTIMAL_VALUE
    

    #Setting up "study" which optimizes environment
    sampler = optuna.samplers.TPESampler(seed=42)
    optuna.logging.set_verbosity(optuna.logging.WARNING)
    study = optuna.create_study(study_name = "name", direction="maximize", sampler = sampler)
    study.optimize(lambda trial:
                   objective_optuna(trial, fixed_params = sensor_data),
                     n_trials=100)
    #Reduce n_trials if too slow



    optimal_conds = study.best_value

    optimal_conds = study.best_params
    optimal_val = study.best_value

    optimal_conds_dict = {}

    #Merging sensor data and optimal dictionaries
    for parameter in PARAMETER_ORDER[:-1]:
        if parameter in optimal_conds:
          optimal_conds_dict[parameter] = optimal_conds[parameter]
        else:
          optimal_conds_dict[parameter] = sensor_data[parameter]
    
    return optimal_conds_dict, optimal_val

#----------------------------------------------------------
# Graphing Functions
#----------------------------------------------------------

def generate_graph(current_conds, optimal_conds, domain = 100) -> list:
    """Function that generates two arrays of tuples for graphing a comparison between the 
        optimal conditions and the current conditions over an 100 day period
        Parameters
        -------------------------------
        current_conds: dictionary mapping parameters to current values
        optimal_conds: dictionary mapping parameters to optimal values (like from optimise())
        domain: # of days to predict for

        Returns
        -----------------------------------
        optimal_array: array of x-y coordinate tuples representing optimal growth
        current_array: array of x-y coordinate tuples representing current setup predicted growth
        domain: scalar representing domain of graph (i.e # of x-y tuples)
        max_growth:  scalar representing range of graph (i.e maximum value) """
    

    current_data = np.zeros((domain,len(PARAMETER_ORDER))) #Preallocating matrix
    print(current_data.shape)
    optimal_data = np.zeros((domain,len(PARAMETER_ORDER)))

    for key in current_conds:
        if key in PARAMETER_ORDER:
           current_data[:,PARAMETER_ORDER.index(key)] = current_conds[key] #Loading data into array

    for key in optimal_conds:
        if key in PARAMETER_ORDER:
           optimal_data[:,PARAMETER_ORDER.index(key)] = optimal_conds[key] #Loading data into array

    
    days = np.arange(0,domain,step = 1).T
    current_data[:,-1] = days #Populating days column
    optimal_data[:,-1] = days

    p = probModel.predict(current_data)
    mu = growthModel.predict(current_data)

    current_preds = p * mu #Array of values representing predicted growth

    p_star = probModel.predict(optimal_data)
    mu_star = growthModel.predict(optimal_data)

    optimal_preds = p_star * mu_star #Array of values representing optimal growth

    optimal_coords = list(zip(days, optimal_preds)) #Creating array of tuples
    current_coords = list(zip(days, current_preds))

    max_growth = optimal_preds.max()
    
    
    if optimal_preds[-1] <= current_preds[-1]:
        #Ensuring predicted value doesn't exceed optimal
        current_conds = optimal_conds.copy()

    return current_coords, optimal_coords, domain, max_growth


    




