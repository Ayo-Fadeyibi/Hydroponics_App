## Usage Guide


### Customising Model

The model draws from two prefitted scikit-learn models found in backend/trained_models/Cucumber. These can be customised and interchanged to any valid sklearn linear model, although for meaningful optimisation ensure that at least one model has interaction terms via the PolynomialFeatures class.

To add a different model, customise the load_model() function in predict.py

```
 PROBABILITY_MODEL_PATH = trained_models_path / "YOUR_PROBABILITY_MODEL.pkl"
 GROWTH_MODEL_PATH = trained_models_path / "YOUR_GROWTH_MODEL.pkl"
```

CucumberProbabilityModel.pkl and CucumberGrowthModel.pkl contain previously fitted models.


### Prediction

To generate a prediction for the weight of a cucumber plant, import the whole predict.py file, ensuring that the model has access to an appropriate scikit-learn model via a .pkl file as discussed above. Then pass a dictionary containing sensor readings. The function will return a numpy array containing the predicted weight in grams after 100 days of cucumber growth.



```
import predict


#Adjust sensor data to parameters to predict

sensor\_data = {"Avg\_Air\_Temp": 31.219,
                 "Avg\_RH":64.178, 
                 "Avg\_CO2":449.833,
                 "Avg\_EC":3.2,
                 "Avg\_pH":4.3,
                 "Avg\_DLI":43}

#Order of parameters doesn't matter, but important to ensure names stay same

predicted\_weight = predict(sensor\_data)

print(predicted\_weight)

```

**Output:**

[228.67896329]




### Optimisation

To optimise without restricting any parameters, import predict and run optimise() with no parameters, or an empty dictionary. To optimise with set parameters, pass a dictionary containing the name of the parameter as a key, and the fixed value as the value. The function optimise() will return a dictionary mapping every parameter to its optimal value for growth at day 100. Uses Optuna studies to optimise parameters.

```
import predict

fixed_parameters = {
    #Insert your fixed parameters here
    "Avg_RH": 100
}


#Empty optimisation
free_parameter = optimise()
print(free_parameter)

fixed_parameter = optimise(fixed_parameters)

print(fixed_parameter)
```


**Output:**
({'Avg_Air_Temp': 27.99753, 'Avg_RH': 89.428062, 'Avg_CO2': 895.0551, 'Avg_EC': 4.497113, 'Avg_pH': 6.932297, 'Avg_DLI': 50.088277, 'days': 100}, 357.9599)
({'Avg_Air_Temp': 27.67346373711578, 'Avg_RH': 100, 'Avg_CO2': 975.6725150911942, 'Avg_EC': 5.498853029138131, 'Avg_pH': 6.390453683179952, 'Avg_DLI': 50.100595751160725, 'days': 100.0}, 236.07740201790892)

### Generating Graphs

To generate a graph comparing fruit production for current and optimal setups, pass a dictionary mapping parameter names to the current values, as well as a dictionary mapping parameter names to optimal values, similar to what is returned from optimise(). The domain can also be customised, but is set to 100 by default as this is reflective of the values given in the data. The function will return two arrays, one with current predictions and the other with optimal growth values. It will also return the domain and range to help with plotting

An example usage for optimisation with no restrictions is:

```
from predict import *

sensor\_data = {"Avg\_Air\_Temp": 31.219,
                 "Avg\_RH":64.178, 
                 "Avg\_CO2":449.833,
                 "Avg\_EC":3.2,
                 "Avg\_pH":4.3,
                 "Avg\_DLI":43}

optimal_params = optimise()

current_vals, optimal_vals, domain, Range = generate_graph(sensor_data, optimal_params)


```


