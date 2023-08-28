// Data
export enum WeekType {
  Even = 'S',
  Odd = 'L',
}

export type Event = {
  day: number
  week: WeekType | null
  start: [number, number]
  end: [number, number]
  room: string | null
};

export type EventCompact = Omit<Event, 'week' | 'room' | 'start' | 'end'> & {
  week: boolean,
  start: number,
  end: number,
};

export enum ParallelType {
  Lecture = 'P',
  Tutorial = 'C',
  Lab = 'L',
}

export type Parallel = {
  type: ParallelType
  num: number | null
  capacity: number | null
  timetable: Array<Event>
};

export type ParallelCompact = Omit<Parallel, 'capacity' | 'timetable'> & {
  timetable: Array<EventCompact>
};

export type Course = {
  code: string
  name: string
  parallels: Array<Parallel>
};

export type CourseCompact = Omit<Course, 'name' | 'parallels'> & {
  parallels: {
    [parallelType in ParallelType]: Array<ParallelCompact>
  }
};

export type Semester = Array<Course>;

export type Data = {
  [key: string]: Semester
};

// Generator
export type CoursePreferences = {
  [classId: string]: {
    [parallelType in ParallelType]: boolean
  }
};

export class OptionClass<T> {
  value: T;

  label: string;

  constructor(value: T, label: string) {
    this.value = value;
    this.label = label;
  }
}

// Worker
export type MessageData = {
  semester: Semester
  preferences: CoursePreferences
};

export enum MessageResultTypes {
  PRE_INIT = 'PRE_INIT',
  INIT = 'INIT',
  STATUS = 'STATUS',
  RESULT = 'RESULT',
}

export type MessageResult = {
  type: MessageResultTypes.PRE_INIT
} | {
  type: MessageResultTypes.INIT
} | {
  type: MessageResultTypes.STATUS
  total: number
  done: number
} | {
  type: MessageResultTypes.RESULT
  data: Array<{ [courseId: string]: { [parallelType in ParallelType]: Parallel | undefined } }>
  total: number
  done: number
};
