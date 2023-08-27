// Data
export type Event = {
  day: number
  week: 'S' | 'L' | null
  start: [number, number]
  end: [number, number]
  room: string | null
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

export type Course = {
  code: string
  name: string
  parallels: Array<Parallel>
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
  INIT = 'INIT',
  STATUS = 'STATUS',
  RESULT = 'RESULT',
}

export type MessageResult = {
  type: MessageResultTypes.INIT
} | {
  type: MessageResultTypes.STATUS
  total: number
  done: number
} | {
  type: MessageResultTypes.RESULT
  data: undefined
};
