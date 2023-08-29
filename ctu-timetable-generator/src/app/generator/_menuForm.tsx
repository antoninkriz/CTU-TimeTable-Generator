import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Checkbox,
  Code,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
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
import { Link } from '@chakra-ui/next-js';
import { GITHUB_URL } from '@src/consts';
import type { SWRResponse } from 'swr';
import type {
  Course, Data,
} from '@src/types';
import { OptionClass, ParallelType } from '@src/types';
import { AsyncSelect, Select } from 'chakra-react-select';
import { useContext } from 'react';
import { DrawerContext } from '@src/lib';

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
  computeCallback,
  disabled,
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
          placeholder="Zvol semstr"
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
                      isDisabled={disabled}
                    />
                  </Th>
                  <Th>
                    <Checkbox
                      defaultChecked
                      checked={preferences[course.code]?.[ParallelType.Tutorial]}
                      onChange={(e) => setPreferences(course.code, ParallelType.Tutorial, e.target.checked)}
                      isDisabled={disabled}
                    />
                  </Th>
                  <Th>
                    <Checkbox
                      defaultChecked
                      checked={preferences[course.code]?.[ParallelType.Lab]}
                      onChange={(e) => setPreferences(course.code, ParallelType.Lab, e.target.checked)}
                      isDisabled={disabled}
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
            isDisabled={disabled || semester === undefined || courses.length === 0}
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
  computeCallback,
  disabled,
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
  computeCallback,
  disabled,
}: FormComponentProps) {
  const { isOpen, onClose } = useContext(DrawerContext);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'lg' }} placement="left">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader />
        <DrawerBody p={6}>
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
                computeCallback={computeCallback}
                disabled={disabled}
              />
            </Stack>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
