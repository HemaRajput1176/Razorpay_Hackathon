import datetime
from typing import Dict, List, Any

class SlidingWindowState:
    """
    In-memory state manager for sliding time windows and sequence tracking.
    """
    def __init__(self):
        # Key: (rule_id, asset_id, source_ip) -> List of (event_id, timestamp, event_type)
        self.buffers: Dict[str, List[tuple]] = {}

    def push_event(self, key: str, event_id: str, timestamp: datetime.datetime, event_type: str):
        if key not in self.buffers:
            self.buffers[key] = []
        self.buffers[key].append((event_id, timestamp, event_type))

    def clean_expired(self, key: str, window_seconds: int, now: datetime.datetime) -> List[tuple]:
        if key not in self.buffers:
            return []
        cutoff = now - datetime.timedelta(seconds=window_seconds)
        valid = [item for item in self.buffers[key] if item[1] >= cutoff]
        self.buffers[key] = valid
        return valid

window_state_manager = SlidingWindowState()
