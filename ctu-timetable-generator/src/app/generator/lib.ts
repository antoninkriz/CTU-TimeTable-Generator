import { DATA_URL } from '@src/consts';
import useSWRImmutable from 'swr/immutable';
import { type MutableRefObject, useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  Course, type Data, type DataOnLoad, ParallelType,
} from '@src/types';

const sortAndPreprocessData = (data: DataOnLoad): Data => {
  // Let's sort stuff in each semester to keep things nicely ordered
  for (const semester of Object.values(data)) {
    for (const course of semester) {
      // Sort parallels in each course in a semester
      course.parallels.sort((a, b) => {
        if (a.type === b.type) {
          if (a.num === null || b.num === null) return 0;
          return a.num - b.num;
        }

        if (a.type === ParallelType.Lecture) return -1;
        if (b.type === ParallelType.Lecture) return 1;
        if (a.type === ParallelType.Tutorial) return -1;
        if (b.type === ParallelType.Tutorial) return 1;
        if (a.type === ParallelType.Lab) return -1;
        if (b.type === ParallelType.Lab) return 1;

        // NO-OP. should not happen
        return 0;
      });
    }

    // Sort courses in a semester
    semester.sort((c1, c2) => c1.code.localeCompare(c2.code));
  }

  return Object.fromEntries(Object.entries(data).map(([semesterId, semester]) => [
    semesterId,
    semester.map((course) => ({
      ...course,
      has: {
        [ParallelType.Lecture]: course.parallels.some((parallel) => parallel.type === ParallelType.Lecture),
        [ParallelType.Tutorial]: course.parallels.some((parallel) => parallel.type === ParallelType.Tutorial),
        [ParallelType.Lab]: course.parallels.some((parallel) => parallel.type === ParallelType.Lab),
      },
    } as Course)),
  ]));
};

export const useData = (
  cbSuccess: MutableRefObject<(() => void) | undefined>,
  cbError: MutableRefObject<(() => void) | undefined>,
) => useSWRImmutable<Data>(DATA_URL, async (key: string) => {
  try {
    const response = await fetch(key);
    const data = sortAndPreprocessData(await response.json());
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
        if (cbSuccess.current) cbSuccess.current();
      }, 100);
    });
  } catch (err) {
    if (cbError.current) cbError.current();
    throw err;
  }
});

export function useToastDataWrapper() {
  const TOAST_ID = 'toast-loading-data';
  const dataResolved = useRef<(() => void) | undefined>(undefined);
  const dataError = useRef<(() => void) | undefined>(undefined);

  const toast = useToast({ position: 'bottom', id: TOAST_ID });
  useEffect(() => {
    if (!toast.isActive(TOAST_ID)) {
      toast.promise(new Promise((resolve, reject) => {
        // This is a nice and funny thread race that should (probably) evaluate correctly, so the resolve/reject callbacks
        // should be assigned just in time when dataResolved/dataError callbacks are used.
        // Actually, they should be assigned even before the call to useData, so nothing should break, but I can't promise
        // anything. I hate this as much as you do. :)
        dataResolved.current = () => resolve(true);
        dataError.current = () => reject();
      }), {
        loading: {
          title: 'Načítání dat',
          description: 'To může chvilku trvat',
          duration: null,
        },
        success: {
          title: 'Vše je ready',
          description: 'Můžeš se pustit do sestavování rozvrhu',
        },
        error: {
          title: 'ERROR',
          description: 'Nastala chyba při načítání dat. 😢',
        },
      });
    }
    // I don't want to update this thing on every re-render, that would create duplicate toast and I ain't risking using
    // useRef(useToast(...)) together.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useData(dataResolved, dataError);
}

export function arrayDifference<T>(a1: Array<T>, a2: Array<T>) {
  const a2Set = new Set(a2);
  return a1.filter((x) => !a2Set.has(x));
}
