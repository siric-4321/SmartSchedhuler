# --------------------------------------------------------------
# AI-GENERATED TEST CODE (ChatGPT)
# Prompt: "Generate unit tests for Event and ScheduleManager."
# --------------------------------------------------------------

import unittest
import sys
import os

# Fix import path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from event import Event
from schedule_manager import ScheduleManager


# ==============================================================
# UNIT TESTS FOR EVENT CLASS
# ==============================================================

class TestEvent(unittest.TestCase):

    def test_duration_valid(self):
        """Duration should correctly return numeric hour difference."""
        e = Event("Lecture", "2025-03-05", 9, 11)
        self.assertEqual(e.duration(), 2)

    def test_duration_invalid(self):
        """Invalid types should return None (placeholder behavior)."""
        e = Event("BadEvent", "2025-03-05", "nine", 11)
        self.assertIsNone(e.duration())

    def test_conflicts_when_overlap(self):
        """Overlapping events should return True."""
        e1 = Event("A", "2025-03-05", 9, 10)
        e2 = Event("B", "2025-03-05", 9.5, 11)
        self.assertTrue(e1.conflicts_with(e2))

    def test_conflicts_when_no_overlap(self):
        """Non-overlapping events return False."""
        e1 = Event("A", "2025-03-05", 9, 10)
        e2 = Event("B", "2025-03-05", 10, 11)
        self.assertFalse(e1.conflicts_with(e2))

    def test_conflicts_different_dates(self):
        """Events on different dates never conflict."""
        e1 = Event("A", "2025-03-05", 9, 10)
        e2 = Event("B", "2025-03-06", 9, 10)
        self.assertFalse(e1.conflicts_with(e2))


# ==============================================================
# UNIT TESTS FOR SCHEDULEMANAGER CLASS
# ==============================================================

class TestScheduleManager(unittest.TestCase):

    def setUp(self):
        self.manager = ScheduleManager()

    def test_add_event_adds_to_list(self):
        """Basic add event should store event."""
        e = Event("CS Lecture", "2025-03-05", 9, 10)
        self.manager.add_event(e)
        self.assertIn(e, self.manager.events)

    def test_add_event_conflict_prints_warning(self):
        """Add event with conflict should still store but warn."""
        e1 = Event("A", "2025-03-05", 9, 10)
        e2 = Event("B", "2025-03-05", 9.5, 11)

        self.manager.add_event(e1)

        # Capture printed output
        import io
        import sys
        captured = io.StringIO()
        sys.stdout = captured

        self.manager.add_event(e2)

        sys.stdout = sys.__stdout__

        self.assertIn("Warning: Conflict detected", captured.getvalue())
        self.assertIn(e2, self.manager.events)

    def test_find_next_available_time_no_events(self):
        """If day empty → return default placeholder time."""
        time = self.manager.find_next_available_time("2025-03-05")
        self.assertEqual(time, "8:00 AM")

    def test_find_next_available_time_after_events(self):
        """Returns latest end time for the given date."""
        e1 = Event("A", "2025-03-05", 9, 10)
        e2 = Event("B", "2025-03-05", 10, 12)
        self.manager.add_event(e1)
        self.manager.add_event(e2)

        result = self.manager.find_next_available_time("2025-03-05")
        self.assertIn("12", result)


# ==============================================================
# INTEGRATION TEST
# ==============================================================

class TestIntegration(unittest.TestCase):

    def test_integration_add_and_available(self):
        """
        Tests multiple components together:
        Event creation → add_event → detect latest slot.
        """
        manager = ScheduleManager()
        ev1 = Event("CS Lecture", "2025-03-05", 9, 10)
        ev2 = Event("Study", "2025-03-05", 10, 11)

        manager.add_event(ev1)
        manager.add_event(ev2)

        next_slot = manager.find_next_available_time("2025-03-05")

        self.assertIn("11", next_slot)


if __name__ == "__main__":
    unittest.main()
