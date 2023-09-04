import type {
  Course, CourseCompact, EventCompact, MessageData, MessageResult, Parallel, ParallelCompact,
} from '@src/types';
import { MessageResultTypes, ParallelType, WeekType } from '@src/types';
import processData from './processing';

const sendMessage = (message: MessageResult) => postMessage(message);

// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (event: MessageEvent<MessageData>) => {
  // Say hello back
  sendMessage({
    type: MessageResultTypes.INIT,
  });

  // Courses mapped by their name
  const courses = event.data.semester.reduce((obj: { [code: string]: Course }, course: Course) => {
    obj[course.code] = course;
    return obj;
  }, {});

  // Get courses sorted by the number of their parallels and filter out the parallels based on preferences
  const coursesSelected = Object.entries(event.data.preferences).map(([courseId, preferences]) => ({
    ...courses[courseId],
    parallels: courses[courseId].parallels
      .filter((parallel) => preferences[parallel.type])
      .filter((parallel) => event.data.allowFull[courseId] || !parallel.is_full)
      .filter((parallel) => event.data.allowLocked[courseId] || parallel.can_register),
  })).sort((a, b) => (a.parallels.length - b.parallels.length) || (a.code.localeCompare(b.code)));

  const compactCourses = coursesSelected.map((course) => ({
    code: course.code,
    parallels: course.parallels.reduce((obj, parallel) => {
      obj[parallel.type].push({
        num: parallel.num,
        type: parallel.type,
        timetable: parallel.timetable.reduce((arr, timeTableEvent) => {
          if (timeTableEvent.week === null) {
            // Push both S and L version when the week is null
            arr.push({
              day: timeTableEvent.day,
              start: timeTableEvent.start[0] * 60 + timeTableEvent.start[1],
              end: timeTableEvent.end[0] * 60 + timeTableEvent.end[1],
              week: true,
            } as EventCompact);
            arr.push({
              day: timeTableEvent.day,
              start: timeTableEvent.start[0] * 60 + timeTableEvent.start[1],
              end: timeTableEvent.end[0] * 60 + timeTableEvent.end[1],
              week: false,
            } as EventCompact);
          } else {
            arr.push({
              day: timeTableEvent.day,
              start: timeTableEvent.start[0] * 60 + timeTableEvent.start[1],
              end: timeTableEvent.end[0] * 60 + timeTableEvent.end[1],
              week: timeTableEvent.week === WeekType.Odd,
            } as EventCompact);
          }
          return arr;
        }, [] as Array<EventCompact>),
      } as ParallelCompact);
      return obj;
    }, {
      [ParallelType.Lecture]: [] as Array<ParallelCompact>,
      [ParallelType.Tutorial]: [] as Array<ParallelCompact>,
      [ParallelType.Lab]: [] as Array<ParallelCompact>,
    }),
  } as CourseCompact));

  const coursesFlat = compactCourses.reduce((arr, course) => {
    arr.push(...Object.values(course.parallels));
    return arr;
  }, [] as Array<ParallelCompact[]>);

  const total = coursesFlat.reduce((num, parallels) => num * (parallels.length ? parallels.length : 1), 1);
  const bests = processData(sendMessage, coursesFlat.filter((p) => p.length !== 0), total);

  const boolFilter = coursesFlat.map((p) => p.length !== 0);
  function unwrapFilteredParallels(best: ParallelCompact[]) {
    let idx = 0;
    return boolFilter
      .map((bool) => (bool ? best[idx++] : undefined))
      .map((pc, i) => {
        if (pc === undefined) return undefined;
        return coursesSelected[Math.floor(i / 3)].parallels.find((p) => p.type === pc.type && p.num === pc.num);
      });
  }

  function mapToCourses(parallels: (Parallel | undefined)[]) {
    return coursesSelected.map((course) => course.code).reduce((obj, courseId, i) => {
      obj[courseId] = {
        [ParallelType.Lecture]: parallels[i * 3],
        [ParallelType.Tutorial]: parallels[i * 3 + 1],
        [ParallelType.Lab]: parallels[i * 3 + 2],
      };
      return obj;
    }, {} as { [courseId: string]: { [parallelType in ParallelType]: Parallel | undefined } });
  }

  // Send result
  sendMessage({
    type: MessageResultTypes.RESULT,
    data: bests.parallels.map(unwrapFilteredParallels).map(mapToCourses),
    total,
    done: total,
  });
});
