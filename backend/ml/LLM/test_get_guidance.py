from central_get_guidance import get_llm_guidance

VALID_CROP_TYPES = {
    "tomato": "Tomato",
    "lettuce": "Lettuce",
    "cucumber": "Cucumber",
}

def run_test(scenario_name, crop_type, sensors, locked):
    normalized_crop_type = VALID_CROP_TYPES.get(crop_type.strip().lower())
    if not normalized_crop_type:
        raise ValueError(f"Unsupported crop type: {crop_type}")

    print(f"\n{'='*20} TESTING SCENARIO: {scenario_name} ({normalized_crop_type}) {'='*20}")
    print(f"Locked Variables: {locked}")
    
    advice = get_llm_guidance(sensors, locked, normalized_crop_type)

    print(f"Status: {advice.status}")
    print(f"Summary: {advice.advice_summary}")
    print(f"Priority: {advice.priority_score}/10")
    
    if not advice.action_steps or "no actions required" in advice.action_steps[0].lower():
        print("Action Steps: No actions required.")
    else:
        print("Action Steps:")
        for i, step in enumerate(advice.action_steps, 1):
            print(f"  {i}. {step}")
    print("-" * 60)

# --- Define Your Test Cases ---
test_scenarios = [

    {
        "name": "VENTILATION CONFLICT (High CO2 + Low Humidity)",
        "crop_type": "lettuce",
        "locked": {},
        "sensors": {
            'Avg_pH': 6.26, 'Avg_EC': 2.32,
            'Avg_CO2': 800,   # High (Needs more fan)
            'Avg_RH': 40.0,   # Low (Needs less fan)
            'Avg_Air_Temp': 22, 'Avg_DLI': 28
        }
    },
    
]

# --- Execution ---
if __name__ == "__main__":
    for scenario in test_scenarios:
        run_test(scenario["name"], scenario["crop_type"], scenario["sensors"], scenario["locked"])