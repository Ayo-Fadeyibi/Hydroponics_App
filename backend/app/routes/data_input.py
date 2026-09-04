from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from io import BytesIO
import pandas as pd
from ml.UserDataModels.predict import generate_graph, get_feature_importance
from app.models.types import SensorDataRequest
from ml.LLM.feature_2_get_guidance import UserDataAdvice, get_user_data_guidance
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Response Model Type 

class GraphResults(BaseModel):
    optimal_array: list[tuple[float, float]]
    current_array: list[tuple[float, float]]
    domain: int
    max_growth: float


# Endpoint Functions

"""
Base URL for testing
"""
@router.get("/")
async def get_data(): 
    return {"message" : "Data input page running"}


"""
POST UploadFile type to endpoint from FE 
then process into dataframe
then run the graphs function 
"""
@router.post("/results", response_model=GraphResults)
async def get_graph_data(file: UploadFile = File(...), forecast_day_num: int = Form(...)): 
    # read contents of file 
    contents = await file.read() 
    
    # Strip off the unecessary comment lines from the excel file. 
    raw_df = pd.read_excel(BytesIO(contents), header=None)
    header_row_idx = next(
        (i for i, row in raw_df.iterrows()
         if any(str(cell).strip().lower() == "days" for cell in row)),
        0,
    )
    df = pd.read_excel(BytesIO(contents), header=header_row_idx)

    given_coords, forecast_coords, domain, graph_range = generate_graph(df, forecast_day_num)

    return GraphResults(
        optimal_array=list(forecast_coords),
        current_array=list(given_coords),
        domain=int(domain),
        max_growth=float(graph_range),
    )
 

"""
Receives request body "LLMRequest" with file and crop name payload. s
Return UserDataAdvice object (Pydantic model) - containing field 'advice' 
that can be accessed for LLM generated advice. 
"""
@router.post("/llm", response_model=UserDataAdvice)
async def get_llm_advice(crop: str = Form(...), file: UploadFile = File(...)):

    logger.info("LLM ADVICE crop=%s, file=%s", crop, file)
    try:

        # need to read the file contents into a df 
        contents = await file.read() 
        # Strip off the unecessary comment lines from the excel file. 
        raw_df = pd.read_excel(BytesIO(contents), header=None)
        header_row_idx = next(
            (i for i, row in raw_df.iterrows()
            if any(str(cell).strip().lower() == "days" for cell in row)),
            0,
        )
        df = pd.read_excel(BytesIO(contents), header=header_row_idx)

        feature_importance = get_feature_importance(df)

        return get_user_data_guidance(feature_importance, crop)

    except ValueError as e:
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    