#!/usr/bin/env python3
"""Prints today's genre based on the day of the week."""
import datetime

SCHEDULE = {
    0: "comedy",
    1: "educational",
    2: "emotional",
    3: "comedy",
    4: "educational",
    5: "emotional",
    6: "comedy",
}

print(SCHEDULE[datetime.datetime.utcnow().weekday()])
