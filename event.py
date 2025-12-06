# --------------------------------------------------------------
# AI-GENERATED CODE (ChatGPT)
# Prompt: "Generate a basic Event class for a smart scheduler 
# with attributes and simple methods that may not fully work."
# --------------------------------------------------------------
class Event:
    """
    Represents a scheduled event with a title, date, time range, 
    and an optional location.
    """

    def __init__(self, title, date, start_time, end_time, location=None):
        self.title = title
        self.date = date
        self.start_time = start_time
        self.end_time = end_time
        self.location = location

    def duration(self):
        """
        Return the duration of the event in hours.
        Uses simple subtraction and does not handle edge cases.
        """
        try:
            return self.end_time - self.start_time
        except Exception:
            return None  # fallback placeholder

    def conflicts_with(self, other):
        """
        Determine if this event overlaps with another event.
        Assumes both events occur on the same date and times are numeric.
        """
        if self.date != other.date:
            return False

        # Overlap occurs unless one ends before the other begins
        return not (
            self.end_time <= other.start_time or
            self.start_time >= other.end_time
        )

    def __str__(self):
        location_str = f" at {self.location}" if self.location else ""
        return f"{self.title} on {self.date} from {self.start_time}–{self.end_time}{location_str}"
