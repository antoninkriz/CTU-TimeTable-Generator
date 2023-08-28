import {
  MessageResultTypes, type MessageResult, type ParallelCompact, type EventCompact,
} from '@src/types';

function* lazyProduct<T>(sets: Array<Array<T>>) {
  const p: T[] = [];
  const max = sets.length - 1;
  const lens: number[] = [];
  for (let i = sets.length; i--;) lens[i] = sets[i].length;
  function* dive(d: number): any {
    const a = sets[d]; const
      len = lens[d];
    if (d === max) {
      for (let i = 0; i < len; ++i) {
        p[d] = a[i];
        yield [...p];
      }
    } else {
      for (let i = 0; i < len; ++i) {
        p[d] = a[i];
        yield* dive(d + 1);
      }
    }
    p.pop();
  }
  yield* dive(0);
}

function sortEvents(a: EventCompact, b: EventCompact): number {
  if (a.week !== b.week) {
    return +a.week - +b.week;
  }
  if (a.day !== b.day) {
    return a.day - b.day;
  }
  if (a.start !== b.start) {
    return a.start - b.start;
  }
  if (a.end !== b.end) {
    return a.end - b.end;
  }
  return 0;
}

function hasCollision(flatEvents: Array<EventCompact>): boolean {
  if (flatEvents.length <= 1) return false;

  for (let i = 1; i < flatEvents.length; i++) {
    if (
      flatEvents[i].week === flatEvents[i - 1].week
      && flatEvents[i].day === flatEvents[i - 1].day
      && flatEvents[i].start < flatEvents[i - 1].end
    ) {
      return true;
    }
  }

  return false;
}

function scoreCombination(flatEvents: Array<EventCompact>): number {
  if (flatEvents.length === 0) return 0;
  if (flatEvents.length === 1) return flatEvents[0].end - flatEvents[0].start;

  let score = flatEvents[0].end - flatEvents[0].start;

  let { week, day, start } = flatEvents[0];
  let last = flatEvents[0];
  for (const event of flatEvents) {
    if (week !== event.week || day !== event.day) {
      score += last.end - start;
      week = event.week;
      day = event.day;
      start = event.start;
      last = event;
    } else {
      last = event;
    }
  }

  if (week === flatEvents[0].week || day === flatEvents[0].day) {
    score += last.end - start;
  }

  return score;
}

export default function processData(
  sendMessage: (message: MessageResult) => void,
  parallelsCompact: Array<ParallelCompact[]>,
  total: number,
) {
  // TODO: Some strange stuff is happening - getting the same number of total when de-selecting ParallelType, not getting all ParallelTypes for each course, ...

  let done = 0;

  // Send initial progress report
  sendMessage({
    type: MessageResultTypes.STATUS,
    total,
    done,
  });

  let bestScore = Number.MAX_VALUE;
  const best: ParallelCompact[][] = [];

  const iterator = lazyProduct(parallelsCompact.map((parallels) => parallels.map((_, i) => i)));
  const combination = Array<ParallelCompact>(parallelsCompact.length);

  for (const combinationIndices of iterator) {
    if (done % 10_000 === 10_000 - 1) {
      sendMessage({
        type: MessageResultTypes.STATUS,
        total,
        done,
      });
    }

    for (let i = 0; i < parallelsCompact.length; i++) {
      combination[i] = parallelsCompact[i][combinationIndices[i]];
    }

    const flatEvents = new Array<EventCompact>()
      .concat(
        ...combination
          .filter((parallel) => parallel)
          .map((parallel) => parallel.timetable),
      )
      .sort(sortEvents);

    if (!hasCollision(flatEvents)) {
      const score = scoreCombination(flatEvents);
      if (score < bestScore) {
        bestScore = score;
        best.length = 0;
        best.push([...combination]);
      } else if (score === bestScore) {
        best.push([...combination]);
      }
    }

    done++;
  }

  // Send final progress report
  sendMessage({
    type: MessageResultTypes.STATUS,
    total,
    done: total,
  });

  return best;
}
