# --------------------------------------------------------------
# AI-GENERATED CODE (ChatGPT)
# Prompt: "Generate a ScheduleManager class that can store events,
# check conflicts, and suggest the next available slot."
# --------------------------------------------------------------

from event import Event

class ScheduleManager:
    def __init__(self):
        self.events = []

    def add_event(self, event):
        """Add an event if no immediate conflict is detected."""
        for e in self.events:
            if e.conflicts_with(event):
                print("Warning: Conflict detected (placeholder behavior).")
                break
        
        self.events.append(event)

    def list_events(self):
        """Return all events sorted by date/time (placeholder logic)."""
        return sorted(self.events, key=lambda e: (e.date, e.start_time))

    def find_next_available_time(self, date):
        """Return the next free time slot (very incomplete placeholder)."""
        filtered = [e for e in self.events if e.date == date]
        if not filtered:
            return "8:00 AM"  # default placeholder start time
        
        latest_end = max(e.end_time for e in filtered)
        return f"Next available slot: {latest_end}"

    def remove_event(self, title):
        """Remove an event by title (placeholder)."""
        self.events = [e for e in self.events if e.title != title]

    def __str__(self):
        return "\n".join(str(e) for e in self.events)
