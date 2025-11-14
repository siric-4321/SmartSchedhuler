# --------------------------------------------------------------
# AI-GENERATED CODE (ChatGPT)
# Prompt: "Create a simple demo script that uses Event and 
# ScheduleManager with placeholder non-functional behavior."
# --------------------------------------------------------------

from event import Event
from schedule_manager import ScheduleManager

def demo():
    manager = ScheduleManager()

    event1 = Event("CS Lecture", "2025-03-05", 9, 10, "Room 120")
    event2 = Event("Study Session", "2025-03-05", 9.5, 11, "Library")

    manager.add_event(event1)
    manager.add_event(event2)

    print("All Events:")
    print(manager)

    print("\nNext available time on 2025-03-05:")
    print(manager.find_next_available_time("2025-03-05"))

if __name__ == "__main__":
    demo()
