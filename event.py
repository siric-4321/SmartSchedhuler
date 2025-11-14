# --------------------------------------------------------------
# AI-GENERATED CODE (ChatGPT)
# Prompt: "Generate a basic Event class for a smart scheduler 
# with attributes and simple methods that may not fully work."
# --------------------------------------------------------------

class Event:
    def __init__(self, title, date, start_time, end_time, location=None):
        """Initialize an event with basic attributes."""
        self.title = title
        self.date = date
        self.start_time = start_time
        self.end_time = end_time
        self.location = location

    def duration(self):
        """Return event duration in hours (placeholder logic)."""
        try:
            return self.end_time - self.start_time
        except:
            return None  # placeholder error handling

    def conflicts_with(self, other_event):
        """Check if two events overlap (simplified, incomplete logic)."""
        if self.date != other_event.date:
            return False
        
        return not (self.end_time <= other_event.start_time or 
                    self.start_time >= other_event.end_time)

    def __str__(self):
        return f"{self.title} on {self.date} from {self.start_time}-{self.end_time}"
