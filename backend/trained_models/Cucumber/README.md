# Model Description

The models saved in this folder implement a two-phase hurdle model for predicting expected tomato fruit growth.

The overall expected fruit weight is modelled as

$$
E[\text{Weight}] = P(\text{Growth}) \times E[\text{Weight} \mid \text{Growth}]
$$

where:

- $P(\text{Growth})$ is the probability that fruit growth occurs, and
- $E[\text{Weight} \mid \text{Growth}]$ is the expected fruit weight conditional on growth occurring.


## CucumberProbabilityModel.pkl

A Logistic Regression model used to predict the probability of fruit growth from the provided input features.

This model estimates: $P(\text{Growth})$



## CucumberGrowthModel.pkl

A Ridge Regression model used to predict expected fruit weight conditional on growth occurring.

The model incorporates interaction terms and nonlinear feature transformations to capture more complex relationships in the data.

This model estimates $E[\text{Weight} \mid \text{Growth}]$

## Usage

Load each model into a python file. Create predictions by independently predicting using each model and then multiplying to get prediction. Current usage loads into custom object structure to enforce biological penalty terms but is uneccesary for basic functionality.

```

#Assume x_data is a numpy matrix of data representing hydroponic growth parameters

prob_model = joblib.load(CucumberProbabilityModel.pkl)
growth_model = joblib.load(CucumberGrowthModel.pkl)

p = prob_model.predict(x_data)

mu = prob_model.predict(x_data)

prediction = p * mu

```