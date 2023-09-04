// Data
export const enum WeekType {
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
  timetable: Array<Event>
  can_register: boolean
  is_full: boolean
};

export type ParallelCompact = Omit<Parallel, 'capacity' | 'timetable'> & {
  timetable: Array<EventCompact>
};

export type CourseOnLoad = {
  code: string
  name: string
  parallels: Array<Parallel>
};

export type Course = {
  code: string
  name: string
  has: {
    [key in ParallelType]: boolean
  }
  parallels: Array<Parallel>
};

export type CourseCompact = Omit<Course, 'name' | 'parallels'> & {
  parallels: {
    [parallelType in ParallelType]: Array<ParallelCompact>
  }
};

export type SemesterOnLoad = Array<CourseOnLoad>;

export type Semester = Array<Course>;

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
