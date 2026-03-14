from dataclasses import dataclass
from typing import List, Set
from app.models.survey import SurveyResponse


@dataclass
class MatchedPreferences:
    cuisines: List[str]
    dietary_restrictions: List[str]
    price_min: int
    price_max: int
    atmospheres: List[str]
    max_distance_miles: float
    radius_meters: int


def merge_preferences(a: SurveyResponse, b: SurveyResponse) -> MatchedPreferences:
    # Cuisines: intersect liked, fall back to union minus avoided
    liked_a = set(a.cuisines_liked)
    liked_b = set(b.cuisines_liked)
    avoided = set(a.cuisines_avoided) | set(b.cuisines_avoided)

    cuisines = liked_a & liked_b
    if not cuisines:
        cuisines = (liked_a | liked_b) - avoided

    cuisines = cuisines - avoided

    # Dietary: union (most restrictive)
    dietary = set(a.dietary_restrictions) | set(b.dietary_restrictions)

    # Price: overlapping window, widen if no overlap
    price_min = max(a.price_min, b.price_min)
    price_max = min(a.price_max, b.price_max)
    if price_min > price_max:
        price_min = min(a.price_min, b.price_min)
        price_max = max(a.price_max, b.price_max)

    # Atmospheres: intersect, fall back to union
    atm_a = set(a.atmospheres)
    atm_b = set(b.atmospheres)
    atmospheres = atm_a & atm_b
    if not atmospheres:
        atmospheres = atm_a | atm_b

    # Distance: most restrictive
    max_distance = min(a.max_distance_miles, b.max_distance_miles)
    radius_meters = int(max_distance * 1609.34)

    return MatchedPreferences(
        cuisines=sorted(cuisines),
        dietary_restrictions=sorted(dietary),
        price_min=price_min,
        price_max=price_max,
        atmospheres=sorted(atmospheres),
        max_distance_miles=max_distance,
        radius_meters=radius_meters,
    )
