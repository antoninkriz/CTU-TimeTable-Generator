import { LinkedList, LinkedListNode, ProgressMeter } from '@src/app/generator/_worker/lib';
import { calcTimeDiff } from '@src/app/generator/lib';
import {
  MessageResultTypes, WeekType, type Best, type MessageResult, type Parallel, type TimeTableEvent,
} from '@src/types';

function scoreTimetable(timetable: LinkedList<TimeTableEvent>[]) {
  let score = 0;

  for (const dayList of timetable) {
    if (dayList.isEmpty()) continue;
    // Penalty for each day, therefore fewer days taken equals better (lower) score
    score += 24 * 60;

    const { start } = dayList.begin().value;
    let { end } = dayList.begin().value;

    for (const event of dayList) {
      end = event.value.end;
    }

    // Penalty calculated as the difference between the beginning of the first class and the end of the last class.
    score += calcTimeDiff(end, start);
  }

  return score;
}

function timeTableAddParallel(
  timetable: LinkedList<TimeTableEvent>[],
  parallel: Parallel,
  addedNodes: LinkedListNode<TimeTableEvent>[][],
): boolean {
  for (const eventNew of parallel.timetable) {
    const dayIdx = (eventNew.day - 1) + (eventNew.week === WeekType.Even ? 5 : 0);
    const singleDay = timetable[dayIdx];

    if (singleDay.isEmpty()) {
      addedNodes[dayIdx].push(singleDay.insertAfter(eventNew, singleDay.begin()));
      continue;
    }

    let success = false;
    for (const lle of singleDay) {
      if (calcTimeDiff(lle.value.start, eventNew.end) >= 0) {
        if (lle.pre === singleDay.end() || (lle.pre !== singleDay.end() && calcTimeDiff(lle.pre.value.end, eventNew.start) <= 0)) {
          addedNodes[dayIdx].push(singleDay.insertBefore(eventNew, lle));
          success = true;
          break;
        }
      } else if (calcTimeDiff(lle.value.end, eventNew.start) <= 0) {
        if (lle.next === singleDay.end() || (lle.next !== singleDay.end() && calcTimeDiff(lle.next.value.start, eventNew.end) >= 0)) {
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

function solve(
  parallelsCompact: Parallel[][],
  parallelsSelected: Parallel[],
  timetable: LinkedList<TimeTableEvent>[],
  best: Best,
  progress: ProgressMeter,
  depth: number,
) {
  const addedNodes: LinkedListNode<TimeTableEvent>[][] = [
    // Odd week days
    [], [], [], [], [],
    // Even week days
    [], [], [], [], [],
  ];

  for (const parallel of parallelsCompact[depth]) {
    parallelsSelected[depth] = parallel;

    // Skip if the parallel has no events (https://github.com/antoninkriz/CTU-TimeTable-Generator/issues/3
    // Add parallel to the timetable, returned false means collision, skip this parallel
    if (parallel.timetable.length === 0 || !timeTableAddParallel(timetable, parallel, addedNodes)) {
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
        // Found new best
        best.score = score;
        best.all_best_parallels_combinations.length = 0;
        best.all_best_parallels_combinations.push(parallelsSelected.slice());
      } else if (score === best.score) {
        // Found result as good as the current best
        best.all_best_parallels_combinations.push(parallelsSelected.slice());
      }
    } else if (score <= best.score) {
      // We need to go deeper, but is it worth it?
      // Yes, this path still has a chance to improve
      solve(parallelsCompact, parallelsSelected, timetable, best, progress, depth + 1);
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
  parallelsCompact: Parallel[][],
  total: number,
): Best {
  // Send initial progress report
  sendMessage({
    type: MessageResultTypes.STATUS,
    total,
    done: 0,
  });

  const best: Best = {
    score: Number.MAX_VALUE,
    all_best_parallels_combinations: [],
  };

  if (parallelsCompact.length === 0) {
    sendMessage({
      type: MessageResultTypes.STATUS,
      total,
      done: total,
    });

    return best;
  }

  const progress = new ProgressMeter(
    10_000,
    (n: number) => sendMessage({
      type: MessageResultTypes.STATUS,
      total,
      done: n,
    }),
  );

  solve(
    parallelsCompact,
    [],
    Array.from({ length: 10 }, () => new LinkedList<TimeTableEvent>()),
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
