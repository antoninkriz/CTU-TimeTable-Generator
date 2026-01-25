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
    score += calcTimeDiff(end[0], end[1], start[0], start[1]);
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
      if (calcTimeDiff(lle.value.start[0], lle.value.start[1], eventNew.end[0], eventNew.end[1]) >= 0) {
        if (
          lle.pre === singleDay.end()
          || (lle.pre !== singleDay.end() && calcTimeDiff(lle.pre.value.end[0], lle.pre.value.end[1], eventNew.start[0], eventNew.start[1]) <= 0)
        ) {
          addedNodes[dayIdx].push(singleDay.insertBefore(eventNew, lle));
          success = true;
          break;
        }
      } else if (calcTimeDiff(lle.value.end[0], lle.value.end[1], eventNew.start[0], eventNew.start[1]) <= 0) {
        if (
          lle.next === singleDay.end()
          || (lle.next !== singleDay.end() && calcTimeDiff(lle.next.value.start[0], lle.next.value.start[1], eventNew.end[0], eventNew.end[1]) >= 0)
        ) {
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
  branchWeights: number[],
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
    const isCollision = parallel.timetable.length > 0 && !timeTableAddParallel(timetable, parallel, addedNodes);
    if (isCollision) {
      progress.increment(branchWeights[depth + 1]);
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
      solve(branchWeights, parallelsCompact, parallelsSelected, timetable, best, progress, depth + 1);
    } else {
      // Not worth it, wrong way, let's skip this path and update the progress accordingly
      progress.increment(branchWeights[depth + 1]);
    }

    // Cleanup events from the current parallel in the timetable
    for (let i = 0; i < addedNodes.length; i++) {
      for (const added of addedNodes[i]) timetable[i].remove(added);
      addedNodes[i].length = 0;
    }
  }
}

function precomputeBranchWeights(parallelsCompact: Parallel[][]): number[] {
  const n = parallelsCompact.length;
  const weights = new Array<number>(n + 1);
  weights[n] = 1; // beyond last = 1
  for (let i = n - 1; i >= 0; i--) {
    weights[i] = weights[i + 1] * parallelsCompact[i].length;
  }
  return weights;
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

  const branchWeights = precomputeBranchWeights(parallelsCompact);
  solve(
    branchWeights,
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
