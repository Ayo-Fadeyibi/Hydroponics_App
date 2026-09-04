from fastapi import APIRouter, HTTPException
from app.models.types import SensorDataRequest, PredictionData, OptimisationData, ConstrainedSensorData, LLMRequest, GraphResponse
from app.models import crops
from ml.LLM.get_cucumber_guidance import HydroponicAdvice
from ml.LLM.central_get_guidance import get_llm_guidance

router = APIRouter()

# ----------------------------- Define simulate/ routes -------------------------------

"""
Base URL for testing
"""
@router.get("/")
async def get_simulate(): 
    return {"message" : "Simulate page running"}

"""
Receives request body of sensor_data and crop_type param
Return prediction_results object 
"""
@router.post("/predict/{crop_type}", response_model=PredictionData)
async def get_yield_prediction(crop_type: str, sensor_data: SensorDataRequest):

    try: 
        # Retrieve appropriate crop type object  
        crop_object = crops.get_crop_model(crop_type)

        # call dynamic predict_yield() function 
        prediction_results = crop_object.predict_yield(sensor_data.model_dump(exclude={"crop"}))

        return prediction_results
    
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=404, detail=str(e))


"""
Receives request body of sensor_data (with frozen constraints) and crop_type param
Return optimized_level results objects  
"""
@router.post("/optimise/{crop_type}", response_model=OptimisationData)
async def get_optimised_levels(crop_type: str, constrained_sensor_data: ConstrainedSensorData):

    try: 
        # Retrieve appropriate crop type object  
        crop_object = crops.get_crop_model(crop_type)

        # call dynamic predict_yield() function  
        # strips any None fields - keeps only constrained conditions  
        optimisation_results = crop_object.get_optimised_levels(constrained_sensor_data.model_dump(exclude_none=True))

        return optimisation_results
    
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=404, detail=str(e))


"""
Returns graphing coordinates for the predicted yields for different crop types 
"""
@router.post("/graph/{crop_type}", response_model=GraphResponse)
async def get_graph(crop_type: str, sensor_data: SensorDataRequest, constrained_sensor_data: ConstrainedSensorData):

    try: 
        # Retrieve appropriate crop type object  
        crop_object = crops.get_crop_model(crop_type)

        graph_results = crop_object.get_graph(sensor_data.model_dump(exclude={"crop"}), constrained_sensor_data.model_dump(exclude_none=True))

        return graph_results
    
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=404, detail=str(e))


"""
Receives request body of sensor_data, locked constraints & crop_type param
Return HydroponicAdvice object (Pydantic model) - which contains LLM advice 
based on your current set up and plant. 
"""
@router.post("/llm/{crop_type}", response_model=HydroponicAdvice)
async def get_optimised_levels(crop_type: str, body: LLMRequest):

    try:
        return get_llm_guidance(body.sensor_data.model_dump(exclude={"crop"}),
                                body.constrained_sensor_data.model_dump(exclude_none=True),
                                crop_type,
                                body.optimal_environment)
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
