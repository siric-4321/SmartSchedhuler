import heapq

class CampusMap:
    """
    A model of campus walking distances with helper methods,
    shortest-path search, and estimated walking time.
    """

    DEFAULT_UNKNOWN_DISTANCE = 1000  # fallback when no distance known
    DEFAULT_WALK_SPEED = 80          # meters per minute

    def __init__(self):
        # adjacency list { location: { connected_location: distance } }
        self.distances = {}

        # initial sample data
        self.add_location("Room 120", "Library", 450)
        self.add_location("Library", "Dining Hall", 300)
        self.add_location("Room 120", "Dining Hall", 600)

    # ------------------------------------------------------------
    # Helper Methods
    # ------------------------------------------------------------

    def add_location(self, loc_a, loc_b, distance):
        """Add or update symmetric distances between locations."""
        if loc_a not in self.distances:
            self.distances[loc_a] = {}
        if loc_b not in self.distances:
            self.distances[loc_b] = {}

        self.distances[loc_a][loc_b] = distance
        self.distances[loc_b][loc_a] = distance

    def has_path(self, loc_a, loc_b):
        return loc_a in self.distances and loc_b in self.distances[loc_a]

    def list_locations(self):
        return list(self.distances.keys())

    def list_connections(self, loc):
        return self.distances.get(loc, {})

    # ------------------------------------------------------------
    # Basic Functionality
    # ------------------------------------------------------------

    def get_distance(self, loc_a, loc_b):
        """Return walking distance between two locations."""
        if loc_a == loc_b:
            return 0

        if self.has_path(loc_a, loc_b):
            return self.distances[loc_a][loc_b]

        return self.DEFAULT_UNKNOWN_DISTANCE

    # ------------------------------------------------------------
    # Walking Time Estimation
    # ------------------------------------------------------------

    def estimate_walking_time(self, distance, speed_m_per_min=None):
        """
        Estimate walking time in minutes.
        Default speed ≈ 80 meters per minute (normal campus walk).
        """
        if speed_m_per_min is None:
            speed_m_per_min = self.DEFAULT_WALK_SPEED

        return distance / speed_m_per_min

    # ------------------------------------------------------------
    # Shortest Path (Dijkstra)
    # ------------------------------------------------------------

    def get_shortest_path(self, start, end, speed_m_per_min=None):
        """
        Return shortest walking path using Dijkstra.

        Returns:
            (path, total_distance, estimated_time_minutes)

        If path missing:
            returns ([], DEFAULT_UNKNOWN_DISTANCE, estimated_time)
        """

        if start not in self.distances or end not in self.distances:
            dist = self.DEFAULT_UNKNOWN_DISTANCE
            return [], dist, self.estimate_walking_time(dist, speed_m_per_min)

        # Priority queue items: (distance_so_far, node, path_list)
        pq = [(0, start, [start])]
        visited = set()

        while pq:
            dist, node, path = heapq.heappop(pq)

            if node in visited:
                continue
            visited.add(node)

            if node == end:
                # compute estimated time
                time_min = self.estimate_walking_time(dist, speed_m_per_min)
                return path, dist, time_min

            for neighbor, neighbor_dist in self.distances[node].items():
                if neighbor not in visited:
                    heapq.heappush(
                        pq,
                        (dist + neighbor_dist, neighbor, path + [neighbor])
                    )

        # no path available
        dist = self.DEFAULT_UNKNOWN_DISTANCE
        return [], dist, self.estimate_walking_time(dist, speed_m_per_min)
