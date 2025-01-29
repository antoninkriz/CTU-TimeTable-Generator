import { useContext } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle, Box,
  Button,
  Checkbox,
  Code,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link } from '@chakra-ui/next-js';
import { AsyncSelect, Select } from 'chakra-react-select';
import type { SWRResponse } from 'swr';
import type {
  Course, CourseAvailableOnly, Data,
} from '@src/types';
import { OptionClass, ParallelType } from '@src/types';
import { GITHUB_URL } from '@src/consts';
import { DrawerContext } from '@src/lib';

function Error({ errorJS }: { errorJS: Error | undefined }) {
  const blueLink = useColorModeValue('blue.700', 'blue.300');

  const error = !errorJS
    ? undefined
    : {
      name: errorJS.name,
      message: errorJS.message,
      stack: errorJS.stack,
    };

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error.name);
    // eslint-disable-next-line no-console
    console.error(error.message);
    // eslint-disable-next-line no-console
    console.error(error.stack);
  } else {
    // eslint-disable-next-line no-console
    console.error("Loaded data, no data and no error, that's weird.");
  }

  return (
    <Alert status="error" flexDirection="column" justifyContent="stretch" alignItems="flex-start" gap={4}>
      <Box display="flex" flexDirection="row">
        <AlertIcon />
        <AlertTitle>Nastala chyba při načítání dat.</AlertTitle>
      </Box>
      <AlertDescription>
        Prosím, vytvoř novou Issue na <Link href={GITHUB_URL} color={blueLink} fontWeight="600" target="_blank">GitHubu</Link> společně s popisem chyby, screenshotem a blokem
        následujícího kódu:
      </AlertDescription>
      <pre>
        <Code width="100%" whiteSpace="pre-wrap">{error ? JSON.stringify(error, null, 4) : 'No data'}</Code>
      </pre>
    </Alert>
  );
}

type FormComponentProps = {
  dataResponse: SWRResponse<Data>
  semester: string | undefined
  setSemester: (semester: string | undefined) => void
  courses: Course[]
  setCourses: (courses: Course[]) => void
  preferences: { [courseId: string]: { [parallelType in ParallelType]: boolean } }
  setPreferences: (courseId: string, parallelType: ParallelType, value: boolean) => void
  allowLocked: CourseAvailableOnly
  setAllowLocked: (courseId: string, value: boolean) => void
  allowFull: CourseAvailableOnly
  setAllowFull: (courseId: string, value: boolean) => void
  computeCallback: () => void
  disabled: boolean
};

