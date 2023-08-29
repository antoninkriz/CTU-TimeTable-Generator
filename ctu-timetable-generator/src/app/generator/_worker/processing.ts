import { LinkedList, LinkedListNode, ProgressMeter } from '@src/app/generator/_worker/lib';
import {
  MessageResultTypes, type MessageResult, type ParallelCompact, type EventCompact,
} from '@src/types';

function scoreTimetable(timetable: LinkedList<EventCompact>[]) {
  let score = 0;

  for (const dayList of timetable) {
    if (dayList.isEmpty()) continue;
    // Penalty for each day, therefore fewer days taken equals better score
    score += 24 * 60;

    const { start } = dayList.begin().value;
    let { end } = dayList.begin().value;

    for (const event of dayList) {
      end = event.value.end;
    }

    score += end - start;
  }

  return score;
}

function timeTableAddParallel(
  timetable: LinkedList<EventCompact>[],
  parallel: ParallelCompact,
  addedNodes: Array<LinkedListNode<EventCompact>[]>,
): boolean {
  for (const eventNew of parallel.timetable) {
    const dayIdx = (eventNew.day - 1) + (eventNew.week ? 5 : 0);
    const singleDay = timetable[dayIdx];

    if (singleDay.isEmpty()) {
      addedNodes[dayIdx].push(singleDay.insertAfter(eventNew, singleDay.begin()));
      continue;
    }

    let success = false;
    for (const lle of singleDay) {
      if (lle.value.start >= eventNew.end) {
        if (lle.pre === singleDay.end() || (lle.pre !== singleDay.end() && lle.pre.value.end <= eventNew.start)) {
          addedNodes[dayIdx].push(singleDay.insertBefore(eventNew, lle));
          success = true;
          break;
        }
      } else if (lle.value.end <= eventNew.start) {
        if (lle.next === singleDay.end() || (lle.next !== singleDay.end() && lle.next.value.start >= eventNew.end)) {
          addedNodes[dayIdx].push(singleDay.insertAfter(eventNew, lle));
          success = true;
          break;
        }
      }
    }

    // Event added
    if (success) continue;

    // Collision detected, clean-up and return false
    for (let i = 0; i < addedNodes.length; i++) {
      for (const node of addedNodes[i]) {
        timetable[i].remove(node);
      }
    }
    return false;
  }

  // All events added successfully
  return true;
}

type Best = {
  score: number,
  parallels: Array<Array<ParallelCompact>>
};

function experimental(
  parallelsCompact: Array<ParallelCompact[]>,
  parallelsSelected: Array<ParallelCompact>,
  timetable: LinkedList<EventCompact>[],
  best: Best,
  progress: ProgressMeter,
  depth: number,
) {
  const addedNodes: Array<LinkedListNode<EventCompact>[]> = [
    [], [], [], [], [],
    [], [], [], [], [],
  ];

  for (const parallel of parallelsCompact[depth]) {
    parallelsSelected[depth] = parallel;

    // Add parallel to the timetable, false on collision
    if (!timeTableAddParallel(timetable, parallel, addedNodes)) {
      let saved = 1;
      for (let i = depth + 1; i < parallelsCompact.length; i++) {
        saved *= parallelsCompact[i].length;
      }
      progress.increment(saved);

      continue;
    }

    // Current score of the current timetable
    const score = scoreTimetable(timetable);

    // Is this the last level?
    if (depth === parallelsCompact.length - 1) {
      // Yes, update progress and best results
      progress.increment(1);

      if (score < best.score) {
        best.score = score;
        best.parallels.length = 0;
      }

      if (score === best.score) {
        best.parallels.push(parallelsSelected.slice());
      }
    } else if (score <= best.score) {
      // We need to go deeper, but is it worth it?
      // Yes, this path still has a chance to improve
      experimental(parallelsCompact, parallelsSelected, timetable, best, progress, depth + 1);
    } else {
      // Not worth it, wrong way, let's skip this path and update the progress accordingly
      let saved = 1;
      for (let i = depth + 1; i < parallelsCompact.length; i++) {
        saved *= parallelsCompact[i].length;
      }
      progress.increment(saved);
    }

    // Cleanup events from the current parallel in the timetable
    for (let i = 0; i < addedNodes.length; i++) {
      for (const added of addedNodes[i]) timetable[i].remove(added);
      addedNodes[i].length = 0;
    }
  }
}

export default function processData(
  sendMessage: (message: MessageResult) => void,
  parallelsCompact: Array<ParallelCompact[]>,
  total: number,
) {
  // Send initial progress report
  sendMessage({
    type: MessageResultTypes.STATUS,
    total,
    done: 0,
  });

  const best: Best = {
    score: Number.MAX_VALUE,
    parallels: [],
  };

  const progress = new ProgressMeter(
    10_000,
    (n: number) => sendMessage({
      type: MessageResultTypes.STATUS,
      total,
      done: n,
    }),
  );

  experimental(
    parallelsCompact,
    [],
    Array.from({ length: 10 }, () => new LinkedList<EventCompact>()),
    best,
    progress,
    0,
  );

  // Send final progress report
  sendMessage({
    type: MessageResultTypes.STATUS,
    total,
    done: total,
  });

  return best;
}
