import { DATA_URL } from '@src/consts';
import useSWRImmutable from 'swr/immutable';

type Event = {
  day: number
  week: 'S' | 'L' | null
  start: [number, number]
  end: [number, number]
  room: string | null
};

type Parallel = {
  type: 'P' | 'C' | 'L'
  num: number | null
  capacity: number | null
  timetable: Array<Event>
};

type Course = {
  code: string
  name: string
  parallels: Array<Parallel>
};

export type Data = {
  [key: string]: Array<Course>
};

export const useData = () => useSWRImmutable<Data>(DATA_URL, (key: string) => fetch(key).then((r) => r.json()));
