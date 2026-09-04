import numpy as np
import pandas as pd
from sklearn import linear_model

    
def forecast_growth(x,y, method, num_days = 7, feature_importance = False) -> list:
    """Function to forecast growth for a specified time period, used
    Parameters
    --------------------
    x: numpy matrix of exogenous variables for prediction with 'days' as 0th index
    y: numpy array of repsonse variables for growth metric
    method: type of model required. Valid types are 'disc', 'cont', 'ZIF' representing different
        types of models, Discrete (count) data, Continuous data and Zero Inflated data.
    num_days: number of days to forecast for, default is 1 week.
    feature_importance: boolean to determine if returning feature importance, or predicted results
    
    Returns
    ---------------------
    feature_importance: if feature_importance, returns coefficients of model, transformed
    preds: array of forecasted growth metrics (appended to given growth metrics)

    """
    #Setting up dataframes
    x_sample = x[-3:].mean(axis = 0)
    x_forecast = np.tile(x_sample, (num_days, 1))
    #Populating days
    x_forecast[:,0] = np.arange(x[:,0].max(), x[:,0].max() + num_days, 1)

    AIC = [float('inf')]
    model = linear_model.LinearRegression(positive=True)

    x_loop = x.copy()
    x_forecast_loop = x_forecast.copy()

    power = 0.25
    while power <= 2:
        #Adding extra non-linear power term
        days_non_lin = x[:, 0] ** power
        x_loop = np.column_stack((x_loop, days_non_lin))

        days_non_lin_f = x_forecast[:, 0] ** power
        x_forecast_loop = np.column_stack((x_forecast_loop, days_non_lin_f))

        model.fit(x_loop, y)
        y_pred = model.predict(x_loop)

        #Calculating AIC and Likelihood
        n = x_loop.shape[0]
        RSS = np.sum((y - y_pred) ** 2)
        likelihood = -n/2 * np.log(2 * np.pi) - n/2 * np.log(RSS / n) - n/2
        k = x_loop.shape[1]

        aic = 2 * k - 2 * likelihood
        AIC.append(aic)
        power += 0.25

    best_idx = AIC.index(min(AIC)) # 1 = first power (0.25), 2 = second (0.5), ...

    n_original_cols = x.shape[1]
    n_best_poly_cols = best_idx   # how many power columns to keep
    best_col_count = n_original_cols + n_best_poly_cols

    x_final = x_loop[:, :best_col_count]
    x_forecast_final = x_forecast_loop[:, :best_col_count]
    model.fit(x_final, y)

    #Returning importance of features
    if feature_importance:
        coef = model.coef_
        return coef
    
    #Recursively predicting growth
    x_total = np.concatenate((x_final, x_forecast_final), axis = 0)
    y_total = y
    for day in range(0, num_days):
        today_idx = x.shape[0] + day
        
        x_total[today_idx][-2] = y_total[-1]
        x_total[today_idx][-3] = y_total[-2]
        x_total[today_idx][-4] = y_total[-3]

        predicted_growth = model.predict([x_total[today_idx]])
        #Ensuring monotonacity
        if predicted_growth < y_total[-1]:
            predicted_growth = [y_total[-1]]

        y_total = np.append(y_total,predicted_growth, axis = 0)
    
    preds = y_total[-num_days:]
    #Ensuring continuous function
    diff = y[-1] - preds[0]
    preds += diff
    if method == "disc":
        preds = np.ceil(preds)


    return preds


def preprocess(df):
    """Function to preprocess a pandas dataframe, by normalising data and converting to numpy array
    Parameters:
    ------------------------
    df: dataframe to preproccess
    Returns:
    ------------------------------
    x: numpy matrix of all exogenous variables, with days as the first column
    y: numpy array of response variable, normalised?
    names: array of column names for index matching purposes
    method: type of model to be used"""
    
    name = ""

    # remove units from col names 
    df.columns = [col.split("(")[0].strip() for col in df.columns]
    # lowercase "days"
    df.columns = ["days" if col.lower() == "days" else col for col in df.columns]

    df = df.dropna(ignore_index=True)

    if "Plant Height" in df.columns:
        name = "Plant Height"
        method = "cont"
    elif "Number of fruit" in df.columns:
        name = "Number of fruit"
        #Checking if data is cumulative or daily
        if not df["Number of fruit"].is_monotonic_increasing:
            df["dummy"] = df["Number of fruit"].copy()
            df["Number of fruit"] = df["dummy"].cumsum()
        method = "disc"
    elif "Yield Weight" in df.columns:
        #Checking if data is cumulative or daily
        if not df["Yield Weight"].is_monotonic_increasing:
            df["dummy"] = df["Yield Weight"].copy()
            df["Yield Weight"] = df["dummy"].cumsum()
        name = "Yield Weight"
        method = "ZIF"
    else:
        raise ValueError("Ensure dataframe has Plant Height, Number of fruit or Yield Weight columns")
    
    y = np.array(df[name])
    #Adding "Lagged" terms, representing previous growth
    df["lag3"] = df[name].shift(3)
    df["lag2"] = df[name].shift(2)
    df["lag1"] = df[name].shift(1)
    df = df.drop(name, axis = 1)
    
    #N/A values here should only be caused by shift()
    df = df.fillna(0)
    cols_to_normalise = df.columns.drop(["days","lag3", "lag2", "lag1"])

    df[cols_to_normalise] = (df[cols_to_normalise] - df[cols_to_normalise].min()) / (
    df[cols_to_normalise].max() - df[cols_to_normalise].min() + 1e-8
    )

    names = df.columns

    x = df.to_numpy()

    


    return x,y,names,method



def generate_graph(df, num_days = 7):
    """Function to generate information needed to graph forecasted growth for
         a specified time period.
        Parameters:
        -----------------------
        df: Pandas Dataframe storing data in a specified structure (See README for more detail)
        num_days: number of days to forecast over

        Returns:
        -----------------------------
        given_coords: array of x-y coordinate tuples representing the user given data
        forecast_coords: array of x-y coordiante tuples representing the forecasted growth
        domain: length of time to plot
        graph_range: range of graph
        """
    x_data, y_data, _, method  = preprocess(df)

    forecast = forecast_growth(x_data, y_data, method, num_days)

    given_coords = list(zip(x_data[:,0], y_data)) 

    domain = x_data[:,0].max() + num_days

    forecast_days = np.arange(x_data[:,0].max(), domain, 1)
    forecast_coords = list(zip(forecast_days, forecast))

    graph_range = max(max(forecast), max(y_data))


    return given_coords, forecast_coords, domain, graph_range


def get_feature_importance(df):
    """Returns the coefficient of each feature in the fitted regression model as a metric
        measuring feature 'importance' and feature direction. i.e how significant is each parameter
        in predicted growth.
        Parameters
        ----------------------
        df: Dataframe in specific structure (see README for more)
        Returns
        ----------------------
        feature_importance: dictionary mapping each parameter with how much it affects growth"""
    
    num_days = 0 #Not important to predict

    x_data, y_data, names, method = preprocess(df)

    coefs = forecast_growth(x_data, y_data, method, num_days, feature_importance=True)

    feature_importance = {}

    for i, name in enumerate(names):
        if name not in  ["days","lag1", "lag2", "lag3"]:
            feature_importance[name] = coefs[i]

    return feature_importance
