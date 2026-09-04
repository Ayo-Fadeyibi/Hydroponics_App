## Usage Guide


### DataFrame structure
For all functions, the pandas dataframe given must maintain a certain structure. The data must contain a "days" column, representing the number of days data collected has taken place. Furthermore, the data must contain a response variable column with the heading being one of "Number of fruit (quantity)", "Yield Weight (g)", "Plant Height (cm)". Ensure that only one of these is present. Ensure that the data has at least 3 points in it and that there are no missing values (although this will be handled internally).

### Generating Graphs

To generate information to create a graph of the user's collected data as well as the forecasted growth metrics, pass a dataframe containing the user's collected information with appropriate column names. The default number of days to predict for is 7, although this can be specified.

This is an example usage of the generate_graph() function
```
df = df #Ensure appropriate headings
num_days = 14 #Forecasting for 2 weeks

given_data, forecast_data, domain, graph_range = generate_graph(df, num_days)
```
given_data is an array of tuples representing x,y coordinates that the user has provided through df.
forecast_data is an array of tuples representing x,y coordinates that the model has predicted for future growth
domain is the domain of the function, represented as the right endpoint (i.e graphing over domain [0, domain])
graph_range is the range of the function, represented as the max y-value (i.e graphing over range [0, Range])


### Generating Feature Insights

To get feature importance, reflected through coefficients of the parameters the get_feature_importance() function can be run. This returns a dictionary mapping parameter names to their coefficient score. The score will be some transformation of the coefficients of the underlying regression model and can be interpreted as "larger number is better" with positive values increasing outputs, and negative numbers decreasing outputs.

Example Usage:

```
from predict import *


featureImportance = get_feature_importance(df, num_days)

print(featureImportance)
```