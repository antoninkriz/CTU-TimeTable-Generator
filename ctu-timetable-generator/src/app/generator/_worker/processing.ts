import { MessageResultTypes, type MessageResult, Course } from '@src/types';

export default function processData({
  sendMessage,
  coursesSelected,
} : {
  sendMessage: (message: MessageResult) => void
  coursesSelected: Array<Course>
}) {
  // TODO: Pre-process data to compact form
  // TODO: Divide lecture/tutorial/labs parallels
  // TODO: Array of currently selected parallels -> num, events{start int, end int}

  const total = coursesSelected.reduce((num, course) => num * course.parallels.length, 1);

  // Send initial progress report
  sendMessage({
    type: MessageResultTypes.STATUS,
    total,
    done: 0,
  });

  sendMessage({
    type: MessageResultTypes.STATUS,
    total,
    done: total,
  });
}
