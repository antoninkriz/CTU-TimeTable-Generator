'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { arrayDifference, useToastDataWrapper } from '@src/app/generator/lib';
import type {
  Course, CoursePreferences, MessageData, MessageResult,
} from '@src/types';
import { MessageResultTypes, ParallelType } from '@src/types';
import { MenuDrawer, MenuSide } from '@src/app/generator/_menuForm';
import { ProgressBar } from '@src/app/generator/_progress';
import { TimeTable } from '@src/app/generator/_timeTable';

function useDataWorker(): [MessageResult, (params: MessageData) => void] {
  const workerRef = useRef<Worker>();
  const [result, setResult] = useState<MessageResult>({ type: MessageResultTypes.PRE_INIT });

  // Manage response from the worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./_worker/worker.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<MessageResult>) => {
      setResult(event.data);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return [result, (params: MessageData) => workerRef.current?.postMessage(params)];
}
export default function Generator() {
  const dataResponse = useToastDataWrapper();

  const [variant, setVariant] = useState(0);
  const [isComputing, setIsComputing] = useState(false);
  const [result, postMessage] = useDataWorker();
  const [semester, setSemester] = useState<string | undefined>(undefined);
  const [courses, setCourses] = useState<Array<Course>>([]);
  const [preferences, setPreferences] = useState<CoursePreferences>({});
  const setCoursesUpdatePreferences = (coursesNew: Array<Course>) => {
    setPreferences((p) => {
      if (coursesNew.length === 0) return {};
      const diffAdded = arrayDifference(coursesNew, courses);
      const diffRemoved = arrayDifference(courses, coursesNew);

      const res = diffAdded.reduce((obj, course) => {
        obj[course.code] = { [ParallelType.Lecture]: true, [ParallelType.Tutorial]: true, [ParallelType.Lab]: true };
        return obj;
      }, { ...p });

      for (const courseRemoved of diffRemoved) {
        delete res[courseRemoved.code];
      }

      return res;
    });
    setCourses(coursesNew);
  };
  const preferencesUpdate = (courseId: string, parallelType: ParallelType, value: boolean) => setPreferences((p) => ({
    ...p,
    [courseId]: {
      ...p[courseId],
      [parallelType]: value,
    },
  }));

  const computeCallback = () => {
    if (dataResponse.data && semester) {
      setIsComputing(true);
      setVariant(0);
      postMessage({
        semester: dataResponse.data[semester],
        preferences,
      });
    }
  };

  const nextVariant = () => {
    if (result.type === MessageResultTypes.RESULT && variant < result.data.length - 1) setVariant(variant + 1);
  };

  const prevVariant = () => {
    if (variant > 0) setVariant(variant - 1);
  };

  if (isComputing && result.type === MessageResultTypes.RESULT) setIsComputing(false);

  return (
    <>
      <Flex grow={1}>
        <MenuSide
          dataResponse={dataResponse}
          semester={semester}
          setSemester={setSemester}
          courses={courses}
          setCourses={setCoursesUpdatePreferences}
          preferences={preferences}
          setPreferences={preferencesUpdate}
          computeCallback={computeCallback}
          disabled={isComputing}
        />
        <Box flex={1} width="full">
          {
            result.type !== MessageResultTypes.RESULT
              ? <ProgressBar result={result} />
              : <TimeTable result={result} variant={variant} nextVariant={nextVariant} prevVariant={prevVariant} />
          }
        </Box>
      </Flex>
      <MenuDrawer
        dataResponse={dataResponse}
        semester={semester}
        setSemester={setSemester}
        courses={courses}
        setCourses={setCoursesUpdatePreferences}
        preferences={preferences}
        setPreferences={preferencesUpdate}
        computeCallback={computeCallback}
        disabled={isComputing}
      />
    </>
  );
}
