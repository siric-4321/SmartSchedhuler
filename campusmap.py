# --------------------------------------------------------------
# AI-GENERATED CODE (ChatGPT)
# Prompt: "Create a simple CampusMap class that stores
# rough walking distances between campus locations and
# exposes a get_distance method. It can use placeholder
# values and does not need to be accurate."
# --------------------------------------------------------------

class CampusMap:
    """
    A simple model of campus walking distances.

    Distances are approximate placeholder values measured in meters.
    """

    DEFAULT_UNKNOWN_DISTANCE = 1000  # fallback when distance is not defined

    def __init__(self):
        # Hard-coded sample distances; can be replaced with real data later.
        self.distances = {
            ("Room 120", "Library"): 450,
            ("Library", "Dining Hall"): 300,
            ("Room 120", "Dining Hall"): 600,
        }

    def get_distance(self, loc_a, loc_b):
        """
        Return the approximate walking distance between two locations.

        If locations are the same, return 0.
        If no stored distance exists, return DEFAULT_UNKNOWN_DISTANCE.
        """
        if loc_a == loc_b:
            return 0

        # Distances are symmetric, so try both key orders
        return self.distances.get(
            (loc_a, loc_b),
            self.distances.get((loc_b, loc_a), self.DEFAULT_UNKNOWN_DISTANCE)
        )