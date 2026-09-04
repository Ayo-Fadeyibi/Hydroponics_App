from abc import ABC, abstractmethod
from ml.Lettuce import predict as predictLettuce
from ml.Cucumber import predict as predictCucumber
from ml.Tomato import predict as predictTomato
from .types import LettuceGraphResponse, ComparisonGraphResponse

def _to_float(val) -> float:
    """Safely convert a numpy scalar or array to a Python float."""
    if hasattr(val, 'item'):
        return val.item()
    return float(val)

# ---------------------------- DYNAMIC CROP MODELS ------------------------------

class CropModel(ABC):
    """
        Abstract Base Class of a Crop Type Model.
        Cannot be implemented, but forces each crop type child class to implement
        predict_yield() function. 
    """

    @abstractmethod
    def predict_yield(self, sensor_data: dict) -> dict:
        pass

    @abstractmethod
    def get_optimised_levels(self, constrained_sensor_data: dict) -> dict:
        pass

    @abstractmethod
    def get_graph(self, sensor_data: dict, constrained_sensor_data: dict):
        pass


class LettuceModel(CropModel):
    """    
    A class representing a Lettuce crop type.
    """

    def predict_yield(self, sensor_data: dict) -> dict:
        predicted_harvest_weight = predictLettuce.predict_yield_with_rails(sensor_data)

        return {
            "crop": "lettuce",
            "harvest_weight": _to_float(predicted_harvest_weight),
        }

    def get_optimised_levels(self, constrained_sensor_data: dict) -> dict:
        optimal_env = predictLettuce.get_optimal_environment(constrained_sensor_data)
        optimal_env = {k: round(v, 1) for k, v in optimal_env.items()}
        optimised_yield = predictLettuce.predict_yield_with_rails(optimal_env)

        return {
            "crop": "lettuce",
            "optimal_environment": {k: _to_float(v) for k, v in optimal_env.items()},
            "optimal_yield": _to_float(optimised_yield),
        }

    def get_graph(self, sensor_data: dict, constrained_sensor_data: dict):
        growth_data_baseline, growth_data_optimized = predictLettuce.generate_lettuce_growth_curve(sensor_data, constrained_sensor_data)

        return LettuceGraphResponse(
            crop="lettuce",
            baseline_curve=growth_data_baseline,
            optimised_curve=growth_data_optimized
        )


class CucumberModel(CropModel):
    """    
    A class representing a Cucumber crop type.
    """

    def predict_yield(self, sensor_data: dict) -> dict:
        predicted_harvest_weight = predictCucumber.predict(sensor_data)

        return {
            "crop": "cucumber",
            "harvest_weight": _to_float(predicted_harvest_weight),
        }

    def get_optimised_levels(self, constrained_sensor_data: dict) -> dict:
        result = predictCucumber.optimize(constrained_sensor_data)
        optimal_env = result[0]
        optimal_yield = result[1]

        return {
            "crop": "cucumber",
            "optimal_environment": {k: _to_float(v) for k, v in optimal_env.items()},
            "optimal_yield": _to_float(optimal_yield),
        }

    def get_graph(self, sensor_data: dict, constrained_sensor_data: dict):
        optimal_conditions, _ = predictCucumber.optimize(constrained_sensor_data)
        given_coords, forecast_coords, domain, graph_range = predictCucumber.generate_graph(sensor_data, optimal_conditions)

        return ComparisonGraphResponse(
            crop="cucumber",
            optimal_array=forecast_coords,
            current_array=given_coords,
            domain=domain,
            max_growth=graph_range
        )
 

class TomatoModel(CropModel):
    """    
    A class representing a Tomato crop type.
    """

    def predict_yield(self, sensor_data: dict) -> dict:
        predicted_harvest_weight = predictTomato.predict(sensor_data)

        return {
            "crop": "tomato",
            "harvest_weight": _to_float(predicted_harvest_weight),
        }

    def get_optimised_levels(self, constrained_sensor_data: dict) -> dict:
        result = predictTomato.optimize(constrained_sensor_data)
        optimal_env = result[0]
        optimal_yield = result[1]

        return {
            "crop": "tomato",
            "optimal_environment": {k: _to_float(v) for k, v in optimal_env.items()},
            "optimal_yield": _to_float(optimal_yield),
        }

    def get_graph(self, sensor_data: dict, constrained_sensor_data: dict):
        optimal_conditions, _ = predictTomato.optimize(constrained_sensor_data)
        given_coords, forecast_coords, domain, graph_range = predictTomato.generate_graph(sensor_data, optimal_conditions)
    
        return ComparisonGraphResponse(
            crop="tomato",
            optimal_array=forecast_coords,
            current_array=given_coords,
            domain=domain,
            max_growth=graph_range
        )
 
    

# ---------------------------- CROP FACTORY FUNCTION: ------------------------------

# Mapping of crop string type to CropModel class
CROP_REGISTRY: dict[str: type[CropModel]] = {
    'lettuce'  : LettuceModel,
    'cucumber' : CucumberModel, 
    'tomato'   : TomatoModel,
}

def get_crop_model(crop_type : str) -> CropModel: 
    """
        Factory function -- 
        Given a crop_type, returns and instantiates a new crop object of given type. 
    """
    crop_type = crop_type.lower()

    # raise error if invalid crop type provided 
    if crop_type not in CROP_REGISTRY: 
        raise ValueError(f"Unknown crop type provided: '{crop_type}'.")

    return CROP_REGISTRY[crop_type]() 