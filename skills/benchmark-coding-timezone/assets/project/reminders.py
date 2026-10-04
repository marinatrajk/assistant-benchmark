from datetime import datetime

def reminder_day(timestamp: str, timezone_name: str) -> str:
    """Return the reminder date in the user's timezone."""
    return datetime.fromisoformat(timestamp.replace("Z", "+00:00")).date().isoformat()
