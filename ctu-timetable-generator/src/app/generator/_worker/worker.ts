import {
  type MessageResult, type MessageData, MessageResultTypes, Course,
} from '@src/types';
import processData from './processing';

const sendMessage = (message: MessageResult) => postMessage(message);

// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (event: MessageEvent<MessageData>) => {
  // Say hello back
  sendMessage({
    type: MessageResultTypes.INIT,
  });

  // Prepare data
  const courses = event.data.semester.reduce((obj: { [code: string]: Course }, course: Course) => {
    obj[course.code] = course;
    return obj;
  }, {});
  const coursesSelected = Object.entries(event.data.preferences).map(([courseId, preferences]) => ({
    ...courses[courseId],
    parallels: courses[courseId].parallels.filter((parallel) => preferences[parallel.type]),
  })).sort((a, b) => (a.parallels.length - b.parallels.length) || (a.code.localeCompare(b.code)));

  // TODO
  processData({ sendMessage, coursesSelected });
});
