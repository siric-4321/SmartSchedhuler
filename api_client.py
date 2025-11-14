"""
api_client.py
Handles all communication with external scheduling / calendar APIs.
Provides clean Python objects to the rest of the app.
"""

import requests
from datetime import datetime

class APIClient:
    """
    Generic API client for pulling schedule/event data.
    Replace BASE_URL and endpoints with your actual API.
    """
    BASE_URL = "https://api.example.com/v1"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def _get(self, endpoint: str, params=None):
        """Internal GET wrapper."""
        url = f"{self.BASE_URL}/{endpoint}"
        response = requests.get(url, headers=self.headers, params=params)

        if response.status_code != 200:
            raise Exception(f"API error {response.status_code}: {response.text}")

        return response.json()

    def fetch_events(self):
        """
        Fetch raw events from the API.
        Adjust endpoint based on your actual API.
        """
        raw = self._get("events/upcoming")
        return raw


# ----------------------------------------
# DATA NORMALIZATION LAYER
# ----------------------------------------

class Event:
    """
    Your internal event model — matches your app’s structure,
    not the external API’s messy structure.
    """
    def __init__(self, event_id, title, start, end, location=None, metadata=None):
        self.event_id = event_id
        self.title = title
        self.start = start
        self.end = end
        self.location = location
        self.metadata = metadata or {}

    def __repr__(self):
        return f"<Event {self.title} @ {self.start}>"


class EventParser:
    """
    Converts messy API JSON → clean Event objects.
    Modify this to match your API’s format.
    """

    @staticmethod
    def parse(raw_event: dict) -> Event:
        return Event(
            event_id=raw_event.get("id"),
            title=raw_event.get("name"),
            start=EventParser._parse_time(raw_event.get("start_time")),
            end=EventParser._parse_time(raw_event.get("end_time")),
            location=raw_event.get("location", None),
            metadata={
                "source": raw_event.get("source"),
                "priority": raw_event.get("priority"),
            }
        )

    @staticmethod
    def _parse_time(timestamp: str):
        if timestamp is None:
            return None
        return datetime.fromisoformat(timestamp.replace("Z", "+00:00"))


# ----------------------------------------
# HIGH-LEVEL FUNCTION USED BY APP
# ----------------------------------------

def load_events(api_key: str):
    """
    Public function the smart scheduler calls.
    Returns a list of Event objects.
    """
    client = APIClient(api_key)
    parser = EventParser()

    raw_events = client.fetch_events()
    return [parser.parse(e) for e in raw_events]
