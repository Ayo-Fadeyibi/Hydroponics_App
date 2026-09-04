from feature_2_get_guidance import *


"""df = pd.read_csv("ml/UserDataModels/exampleCSV.csv")
feature_importance = get_feature_importance(df)
print(preprocess_feature_importance(feature_imporance))

print (get_user_data_guidance(feature_imporance, "Cucumbers"))"""

fake_feature_importance = {
    "pH": -0.8,
    "Temperature": 0.6,
    "Light": 0.4,
    "Humidity": -0.2,
    "Nutrient Concentration": 0.1
}
print(preprocess_feature_importance(fake_feature_importance))
ai_output = get_user_data_guidance(fake_feature_importance, "Tomatoes")
print(ai_output)