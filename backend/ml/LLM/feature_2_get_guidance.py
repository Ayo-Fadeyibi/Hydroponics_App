import logging
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
import os


# Set up logging & client
logging.basicConfig(level=logging.INFO, filename='hydro_backend.log')
load_dotenv() 
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    logging.error("Missing GEMINI_API_KEY in .env file!")
    client = None
else:
    client = genai.Client(api_key=api_key)

class UserDataAdvice(BaseModel):
    most_influential_feature: str = Field(description="1 sentence summary of the most influential features and their impact direction")
    strongest_feature: str = Field(description="The single most influential feature and its impact direction, along with an example of how it affects growth")
    advice_per_feature: list[str] = Field(description="Specific advice for each influential feature")
    general_advice: str = Field(description="Overall advice based on the feature importance analysis")


def preprocess_feature_importance(feature_importance):
    """
    Converts feature importance into a string for LLM input.
    Filters out features with an absolute impact < 10% of the maximum impact.
    Returns the top 3 significant features.

        Parameters: 
        ----------------------
        feature_importance: dictionary mapping each parameter with how much it affects growth
        Returns:   
        ----------------------
        A string summarizing the most influential features and their impact direction.
    """
    if not feature_importance:
        return "No significant features identified."
    
    # 1. Determine the 'Noise Floor' (10% of the highest absolute value)
    max_impact = max(abs(v) for v in feature_importance.values())
    threshold = max_impact * 0.1
    
    # 2. Sort by absolute magnitude
    sorted_features = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)
    
    top_descriptions = []
    
    # 3. Iterate and apply both the threshold and the "Top 3" limit
    for feature, coef in sorted_features:
        # Stop if we already found 3, or if the current feature is below the threshold
        if len(top_descriptions) >= 3:
            break
        
        if abs(coef) >= threshold:
            impact_direction = "positive" if coef > 0 else "negative"
            top_descriptions.append(f"{feature} ({impact_direction} impact)(score:{coef:.2f})")
        else:
            # Since sorted_features is descending, once we hit one below threshold, 
            # all subsequent ones will also be below it.
            break

    if not top_descriptions:
        return "No significant features identified."

    return "The most influential features are: " + ", ".join(top_descriptions) + "."

# --- CONFIGURATION ---
gen_config = types.GenerateContentConfig(
    system_instruction=(
        "You are a hydroponics expert. Your goal is to read and interpret "
        "the given feature importance analysis from a user's plant growth data," 
        "and provide practical advice based on the most influential features. \n\n"
        
        "### 1. INTERPRETING FEATURE IMPORTANCE\n"
        "The feature importance analysis identifies which parameters (like pH, temperature, etc.) "
        "have the most significant impact on plant growth. Each feature is labeled as having a positive or negative impact."
        "The features are ranked by their importance.\n\n"

        "### 2. PROVIDING ADVICE\n"
        "Based on the top 3 most influential features, provide actionable advice to the user. "
        "For example, if pH has a strong negative impact, you might suggest adjusting the"   
        "pH levels. If temperature has a strong positive impact, you might suggest maintaining or optimizing the temperature."
        "Mention which features are most influential based on their ranking.\n\n"
    ),
    temperature=0.3, 
    response_mime_type="application/json",
    response_schema=UserDataAdvice
)

def get_user_data_guidance(feature_importance, plant):
    """Function to get LLM guidance on user data
        Parameters:
        ----------------------
        feature_importance: dictionary mapping each parameter with how much it affects growth
        plant: string of what plant the user is growing (e.g. "Cucumbers")
        Returns:
        ----------------------
        advice: 1 paragraph summary of the situation"""
    
    if not client:
        return UserDataAdvice(
            most_influential_feature="Error: LLM client not initialized."
        )

    preprocessed_importance = preprocess_feature_importance(feature_importance)

    data_payload = f"Plant: {plant}\n{preprocessed_importance}"
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=data_payload,
            config=gen_config
        )
        return response.parsed
    except Exception as e:
        logging.error(f"API Error: {e}")
        return UserDataAdvice(
            most_influential_feature="System unavailable."
        )