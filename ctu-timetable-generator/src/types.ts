// Data
export const enum WeekType {
  // noinspection JSUnusedGlobalSymbols
  Even = 'S',
  Odd = 'L',
}

export type TimeTableEvent = {
  day: number
  week: WeekType
  weeks_valid: number[]
  start: [number, number]
  end: [number, number]
  room: string | null
  is_merged: true | undefined
};

export type TimeTableEventOnLoad = Omit<TimeTableEvent, 'week'> & {
  week: WeekType | null
};

export const enum ParallelType {
  Lecture = 'P',
  Tutorial = 'C',
  Lab = 'L',
}

export type Parallel = {
  type: ParallelType
  num: number | null
  capacity: number | null
  occupied_places: number | null
  timetable: TimeTableEvent[]
  can_register: boolean
  is_full: boolean
};

export type ParallelOnLoad = Omit<Parallel, 'timetable'> & {
  timetable: TimeTableEventOnLoad[]
};

export type CourseOnLoad = {
  code: string
  name: string
  parallels: ParallelOnLoad[]
};

export type Course = {
  code: string
  name: string
  parallels: {
    [key in ParallelType]: Parallel[]
  }
};

export type SemesterOnLoad = CourseOnLoad[];

export type Semester = Course[];

export type DataOnLoad = {
  [key: string]: SemesterOnLoad
};

export type Data = {
  [key: string]: Semester
};

// Generator
export type CoursePreferences = {
  [classId: string]: {
    [parallelType in ParallelType]: boolean
  }
};

export type CourseAvailableOnly = {
  [classId: string]: boolean
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
export type Best = {
  score: number,
  all_best_parallels_combinations: Parallel[][]
};

export type MessageData = {
  semester: Semester
  preferences: CoursePreferences
  allowLocked: CourseAvailableOnly
  allowFull: CourseAvailableOnly
};

export const enum MessageResultTypes {
  PRE_INIT = 'PRE_INIT',
  INIT = 'INIT',
  STATUS = 'STATUS',
  RESULT = 'RESULT',
}

export type MessageResultPreInit = {
  type: MessageResultTypes.PRE_INIT
};

export type MessageResultInit = {
  type: MessageResultTypes.INIT
};

export type MessageResultStatus = {
  type: MessageResultTypes.STATUS
  total: number
  done: number
};

export type MessageResultResult = {
  type: MessageResultTypes.RESULT
  data: [Course, Parallel][][]
  total: number
  done: number
};

export type MessageResult = MessageResultPreInit | MessageResultInit | MessageResultStatus | MessageResultResult;