function FormComponent({
  dataResponse,
  semester,
  setSemester,
  courses,
  setCourses,
  preferences,
  setPreferences,
  allowLocked,
  setAllowLocked,
  allowFull,
  setAllowFull,
  computeCallback,
  disabled,
  onCloseMenu = () => {},
} : FormComponentProps & { onCloseMenu?: () => void }) {
  const { data, error } = dataResponse;
  const isLoaded = !dataResponse.isLoading && !dataResponse.isValidating;

  if (error || (isLoaded && !data)) return <Error errorJS={error} />;

  const valueSemester = semester !== undefined ? new OptionClass(semester, semester) : undefined;
  const optionsSemesters = Object.keys(data || {}).map((semesterId) => new OptionClass(semesterId, semesterId));
  const valueCourses = courses.map((course) => new OptionClass(course, `${course.code} | ${course.name}`));
  const filterCourses = (
    data && semester
      ? (inp: string, callback: (options: OptionClass<Course>[]) => void) => callback(
        inp.length >= 3
          ? data[semester].map((course) => new OptionClass(course, `${course.code} | ${course.name}`)).filter((x) => x.label.toLowerCase().includes(inp.toLowerCase()))
          : [],
      )
      : () => []
  );
  const optionsCourses = data && semester !== undefined ? data[semester].map((course) => new OptionClass(course, `${course.code} | ${course.name}`)) : [];

  const paddingCellX = {
    base: 1,
    md: 4,
  };

  return (
    <>
      <Skeleton h={!isLoaded ? 28 : undefined} isLoaded={isLoaded}>
        <Text textAlign="justify">
          Zvol semestr a předměty, respektive jejich přednášky, cvičení a laboratoře, které tě zajímají.
          Pokud si rovnou teď přiznáš, že nebudeš na přednášky chodit, zvýšíš šanci, že ti appka dokáže najít bezkolizní
          rozvrh. S kolizemi (zatím) neumí pracovat. Pokud se v rámci jednoho předmětu a jednoho typu hodin
          (přednáška, cvičení, laboratoř) vyskytuje kolize nebo nějaká změna, například místnosti, v průběhu semestru,
          považují se tyto hodiny za sloučené.
        </Text>
      </Skeleton>
      <Divider />
      <Skeleton h={!isLoaded ? 12 : undefined} isLoaded={isLoaded} fontFamily="mono">
        <Select<OptionClass<string>, false>
          instanceId="select-semesters"
          onChange={(x) => setSemester(x !== null ? x.value : undefined)}
          value={valueSemester}
          options={optionsSemesters}
          placeholder="Zvol semestr"
          isDisabled={disabled}
        />
      </Skeleton>
      <Skeleton h={!isLoaded ? 12 : undefined} isLoaded={isLoaded} fontFamily="mono">
        <AsyncSelect<OptionClass<Course>, true>
          instanceId="select-courses"
          isMulti
          isDisabled={semester === undefined || disabled}
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
                <Th px={paddingCellX}>Kód</Th>
                <Th px={paddingCellX}>Přednášky</Th>
                <Th px={paddingCellX}>Cvičení</Th>
                <Th px={paddingCellX}>Laboratoře</Th>
                <Th px={paddingCellX}><Tooltip label={<Box textAlign="center">Brát v potaz i paralelky,<br />které nemají povolenou registraci</Box>}>🔒</Tooltip></Th>
                <Th px={paddingCellX}><Tooltip label={<Box textAlign="center">Brát v potaz i paralelky,<br />které jsou již naplněné</Box>}>🔋</Tooltip></Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.map((course) => (
                <Tr key={course.code}>
                  <Td px={paddingCellX} fontFamily="mono">{course.code}</Td>
                  <Td px={paddingCellX}>
                    {course.parallels[ParallelType.Lecture].length > 0 && (
                      <Checkbox
                        defaultChecked
                        checked={preferences[course.code]?.[ParallelType.Lecture]}
                        onChange={(e) => setPreferences(course.code, ParallelType.Lecture, e.target.checked)}
                        isDisabled={disabled}
                      />
                    )}
                  </Td>
                  <Td px={paddingCellX}>
                    {course.parallels[ParallelType.Tutorial].length > 0 && (
                    <Checkbox
                      defaultChecked
                      checked={preferences[course.code]?.[ParallelType.Tutorial]}
                      onChange={(e) => setPreferences(course.code, ParallelType.Tutorial, e.target.checked)}
                      isDisabled={disabled}
                    />
                    )}
                  </Td>
                  <Td px={paddingCellX}>
                    {course.parallels[ParallelType.Lab].length > 0 && (
                      <Checkbox
                        defaultChecked
                        checked={preferences[course.code]?.[ParallelType.Lab]}
                        onChange={(e) => setPreferences(course.code, ParallelType.Lab, e.target.checked)}
                        isDisabled={disabled}
                      />
                    )}
                  </Td>
                  <Td px={paddingCellX}>
                    <Checkbox
                      defaultChecked
                      checked={allowLocked[course.code]}
                      onChange={(e) => setAllowLocked(course.code, e.target.checked)}
                      isDisabled={disabled}
                    />
                  </Td>
                  <Td px={paddingCellX}>
                    <Checkbox
                      defaultChecked
                      checked={allowFull[course.code]}
                      onChange={(e) => setAllowFull(course.code, e.target.checked)}
                      isDisabled={disabled}
                    />
                  </Td>
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
            onClick={() => { onCloseMenu(); computeCallback(); }}
            isDisabled={disabled || semester === undefined || courses.length === 0 || Object.values(preferences).every((x) => !x.P && !x.C && !x.L)}
            w="full"
          >
            Spustit výpočet
          </Button>
        </Tooltip>
      </Skeleton>
    </>
  );
}

export function MenuSide({
  dataResponse,
  semester,
  setSemester,
  courses,
  setCourses,
  preferences,
  setPreferences,
  allowLocked,
  setAllowLocked,
  allowFull,
  setAllowFull,
  computeCallback,
  disabled,
}: FormComponentProps) {
  return (
    <Flex display={{ base: 'none', xl: 'block' }} w="xl" shadow="md">
      <Stack w="full" h="full" flex={1} spacing={6} p={6}>
        <FormComponent
          dataResponse={dataResponse}
          semester={semester}
          setSemester={setSemester}
          courses={courses}
          setCourses={setCourses}
          preferences={preferences}
          setPreferences={setPreferences}
          allowLocked={allowLocked}
          setAllowLocked={setAllowLocked}
          allowFull={allowFull}
          setAllowFull={setAllowFull}
          computeCallback={computeCallback}
          disabled={disabled}
        />
      </Stack>
    </Flex>
  );
}

export function MenuDrawer({
  dataResponse,
  semester,
  setSemester,
  courses,
  setCourses,
  preferences,
  setPreferences,
  allowLocked,
  setAllowLocked,
  allowFull,
  setAllowFull,
  computeCallback,
  disabled,
}: FormComponentProps) {
  const { isOpen, onClose } = useContext(DrawerContext);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'lg' }} placement="left">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody pt={10} px={4} pb={4} flex="none">
          <Flex direction="column" flex={1} height="full">
            <Stack w="full" h="full" flex={1} spacing={6}>
              <FormComponent
                dataResponse={dataResponse}
                semester={semester}
                setSemester={setSemester}
                courses={courses}
                setCourses={setCourses}
                preferences={preferences}
                setPreferences={setPreferences}
                allowLocked={allowLocked}
                setAllowLocked={setAllowLocked}
                allowFull={allowFull}
                setAllowFull={setAllowFull}
                computeCallback={computeCallback}
                disabled={disabled}
                onCloseMenu={onClose}
              />
            </Stack>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
