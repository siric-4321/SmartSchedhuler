# --------------------------------------------------------------
# AI-GENERATED CODE (ChatGPT)
# Prompt: "Create a simple CampusMap class that stores
# rough walking distances between campus locations and
# exposes a get_distance method. It can use placeholder
# values and does not need to be accurate."
# --------------------------------------------------------------

class CampusMap:
    """
    Represents a simplified map of campus locations and
    approximate walking distances between them.

    Distances are in meters and are placeholder values.
    """

    def __init__(self):
        # Placeholder hard-coded distances between locations.
        # In PM5 this could be replaced with real data.
        self.distances = {
            ("Room 120", "Library"): 450,
            ("Library", "Dining Hall"): 300,
            ("Room 120", "Dining Hall"): 600,
        }

    def get_distance(self, loc_a, loc_b):
        """
        Return an approximate walking distance between two locations.

        If no distance is known, return a large default value.
        """
        if loc_a == loc_b:
            return 0

        key = (loc_a, loc_b)
        reverse_key = (loc_b, loc_a)

        if key in self.distances:
            return self.distances[key]
        if reverse_key in self.distances:
            return self.distances[reverse_key]

        # Placeholder penalty for unknown pairs
        return 1000