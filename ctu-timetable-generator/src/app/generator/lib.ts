import { useToast } from '@chakra-ui/react';
import { DATA_URL } from '@src/consts';
import {
  Course,
  Parallel,
  ParallelOnLoad,
  ParallelType,
  TimeTableEvent,
  WeekType,
  type Data,
  type DataOnLoad,
  TimeTableEventOnLoad,
} from '@src/types';
import { useEffect, useRef, type MutableRefObject } from 'react';
import useSWRImmutable from 'swr/immutable';

export function calcTimeDiff(a: [number, number], b: [number, number]) {
  const aStartTime = a[0] * 60 + a[1];
  const bStartTime = b[0] * 60 + b[1];
  return aStartTime - bStartTime;
}

export function maxTime(a: [number, number], b: [number, number]) {
  return a[0] > b[0] || (a[0] === b[0] && a[1] >= b[1]) ? a : b;
}

function mergeConflictingEventsInTimeTable(
  timetable: TimeTableEvent[],
): TimeTableEvent[] {
  // This will be the result
  const newEvents: TimeTableEvent[] = [];

  // First we need to group the classes by weeks
  const eventsByWeeks = new Map<WeekType, TimeTableEvent[]>();
  for (const event of timetable) {
    if (!eventsByWeeks.has(event.week)) eventsByWeeks.set(event.week, []);
    eventsByWeeks.get(event.week)?.push(event);
  }

  // For each week
  for (const eventsThisWeek of eventsByWeeks.values()) {
    // We need to split the classes by days
    const eventsByDays = new Map<number, TimeTableEvent[]>();
    for (const event of eventsThisWeek) {
      if (!eventsByDays.has(event.day)) eventsByDays.set(event.day, []);
      eventsByDays.get(event.day)?.push(event);
    }

    // For each day (where we have classes)
    for (const events of eventsByDays.values()) {
      // We should merge the overlapping classes. This is fine since this is only a single parallel,
      // so also o single type of class (e.g. lecture, tutorial, lab) on a single day
      const newEventsThisDay: TimeTableEvent[] = [];
      const roomsSet = new Set<string>();
      for (const event of events) {
        if (newEventsThisDay.length === 0 || calcTimeDiff(newEventsThisDay[newEventsThisDay.length - 1].end, event.start) < 0) {
          // No overlap with the last event
          newEventsThisDay.push(event);
          roomsSet.clear();
          if (event.room) {
            roomsSet.add(event.room);
          }
        } else {
          // Overlap with the last event, merge them
          if (event.room) {
            roomsSet.add(event.room);
          }

          newEventsThisDay[newEventsThisDay.length - 1] = {
            ...newEventsThisDay[newEventsThisDay.length - 1],
            room: roomsSet.size !== 0 ? [...roomsSet].join(' + ') : null,
            weeks_valid: [...new Set([...newEventsThisDay[newEventsThisDay.length - 1].weeks_valid, ...event.weeks_valid])],
            end: maxTime(newEventsThisDay[newEventsThisDay.length - 1].end, event.end),
            is_merged: true,
          };
          newEventsThisDay[newEventsThisDay.length - 1].end = maxTime(newEventsThisDay[newEventsThisDay.length - 1].end, event.end);
        }
      }

      // Just sort the weeks when the event is valid for each event
      for (const event of newEventsThisDay) {
        event.weeks_valid.sort((a, b) => a - b);
      }

      newEvents.push(...newEventsThisDay);
    }
  }

  // Now we can return the merged events
  return newEvents;
}

const compareTimeTableEvents = (a: TimeTableEventOnLoad, b: TimeTableEventOnLoad) => {
  // First, compare if `data` arrays are empty
  if (a.weeks_valid.length === 0 && b.weeks_valid.length !== 0) return -1;
  if (a.weeks_valid.length !== 0 && b.weeks_valid.length === 0) return 1;

  if (a.weeks_valid[0] !== b.weeks_valid[0]) return a.weeks_valid[0] - b.weeks_valid[0];

  // Next, compare based on week (even comes after odd)
  if (a.week === WeekType.Odd && b.week === WeekType.Even) return -1;
  if (a.week === WeekType.Even && b.week === WeekType.Odd) return 1;

  // Then, compare by the start time (earlier start comes first)
  const aStartTime = a.start[0] * 60 + a.start[1];
  const bStartTime = b.start[0] * 60 + b.start[1];
  if (aStartTime !== bStartTime) return aStartTime - bStartTime;

  // Finally, compare by the end time (earlier end comes first)
  const aEndTime = a.end[0] * 60 + a.end[1]; // convert to minutes
  const bEndTime = b.end[0] * 60 + b.end[1]; // convert to minutes
  return aEndTime - bEndTime;
};

