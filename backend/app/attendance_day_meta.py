"""Per-calendar-day labels for attendance grids (weekends, optional holidays)."""

from datetime import date

_WEEKDAY_SHORT = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")


def day_meta_for_range(days: list[str], holiday_dates: set[str] | None = None) -> list[dict[str, str | bool]]:
    holidays = holiday_dates or set()
    out: list[dict[str, str | bool]] = []
    for d in days:
        dt = date.fromisoformat(d)
        wd = dt.weekday()
        out.append(
            {
                "date": d,
                "weekdayShort": _WEEKDAY_SHORT[wd],
                "isWeekend": wd >= 5,
                "isHoliday": d in holidays,
            }
        )
    return out


async def school_holiday_set(db) -> set[str]:
    doc = await db.school_settings.find_one({"key": "default"})
    raw = (doc or {}).get("holidayDates") or []
    return {str(x).strip() for x in raw if str(x).strip()}
