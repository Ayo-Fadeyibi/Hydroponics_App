from .get_lettuce_guidance import get_lettuce_llm_guidance
from .get_tomato_guidance import get_tomato_llm_guidance
from .get_cucumber_guidance import get_cucumber_llm_guidance

def get_llm_guidance(current_metrics, locked_variables, crop_type, optimal_environment=None):
    """Central function to get LLM guidance on user data on any of the three crops we support (lettuce, tomatoes, cucumbers)
        Parameters:
        ----------------------
        current_metrics: dictionary mapping each parameter with its current value
        locked_variables: dictionary mapping of parameters that the user cannot change (e.g. "Temperature: 25")
        crop_type: string of what plant the user is growing (e.g. "Cucumbers")
        optimal_environment: dictionary mapping each parameter to its optimal value for growth (optional)
        Returns:
        ----------------------
        advice: 1 paragraph summary of the situation"""
    crop = crop_type.lower()
    if crop == "lettuce":
        return get_lettuce_llm_guidance(current_metrics, locked_variables, optimal_environment)
    elif crop == "tomato":
        return get_tomato_llm_guidance(current_metrics, locked_variables, optimal_environment)
    elif crop == "cucumber":
        return get_cucumber_llm_guidance(current_metrics, locked_variables, optimal_environment)
    else:
        raise ValueError(f"Unsupported crop type: {crop_type}")