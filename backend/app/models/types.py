from typing import Optional, Dict
from pydantic import BaseModel, Field
from typing import Union, Annotated, Literal

# ------------------------- Define Request and Response Models ----------------------

# Utilises Pydantic to define models 

# Reponse Data

class LettuceSensorData(BaseModel):
    Avg_pH: float
    Avg_EC: float
    Avg_CO2: float
    Avg_RH: float
    Avg_Air_Temp: float
    Avg_Water_Temp: float
    Avg_TDS: float

class TomatoSensorData(BaseModel):
    Avg_pH: float
    Avg_EC: float
    Avg_CO2: float
    Avg_RH: float
    Avg_Air_Temp: float
    Avg_DLI: float

class CucumberSensorData(BaseModel):
    Avg_pH: float
    Avg_EC: float
    Avg_CO2: float
    Avg_RH: float
    Avg_Air_Temp: float
    Avg_DLI: float

# this is the same for all crop types 
class PredictionData(BaseModel):
    crop: str
    harvest_weight: float

class OptimisationData(BaseModel):
    crop: str
    optimal_environment: Union[LettuceSensorData, TomatoSensorData, CucumberSensorData]
    optimal_yield: float

# Request Data 

class LettuceSensorDataRequest(LettuceSensorData):
    crop: Literal["lettuce"]

class TomatoSensorDataRequest(TomatoSensorData):
    crop: Literal["tomato"]

class CucumberSensorDataRequest(CucumberSensorData):
    crop: Literal["cucumber"]

# Union Type for different sensor data per crop type 
SensorDataRequest = Annotated[
    Union[LettuceSensorDataRequest, TomatoSensorDataRequest, CucumberSensorDataRequest],
    Field(discriminator="crop")
]

class ConstrainedSensorData(BaseModel):
    Avg_pH: Optional[float] = None
    Avg_EC: Optional[float] = None
    Avg_CO2: Optional[float] = None
    Avg_RH: Optional[float] = None
    Avg_Air_Temp: Optional[float] = None
    Avg_Water_Temp: Optional[float] = None
    Avg_TDS: Optional[float] = None
    Avg_DLI: Optional[float] = None

# LLM Request for Simulate Page

class LLMRequest(BaseModel):
    sensor_data: SensorDataRequest
    constrained_sensor_data: ConstrainedSensorData
    optimal_environment: Optional[Dict[str, float]] = None


# Generating Graph Response for Simulate Page 

class LettuceGraphResponse(BaseModel): 
    crop: Literal["lettuce"]
    baseline_curve: list[tuple[int, float]]
    optimised_curve: list[tuple[int, float]]


class ComparisonGraphResponse(BaseModel):
    crop: Literal["cucumber", "tomato"]
    optimal_array: list[tuple[float, float]]
    current_array: list[tuple[float, float]]
    domain: int
    max_growth: float

GraphResponse = Union[LettuceGraphResponse, ComparisonGraphResponse]
