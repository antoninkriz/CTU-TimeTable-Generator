'use client';

import {
  useContext, useEffect, useRef, useState,
} from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Checkbox,
  Code,
  Container,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Progress,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import type { SWRResponse } from 'swr';
import { arrayDifference, useToastDataWrapper } from '@src/app/generator/lib';
import type {
  Course, CoursePreferences, Data, MessageData, MessageResult,
} from '@src/types';
import { MessageResultTypes, OptionClass, ParallelType } from '@src/types';
import { GITHUB_URL } from '@src/consts';
import { DrawerContext } from '@src/lib';
import { AsyncSelect, Select } from 'chakra-react-select';
import { Link } from '@chakra-ui/next-js';

function useDataWorker(): [MessageResult, (params: MessageData) => void] {
  const workerRef = useRef<Worker>();
  const [result, setResult] = useState<MessageResult>({ type: MessageResultTypes.PRE_INIT });

  // Manage response from the worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./_worker/worker.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<MessageResult>) => {
      if (event.data.type === MessageResultTypes.RESULT) {
        console.log(event.data);
      }
      setResult(event.data);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return [result, (params: MessageData) => workerRef.current?.postMessage(params)];
}

function Error({ error }: { error: any }) {
  const blueLink = useColorModeValue('blue.700', 'blue.300');

  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>Nastala chyba při načítání dat.</AlertTitle>
      Prosím, vytvoř novou Issue na <Link href={GITHUB_URL} color={blueLink} fontWeight="600" target="_blank">GitHubu</Link> společně se screenshotem a blokem
      následujícího kódu:
      <Code>{JSON.stringify(error)}</Code>
    </Alert>
  );
}

type FormComponentProps = {
  dataResponse: SWRResponse<Data>,
  semester: string | undefined,
  setSemester: (semester: string | undefined) => void,
  courses: Array<Course>,
  setCourses: (courses: Array<Course>) => void,
  preferences: { [courseId: string]: { [parallelType in ParallelType]: boolean } }
  setPreferences: (courseId: string, parallelType: ParallelType, value: boolean) => void,
  computeCallback: () => void,
};

