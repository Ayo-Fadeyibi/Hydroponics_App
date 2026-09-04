import logging
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

import sys
import os

# 1. Path Setup to import from sibling Lettuce module
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
from Tomato.predict import optimize

# Set up logging & client
logging.basicConfig(level=logging.INFO, filename='hydro_backend.log')
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    logging.error("Missing GEMINI_API_KEY in .env file!")
    client = None
else:
    client = genai.Client(api_key=api_key)

class HydroponicAdvice(BaseModel):
    status: str = Field(description="Health assessment: Optimal, Suboptimal, or Critical")
    advice_summary: str = Field(description="1-sentence summary of the situation")
    action_steps: list[str] = Field(description="Specific steps to take")
    priority_score: int = Field(ge=1, le=10, description="Urgency from 1 to 10")

# --- CONFIGURATION ---
gen_config = types.GenerateContentConfig(
    system_instruction=(
        "You are a friendly, expert hydroponics coach for beginners. Your goal is to provide "
        "practical, safe, and non-contradictory advice for growing Tomatos. \n\n"
        
        "### 1. THE SIGNIFICANCE RULE\n"
        "Only suggest an action if the gap between Current and Target is meaningful. "
        "Ignore minor fluctuations unless they violate safety rails. Guidance thresholds:\n"
        "- pH: Difference > 0.1\n"
        "- Air Temp: Difference > 1.0°C\n"
        "- EC: Difference > 0.1\n"
        "- CO2: Difference > 25 ppm\n"
        "- Humidity: Difference > 3%\n\n"
        "- DLI: Difference > 5\n\n"

        "### 2. DIRECTIONAL ACCURACY & MATH CHECK\n"
        "Before writing, perform this mental check:\n"
        "- If Current > Target: You must suggest LOWERING the value (Fans, Fresh Water, pH Down).\n"
        "- If Current < Target: You must suggest RAISING the value (Heaters, Nutrients, pH Up).\n"
        "Mistaking the direction is a CRITICAL FAILURE. Double-check your comparison.\n\n"

        "### 3. THE ACTION & NUMERIC RULE\n"
        "- Every step must use a PHYSICAL VERB (Add, Use, Adjust, Move, Turn on).\n"
        "- Every step MUST explicitly state the target number. Example: 'Add pH Down to reach your target of 6.0'.\n\n"

        "### 4. HARDWARE CONFLICT RESOLUTION\n"
        "- UNIFIED VENTILATION: Do not suggest increasing and decreasing ventilation in one response. "
        "Prioritize the most urgent issue and use alternative methods (misting, etc.) for secondary issues.\n"
        
        "### 5. CONSTRAINTS\n"
        "- If a variable is LOCKED, do not suggest any actions for it.\n"
        "- Prioritize Safety violations (CRITICAL status) above all else."

        "### 6. ADVICE SUMMARY RULES\n"
        "- The summary must be two sentences long.\n"
        "- The first sentence should describe the overall situation.\n"
        "- The second sentence should provide a brief recommendation."
        "- Always mention the plant's name (Tomato) in the summary to increase engagement."
    ),
    temperature=0.1, 
    response_mime_type="application/json",
    response_schema=HydroponicAdvice
)

def sanitize_metrics(metrics_dict):
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
    return {
        k: round(float(v), 2) if hasattr(v, "__float__") else v 
        for k, v in metrics_dict.items()
    }

def get_tomato_llm_guidance(current_metrics, locked_variables, optimal_environment=None):
    """
    Function to get LLM guidance on growth metrics on tomatoes

    Parameters:
    ----------------------
    current_metrics: dictionary mapping each parameter with its current value
    locked_variables: dictionary mapping of parameters that the user cannot change (e.g. "Temperature: 25")
    optimal_environment: dictionary mapping each parameter to its optimal value for growth (optional)

    Returns:
    ----------------------
    HydroponicAdvice, A structured object containing:
    - status: Health assessment (Optimal, Suboptimal, or Critical)
    - advice_summary: 2-sentence summary of the situation
    - action_steps: Specific steps to take
    - priority_score: Urgency from 1 to 10
    """
    # 1. Use pre-computed optimal if provided, otherwise run optimization
    if optimal_environment:
        raw_optimal = optimal_environment
    else:
        raw_optimal, _ = optimize(locked_variables)
    clean_optimal = sanitize_metrics(raw_optimal)
    clean_current = sanitize_metrics(current_metrics)
    
    locked_keys = list(locked_variables.keys())

    # 2. Internal Safety Check
    safety_config = {
    'Avg_Air_Temp':         {'dead': (22, 30)}, 
    'Avg_RH': {'dead': (40, 102)}, 
    'Avg_CO2':         {'dead': (300, 1400)}, 
    'Avg_EC':         {'dead': (0.1, 6)},
    'Avg_pH':   {'dead': (5.5, 8)}, 
    'Avg_DLI':         {'dead': (0, 60)}
    }

    critical_issues = []
    for metric_name, thresholds in safety_config.items():
        if metric_name in current_metrics:
            val = current_metrics[metric_name]
            low, high = thresholds['dead']
            if val <= low or val >= high:
                critical_issues.append(f"{metric_name} is at {val}")
    
    status_context = "STABLE" if not critical_issues else f"CRITICAL: {'; '.join(critical_issues)}"

    # 3. Simplified Data Payload

    # 4. Constructing the Data Payload
    data_payload = f"""
    [CRITICAL SAFETY CHECK]: {status_context}
    
    [LOCKED VARIABLES (NO ACTION ALLOWED)]: {locked_keys}
    
    [ENVIRONMENTAL STATE (Affected by Ventilation)]
    - CO2: Current {clean_current.get('Avg_CO2')} (Target {clean_optimal.get('Avg_CO2')})
    - Humidity: Current {clean_current.get('Avg_RH')} (Target {clean_optimal.get('Avg_RH')})
    - Air Temp: Current {clean_current.get('Avg_Air_Temp')} (Target {clean_optimal.get('Avg_Air_Temp')})

    [NUTRIENT STATE (Affected by Reservoir Dosing)]
    - pH: Current {clean_current.get('Avg_pH')} (Target {clean_optimal.get('Avg_pH')})
    - EC: Current {clean_current.get('Avg_EC')} (Target {clean_optimal.get('Avg_EC')})

    [Lighting State (Affected by Grow Lights)]
    - DLI: Current {clean_current.get('Avg_DLI')} (Target {clean_optimal.get('Avg_DLI')})
    
    [TASK]:
    1. Compare the Current vs Target for each variable.
    2. Check the SIGNIFICANCE thresholds. If the gap is too small, do not list it as an action.
    3. Ensure and DOUBLE CHECK that the direction is correct (Higher vs Lower).
    4. Provide 1-3 numbered steps. Each step must have the target number and a physical action.
    5. If everything is within a significant range of the targets, say 'No actions required'.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=data_payload,
            config=gen_config
        )
        return response.parsed
    except Exception as e:
        logging.error(f"API Error: {e}")
        return HydroponicAdvice(
            status="Error",
            advice_summary="System unavailable.",
            action_steps=["Check connection"],
            priority_score=10
        )