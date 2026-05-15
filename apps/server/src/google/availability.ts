export interface BusyInterval {
  start: string;
  end: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailabilityOptions {
  timeMin: string;
  timeMax: string;
  slotMinutes: number;
}

export function buildAvailableSlots(
  busyIntervals: BusyInterval[],
  options: AvailabilityOptions,
): TimeSlot[] {
  const timeMin = Date.parse(options.timeMin);
  const timeMax = Date.parse(options.timeMax);
  const slotMs = options.slotMinutes * 60 * 1000;

  if (!Number.isFinite(timeMin) || !Number.isFinite(timeMax) || timeMin >= timeMax) {
    throw new Error(
      "timeMin/timeMax must be valid ISO datetimes and timeMin must be before timeMax",
    );
  }
  if (!Number.isFinite(slotMs) || slotMs <= 0) {
    throw new Error("slotMinutes must be a positive number");
  }

  const busy = normalizeBusyIntervals(busyIntervals, timeMin, timeMax);
  const slots: TimeSlot[] = [];

  for (let slotStart = timeMin; slotStart + slotMs <= timeMax; slotStart += slotMs) {
    const slotEnd = slotStart + slotMs;
    const overlapsBusy = busy.some(
      (interval) => interval.start < slotEnd && slotStart < interval.end,
    );
    if (!overlapsBusy) {
      slots.push({
        startTime: new Date(slotStart).toISOString(),
        endTime: new Date(slotEnd).toISOString(),
      });
    }
  }

  return slots;
}

function normalizeBusyIntervals(
  busyIntervals: BusyInterval[],
  timeMin: number,
  timeMax: number,
): Array<{ start: number; end: number }> {
  return busyIntervals
    .map((interval) => ({
      start: Math.max(Date.parse(interval.start), timeMin),
      end: Math.min(Date.parse(interval.end), timeMax),
    }))
    .filter((interval) => Number.isFinite(interval.start) && Number.isFinite(interval.end))
    .filter((interval) => interval.start < interval.end)
    .sort((a, b) => a.start - b.start);
}