function FormComponent({
  dataResponse,
  semester,
  setSemester,
  courses,
  setCourses,
  preferences,
  setPreferences,
  computeCallback,
} : FormComponentProps) {
  const { data, error } = dataResponse;
  const isLoaded = !dataResponse.isLoading && !dataResponse.isValidating;

  if (error || (isLoaded && !data)) return <Error error={error} />;

  const valueSemester = semester !== undefined ? new OptionClass(semester, semester) : undefined;
  const optionsSemesters = Object.keys(data || {}).map((semesterId) => new OptionClass(semesterId, semesterId));
  const valueCourses = courses.map((course) => new OptionClass(course, `${course.code} | ${course.name}`));
  const filterCourses = (
    data && semester
      ? (inp: string, callback: (options: Array<OptionClass<Course>>) => void) => callback(
        inp.length >= 3
          ? data[semester].map((course) => new OptionClass(course, `${course.code} | ${course.name}`)).filter((x) => x.label.toLowerCase().includes(inp.toLowerCase()))
          : [],
      )
      : () => []
  );
  const optionsCourses = data && semester !== undefined ? data[semester].map((course) => new OptionClass(course, `${course.code} | ${course.name}`)) : [];

  return (
    <>
      <Skeleton h={!isLoaded ? 28 : undefined} isLoaded={isLoaded}>
        <Text textAlign="justify">
          Zvol semestr a předměty, respektive jejich přednášky, cvičení a laboratoře, které tě zajímají. Pokud si rovnou teď přiznáš, že nebudeš na přednášky
          chodit, zvýšíš šanci, že ti appka dokáže najít bezkolizní rozvrh. S kolizemi (zatím) neumí pracovat.
        </Text>
      </Skeleton>
      <Divider />
      <Skeleton h={!isLoaded ? 12 : undefined} isLoaded={isLoaded} fontFamily="mono">
        <Select<OptionClass<string>, false>
          instanceId="select-semesters"
          onChange={(x) => setSemester(x !== null ? x.value : undefined)}
          value={valueSemester}
          options={optionsSemesters}
          placeholder="Zvol seemstr"
        />
      </Skeleton>
      <Skeleton h={!isLoaded ? 12 : undefined} isLoaded={isLoaded} fontFamily="mono">
        <AsyncSelect<OptionClass<Course>, true>
          instanceId="select-courses"
          isMulti
          isDisabled={semester === undefined}
          onChange={(x) => setCourses(x.map((course) => course.value))}
          value={valueCourses}
          loadOptions={filterCourses}
          options={optionsCourses}
          placeholder="Zvol předměty"
          closeMenuOnSelect={false}
          closeMenuOnScroll={false}
          noOptionsMessage={({ inputValue }) => (
            !inputValue
              ? 'Zadej název nebo kód předmětu'
              : (
                inputValue.length >= 3
                  ? 'Nenalezen žádný předmět'
                  : 'Zadej alespoň 3 znaky'
              )
          )}
        />
      </Skeleton>
      <Divider />
      <Skeleton flex={1} isLoaded={isLoaded}>
        <TableContainer>
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Kód</Th>
                <Th>Přednášky</Th>
                <Th>Cvičení</Th>
                <Th>Laboratoře</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.map((course) => (
                <Tr key={course.code}>
                  <Th fontFamily="mono">{course.code}</Th>
                  <Th>
                    <Checkbox
                      defaultChecked
                      checked={preferences[course.code]?.[ParallelType.Lecture]}
                      onChange={(e) => setPreferences(course.code, ParallelType.Lecture, e.target.checked)}
                    />
                  </Th>
                  <Th>
                    <Checkbox
                      defaultChecked
                      checked={preferences[course.code]?.[ParallelType.Tutorial]}
                      onChange={(e) => setPreferences(course.code, ParallelType.Tutorial, e.target.checked)}
                    />
                  </Th>
                  <Th>
                    <Checkbox
                      defaultChecked
                      checked={preferences[course.code]?.[ParallelType.Lab]}
                      onChange={(e) => setPreferences(course.code, ParallelType.Lab, e.target.checked)}
                    />
                  </Th>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Skeleton>
      <Divider />
      <Skeleton h={!isLoaded ? 10 : undefined} isLoaded={isLoaded}>
        <Tooltip label={semester === undefined || courses.length === 0 ? 'Vyber si předměty' : undefined} hasArrow>
          <Button
            onClick={computeCallback}
            isDisabled={semester === undefined || courses.length === 0}
            w="full"
          >
            Spustit výpočet
          </Button>
        </Tooltip>
      </Skeleton>
    </>
  );
}

function MenuSide({
  dataResponse,
  semester,
  setSemester,
  courses,
  setCourses,
  preferences,
  setPreferences,
  computeCallback,
}: FormComponentProps) {
  return (
    <Flex display={{ base: 'none', xl: 'block' }} w="lg" shadow="md">
      <Stack w="full" h="full" flex={1} spacing={6} p={6}>
        <FormComponent
          dataResponse={dataResponse}
          semester={semester}
          setSemester={setSemester}
          courses={courses}
          setCourses={setCourses}
          preferences={preferences}
          setPreferences={setPreferences}
          computeCallback={computeCallback}
        />
      </Stack>
    </Flex>
  );
}

function MenuDrawer({
  dataResponse,
  semester,
  setSemester,
  courses,
  setCourses,
  preferences,
  setPreferences,
  computeCallback,
}: FormComponentProps) {
  const { isOpen, onClose } = useContext(DrawerContext);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'sm' }} placement="left">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader />
        <DrawerBody>
          <Flex direction="column">
            <Stack w="full" h="full" flex={1} spacing={6}>
              <FormComponent
                dataResponse={dataResponse}
                semester={semester}
                setSemester={setSemester}
                courses={courses}
                setCourses={setCourses}
                preferences={preferences}
                setPreferences={setPreferences}
                computeCallback={computeCallback}
              />
            </Stack>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default function Generator() {
  const dataResponse = useToastDataWrapper();

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
      postMessage({
        semester: dataResponse.data[semester],
        preferences,
      });
    }
  };

  if (isComputing && result.type === MessageResultTypes.RESULT) setIsComputing(false);

  const progress = result.type === MessageResultTypes.STATUS || result.type === MessageResultTypes.RESULT
    ? (result.done / result.total) * 100
    : 0;

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
        />
        <Box flex={1} width="full">
          <Center h="full" w="full">
            <Container>
              <Stack>
                <HStack justifyContent="space-between" px={4}>
                  <Text>Probíhá výpočet...</Text>
                  <Text fontFamily="mono">{progress.toFixed(1)} %</Text>
                </HStack>
                <Tooltip
                  fontFamily="mono"
                  label={
                    result.type === MessageResultTypes.STATUS || result.type === MessageResultTypes.RESULT
                      ? `${result.done} / ${result.total}`
                      : undefined
                  }
                  hasArrow
                >
                  <Progress value={progress} rounded="sm" />
                </Tooltip>
              </Stack>
            </Container>
          </Center>
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
      />
    </>
  );
}