const processParallelByType = (parallels: ParallelOnLoad[], parallelType: ParallelType): Parallel[] =>
  // eslint-disable-next-line implicit-arrow-linebreak
  parallels.filter((parallel) => parallel.type === parallelType).map((parallel) => {
    const timetable = parallel.timetable
      .sort(compareTimeTableEvents)
      .reduce((arr, timeTableEvent) => {
        parallel.timetable.sort();

        if (timeTableEvent.week === null) {
        // Push both Odd and Even version when the week is null
          arr.push({
            ...timeTableEvent,
            week: WeekType.Odd,
          } as TimeTableEvent);
          arr.push({
            ...timeTableEvent,
            week: WeekType.Even,
          } as TimeTableEvent);
        } else {
          arr.push(timeTableEvent as TimeTableEvent);
        }
        return arr;
      }, [] as TimeTableEvent[]);

    return {
      ...parallel,
      timetable: mergeConflictingEventsInTimeTable(timetable),
    };
  });

const sortAndPreprocessData = (data: DataOnLoad): Data => {
  // Let's sort stuff in each semester to keep things nicely ordered
  for (const semester of Object.values(data)) {
    for (const course of semester) {
      // Sort parallels in each course in a semester
      course.parallels.sort((a, b) => {
        if (a.type === b.type) {
          if (a.num === null || b.num === null) return 0;
          return a.num - b.num;
        }

        if (a.type === ParallelType.Lecture) return -1;
        if (b.type === ParallelType.Lecture) return 1;
        if (a.type === ParallelType.Tutorial) return -1;
        if (b.type === ParallelType.Tutorial) return 1;
        if (a.type === ParallelType.Lab) return -1;
        if (b.type === ParallelType.Lab) return 1;

        // NO-OP. should not happen
        return 0;
      });
    }

    // Sort courses in a semester
    semester.sort((c1, c2) => c1.code.localeCompare(c2.code));
  }

  return Object.fromEntries(Object.entries(data).map(([semesterId, semester]) => [
    semesterId,
    semester.map((course) => ({
      ...course,
      parallels: {
        [ParallelType.Lecture]: processParallelByType(course.parallels, ParallelType.Lecture),
        [ParallelType.Tutorial]: processParallelByType(course.parallels, ParallelType.Tutorial),
        [ParallelType.Lab]: processParallelByType(course.parallels, ParallelType.Lab),
      },
    } as Course)),
  ]));
};

export const useData = (
  cbSuccess: MutableRefObject<(() => void) | undefined>,
  cbError: MutableRefObject<(() => void) | undefined>,
) => useSWRImmutable<Data>(DATA_URL, async (key: string) => {
  try {
    const response = await fetch(key);
    const data = sortAndPreprocessData(await response.json());
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
        if (cbSuccess.current) cbSuccess.current();
      }, 100);
    });
  } catch (err) {
    if (cbError.current) cbError.current();
    throw err;
  }
});

export function useToastDataWrapper() {
  const TOAST_ID = 'toast-loading-data';
  const dataResolved = useRef<(() => void) | undefined>(undefined);
  const dataError = useRef<(() => void) | undefined>(undefined);

  const toast = useToast({ position: 'bottom', id: TOAST_ID });
  useEffect(() => {
    if (!toast.isActive(TOAST_ID)) {
      toast.promise(new Promise((resolve, reject) => {
        // This is a nice and funny thread race that should (probably) evaluate correctly, so the resolve/reject callbacks
        // should be assigned just in time when dataResolved/dataError callbacks are used.
        // Actually, they should be assigned even before the call to useData, so nothing should break, but I can't promise
        // anything. I hate this as much as you do. :)
        dataResolved.current = () => resolve(true);
        dataError.current = () => reject();
      }), {
        loading: {
          title: 'Načítání dat',
          description: 'To může chvilku trvat',
          duration: null,
        },
        success: {
          title: 'Vše je ready',
          description: 'Můžeš se pustit do sestavování rozvrhu',
        },
        error: {
          title: 'ERROR',
          description: 'Nastala chyba při načítání dat. 😢',
        },
      });
    }
    // I don't want to update this thing on every re-render, that would create duplicate toast and I ain't risking using
    // useRef(useToast(...)) together.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useData(dataResolved, dataError);
}

export function arrayDifference<T>(a1: T[], a2: T[]) {
  const a2Set = new Set(a2);
  return a1.filter((x) => !a2Set.has(x));
}
