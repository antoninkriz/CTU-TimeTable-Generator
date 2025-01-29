'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Box, Center, Container, Flex, Heading, VStack, Stack, Text,
} from '@chakra-ui/react';
import { arrayDifference, useToastDataWrapper } from '@src/app/generator/lib';
import type {
  Course, CoursePreferences, MessageData, MessageResult,
} from '@src/types';
import { CourseAvailableOnly, MessageResultTypes, ParallelType } from '@src/types';
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

function Intro() {
  return (
    <Center h="full" w="full">
      <Container>
        <Stack>
          <VStack justifyContent="space-between" px={4} textAlign="center">
            <Heading>🗓️<br />Vyber si své předměty</Heading>
            <Text>
              Koukni do menu a vyber si semestr a předměty a nastav si, které části předmětů tě zajímají.
            </Text>
          </VStack>
        </Stack>
      </Container>
    </Center>
  );
}

export default function Generator() {
  const dataResponse = useToastDataWrapper();

  const [variantNumber, setVariantNumber] = useState(0);
  const [isComputing, setIsComputing] = useState(false);
  const [result, postMessage] = useDataWorker();
  const [semester, setSemester] = useState<string | undefined>(undefined);
  const [courses, setCourses] = useState<Course[]>([]);
  const [preferences, setPreferences] = useState<CoursePreferences>({});
  const [allowLocked, setAllowLocked] = useState<CourseAvailableOnly>({});
  const [allowFull, setAllowFull] = useState<CourseAvailableOnly>({});
  const setCoursesUpdatePreferences = (coursesNew: Course[]) => {
    const diffAdded = arrayDifference(coursesNew, courses);
    const diffRemoved = arrayDifference(courses, coursesNew);

    setPreferences((p) => {
      if (coursesNew.length === 0) return {};

      const res = diffAdded.reduce((obj, course) => {
        obj[course.code] = {
          [ParallelType.Lecture]: course.parallels[ParallelType.Lecture].length > 0,
          [ParallelType.Tutorial]: course.parallels[ParallelType.Tutorial].length > 0,
          [ParallelType.Lab]: course.parallels[ParallelType.Lab].length > 0,
        };
        return obj;
      }, { ...p });

      for (const courseRemoved of diffRemoved) {
        delete res[courseRemoved.code];
      }

      return res;
    });
    setCourses(coursesNew);
    setAllowLocked((a) => {
      const res = diffAdded.reduce((obj, course) => {
        obj[course.code] = true;
        return obj;
      }, { ...a });
      for (const courseRemoved of diffRemoved) {
        delete res[courseRemoved.code];
      }

      return res;
    });
    setAllowFull((a) => {
      const res = diffAdded.reduce((obj, course) => {
        obj[course.code] = true;
        return obj;
      }, { ...a });
      for (const courseRemoved of diffRemoved) {
        delete res[courseRemoved.code];
      }

      return res;
    });
  };
  const preferencesUpdate = (courseId: string, parallelType: ParallelType, value: boolean) => setPreferences((p) => ({
    ...p,
    [courseId]: {
      ...p[courseId],
      [parallelType]: value,
    },
  }));
  const allowFullUpdate = (courseId: string, value: boolean) => setAllowFull((a) => ({
    ...a,
    [courseId]: value,
  }));
  const allowLockedUpdate = (courseId: string, value: boolean) => setAllowLocked((a) => ({
    ...a,
    [courseId]: value,
  }));

  const computeCallback = () => {
    if (dataResponse.data && semester) {
      setIsComputing(true);
      setVariantNumber(0);
      postMessage({
        semester: dataResponse.data[semester],
        preferences,
        allowLocked,
        allowFull,
      });
    }
  };

  const nextVariant = () => {
    if (result.type === MessageResultTypes.RESULT && variantNumber < result.data.length - 1) setVariantNumber(variantNumber + 1);
  };

  const prevVariant = () => {
    if (variantNumber > 0) setVariantNumber(variantNumber - 1);
  };

  if (isComputing && result.type === MessageResultTypes.RESULT) setIsComputing(false);

  let content;
  switch (result.type) {
    case MessageResultTypes.INIT:
    case MessageResultTypes.STATUS:
      content = <ProgressBar result={result} />;
      break;
    case MessageResultTypes.RESULT:
      content = <TimeTable result={result} variantNumber={variantNumber} nextVariant={nextVariant} prevVariant={prevVariant} />;
      break;
    case MessageResultTypes.PRE_INIT:
    default:
      content = <Intro />;
      break;
  }

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
          allowLocked={allowLocked}
          setAllowLocked={allowLockedUpdate}
          allowFull={allowFull}
          setAllowFull={allowFullUpdate}
          computeCallback={computeCallback}
          disabled={isComputing}
        />
        <Box flex={1} width="full">
          {content}
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
        allowLocked={allowLocked}
        setAllowLocked={allowLockedUpdate}
        allowFull={allowFull}
        setAllowFull={allowFullUpdate}
        computeCallback={computeCallback}
        disabled={isComputing}
      />
    </>
  );
}
