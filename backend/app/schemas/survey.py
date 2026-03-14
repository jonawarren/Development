from typing import List, Optional
from pydantic import BaseModel, field_validator


VALID_CUISINES = {
    "American", "Italian", "Mexican", "Japanese", "Chinese", "Indian",
    "Thai", "Mediterranean", "Korean", "French", "Greek", "Vietnamese",
    "Middle Eastern", "Spanish", "Caribbean", "Ethiopian", "Brazilian",
    "Peruvian", "Sushi", "Pizza", "Burgers", "Seafood", "Steakhouse",
}

VALID_DIETARY = {
    "vegetarian", "vegan", "gluten-free", "halal", "kosher",
    "dairy-free", "nut-free", "pescatarian",
}

VALID_ATMOSPHERES = {
    "casual", "fine dining", "fast casual", "bar/pub",
    "outdoor seating", "family-friendly", "romantic",
}

VALID_DISTANCES = {0.5, 1.0, 2.0, 5.0, 10.0}


class SurveySubmit(BaseModel):
    cuisines_liked: List[str]
    cuisines_avoided: Optional[List[str]] = []
    dietary_restrictions: Optional[List[str]] = []
    price_min: int
    price_max: int
    atmospheres: Optional[List[str]] = []
    max_distance_miles: float

    @field_validator("price_min", "price_max")
    @classmethod
    def price_range(cls, v):
        if v not in (1, 2, 3, 4):
            raise ValueError("price values must be 1–4")
        return v

    @field_validator("max_distance_miles")
    @classmethod
    def valid_distance(cls, v):
        if v not in VALID_DISTANCES:
            raise ValueError(f"max_distance_miles must be one of {sorted(VALID_DISTANCES)}")
        return v


class SurveyInfo(BaseModel):
    token: str
    session_id: str
    already_submitted: bool


class SurveyResult(BaseModel):
    session_id: str
    status: str
