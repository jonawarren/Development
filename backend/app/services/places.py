import asyncio
import math
from typing import List, Optional
import httpx
from app.config import settings
from app.services.matching import MatchedPreferences

PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby"

FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.currentOpeningHours",
    "places.internationalPhoneNumber",
    "places.googleMapsUri",
    "places.photos",
    "places.types",
    "places.location",
])

PRICE_LEVEL_MAP = {
    1: "PRICE_LEVEL_INEXPENSIVE",
    2: "PRICE_LEVEL_MODERATE",
    3: "PRICE_LEVEL_EXPENSIVE",
    4: "PRICE_LEVEL_VERY_EXPENSIVE",
}

# Map cuisine names to Google Places types for filtering
CUISINE_TO_TYPES = {
    "american": ["american_restaurant"],
    "italian": ["italian_restaurant"],
    "mexican": ["mexican_restaurant"],
    "japanese": ["japanese_restaurant"],
    "chinese": ["chinese_restaurant"],
    "indian": ["indian_restaurant"],
    "thai": ["thai_restaurant"],
    "mediterranean": ["mediterranean_restaurant"],
    "korean": ["korean_restaurant"],
    "french": ["french_restaurant"],
    "greek": ["greek_restaurant"],
    "vietnamese": ["vietnamese_restaurant"],
    "seafood": ["seafood_restaurant"],
    "sushi": ["sushi_restaurant"],
    "pizza": ["pizza_restaurant"],
    "burgers": ["hamburger_restaurant"],
    "steakhouse": ["steak_house"],
}


def _haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 3958.8
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def _search_one_keyword(
    client: httpx.AsyncClient,
    keyword: str,
    latitude: float,
    longitude: float,
    radius_meters: int,
) -> List[dict]:
    cuisine_lower = keyword.lower()
    included_types = CUISINE_TO_TYPES.get(cuisine_lower, ["restaurant"])

    body = {
        "includedTypes": included_types,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": latitude, "longitude": longitude},
                "radius": float(radius_meters),
            }
        },
        "rankPreference": "POPULARITY",
        "maxResultCount": 20,
    }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.google_places_api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    try:
        resp = await client.post(PLACES_URL, json=body, headers=headers, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()
        return data.get("places", [])
    except Exception:
        return []


async def find_restaurants(
    prefs: MatchedPreferences,
    latitude: float,
    longitude: float,
) -> List[dict]:
    cuisines = prefs.cuisines[:5] if prefs.cuisines else ["restaurant"]

    semaphore = asyncio.Semaphore(3)

    async def limited_search(keyword: str):
        async with semaphore:
            return await _search_one_keyword(
                client, keyword, latitude, longitude, prefs.radius_meters
            )

    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*[limited_search(c) for c in cuisines])

    # Deduplicate by place_id
    seen: set = set()
    all_places = []
    for batch in results:
        for place in batch:
            pid = place.get("id")
            if pid and pid not in seen:
                seen.add(pid)
                all_places.append(place)

    # Build allowed price levels
    allowed_prices = {
        PRICE_LEVEL_MAP[p]
        for p in range(prefs.price_min, prefs.price_max + 1)
        if p in PRICE_LEVEL_MAP
    }

    restaurants = []
    for place in all_places:
        rating = place.get("rating", 0)
        if rating < 4.0:
            continue

        price_level = place.get("priceLevel", "PRICE_LEVEL_MODERATE")
        if allowed_prices and price_level not in allowed_prices:
            continue

        loc = place.get("location", {})
        place_lat = loc.get("latitude", latitude)
        place_lon = loc.get("longitude", longitude)
        distance = _haversine_miles(latitude, longitude, place_lat, place_lon)

        if distance > prefs.max_distance_miles:
            continue

        hours = place.get("currentOpeningHours", {})
        weekday_descs = hours.get("weekdayDescriptions", [])
        hours_today = weekday_descs[0] if weekday_descs else None

        photo_url = None
        photos = place.get("photos", [])
        if photos and settings.google_places_api_key:
            photo_name = photos[0].get("name", "")
            if photo_name:
                photo_url = (
                    f"https://places.googleapis.com/v1/{photo_name}/media"
                    f"?maxHeightPx=400&maxWidthPx=600&key={settings.google_places_api_key}"
                )

        restaurants.append({
            "place_id": place.get("id"),
            "name": place.get("displayName", {}).get("text", "Unknown"),
            "address": place.get("formattedAddress", ""),
            "rating": rating,
            "review_count": place.get("userRatingCount", 0),
            "price_level": _price_label(price_level),
            "distance_miles": round(distance, 2),
            "open_now": hours.get("openNow", True),
            "hours_today": hours_today,
            "phone": place.get("internationalPhoneNumber"),
            "google_maps_url": place.get("googleMapsUri"),
            "photo_url": photo_url,
            "types": place.get("types", []),
            "health_score": None,
        })

    # Sort: rating desc, then review count desc
    restaurants.sort(key=lambda r: (-r["rating"], -r["review_count"]))
    return restaurants[:10]


def _price_label(price_level: str) -> str:
    mapping = {
        "PRICE_LEVEL_FREE": "Free",
        "PRICE_LEVEL_INEXPENSIVE": "$",
        "PRICE_LEVEL_MODERATE": "$$",
        "PRICE_LEVEL_EXPENSIVE": "$$$",
        "PRICE_LEVEL_VERY_EXPENSIVE": "$$$$",
    }
    return mapping.get(price_level, "$$")
