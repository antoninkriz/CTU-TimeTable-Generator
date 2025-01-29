import type {
  Course, MessageData, MessageResult, Parallel,
} from '@src/types';
import { MessageResultTypes, ParallelType } from '@src/types';
import processData from './processing';

const sendMessage = (message: MessageResult) => postMessage(message);

function filterParallels(parallels: Parallel[], allowFull: boolean, allowLocked: boolean): Parallel[] {
  return parallels
    .filter((parallel) => allowFull || !parallel.is_full)
    .filter((parallel) => allowLocked || parallel.can_register);
}

function courseSize(course: Course): number {
  return course.parallels[ParallelType.Lecture].length + course.parallels[ParallelType.Tutorial].length + course.parallels[ParallelType.Lab].length;
}

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

  // Filter out courses based on user preferences
  const coursesSelected: Course[] = Object.entries(event.data.preferences).map(([courseId, preferences]) => ({
    ...courses[courseId],
    parallels: {
      [ParallelType.Lecture]: preferences[ParallelType.Lecture]
        ? filterParallels(courses[courseId].parallels[ParallelType.Lecture], event.data.allowFull[courseId], event.data.allowLocked[courseId])
        : [],
      [ParallelType.Tutorial]: preferences[ParallelType.Tutorial]
        ? filterParallels(courses[courseId].parallels[ParallelType.Tutorial], event.data.allowFull[courseId], event.data.allowLocked[courseId])
        : [],
      [ParallelType.Lab]: preferences[ParallelType.Lab]
        ? filterParallels(courses[courseId].parallels[ParallelType.Lab], event.data.allowFull[courseId], event.data.allowLocked[courseId])
        : [],
    },
  })).sort((a, b) => (courseSize(a) - courseSize(b)) || (a.code.localeCompare(b.code)));

  // Flatten the courses so that we can process them one by one
  const coursesFlat = coursesSelected.reduce((arr, course) => {
    arr.push([...course.parallels[ParallelType.Lecture], ...course.parallels[ParallelType.Tutorial], ...course.parallels[ParallelType.Lab]]);
    return arr;
  }, [] as Parallel[][]);

  // Calculate the total number of possible combinations
  const total = coursesFlat.reduce((num, parallels) => num * (parallels.length ? parallels.length : 1), 1);

  // Finally process the data
  const [courseAssignment, coursesParallelFlat] = coursesSelected.reduce((arr, course) => {
    if (course.parallels[ParallelType.Lecture].length !== 0) {
      arr[0].push(course);
      arr[1].push(course.parallels[ParallelType.Lecture]);
    }
    if (course.parallels[ParallelType.Tutorial].length !== 0) {
      arr[0].push(course);
      arr[1].push(course.parallels[ParallelType.Tutorial]);
    }
    if (course.parallels[ParallelType.Lab].length !== 0) {
      arr[0].push(course);
      arr[1].push(course.parallels[ParallelType.Lab]);
    }
    return arr;
  }, [[], []] as [Course[], Parallel[][]]);
  const bests = processData(sendMessage, coursesParallelFlat, total);

  // Send result
  sendMessage({
    type: MessageResultTypes.RESULT,
    data: bests.all_best_parallels_combinations.map((parallels) => parallels.map((parallel, idx) => [courseAssignment[idx], parallel] as [Course, Parallel])),
    total,
    done: total,
  });
});
