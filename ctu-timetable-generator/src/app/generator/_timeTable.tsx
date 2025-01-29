import {
  Box,
  Button,
  Card,
  CardFooter,
  CardHeader,
  Center,
  Container,
  Divider,
  Heading,
  HStack,
  Icon,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { MessageResultResult, ParallelType, WeekType } from '@src/types';
import { useMemo } from 'react';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';

type TimeTableUIEvent = {
  course: string;
  type: ParallelType;
  num: number | null;
  day: number;
  start: number;
  end: number;
  startText: string;
  endText: string;
  room: string | null;
  is_merged: boolean;
};

const TIME_START = 7 * 60;
const TIME_END = 20 * 60;
const TIME_TOTAL = TIME_END - TIME_START;

const DAYS = [
  'PO', 'ÚT', 'ST', 'ČT', 'PÁ',
];

const range = (start: number, stop: number) => Array(Math.ceil((stop - start))).fill(start).map((x, y) => x + y);

function Line({ time }: { time: number }) {
  return (
    <VStack left={`${((time - TIME_START) / TIME_TOTAL) * 100}%`} w="min" h="full" pos="absolute">
      <Divider orientation="vertical" />
      <Text as="span" pos="absolute" bottom="100%" fontWeight="hairline" fontSize="xs" fontFamily="mono">{time / 60}</Text>
    </VStack>
  );
}

function Row({ events, day }: { events: TimeTableUIEvent[], day: number }) {
  const rowBg = useColorModeValue('gray.100', 'gray.900');
  const colors = {
    [ParallelType.Lecture]: useColorModeValue('yellow.300', 'yellow.600'),
    [ParallelType.Tutorial]: useColorModeValue('green.400', 'green.600'),
    [ParallelType.Lab]: useColorModeValue('red.400', 'red.800'),
  };

  const diff = [...events.map((x) => x.start), 0];
  const diffEnd = [TIME_START, ...events.map((x) => x.end)];
  for (let i = 0; i < diff.length; i++) {
    diff[i] -= diffEnd[i];
  }

  return (
    <HStack minH={20} bg={day % 2 === 1 ? rowBg : undefined} gap={0}>
      <Center w={4} m={2} fontFamily="mono">{DAYS[day % 5]}</Center>
      <Box flex={1} w="full" display="flex" alignItems="center">
        { events.map((event, i) => (
          <Tooltip
            key={`${event.course} ${event.num} ${event.day} ${event.start}`}
            label={(
              <VStack align="start" spacing={0}>
                <Text>{event.is_merged ? 'Sloučeno v rámci paralelky' : ' '}</Text>
                <Text>{event.room ?? ' '}</Text>
              </VStack>
            )}
            hasArrow
          >
            <Card
              size="xs"
              ml={`${(diff[i] / TIME_TOTAL) * 100}%`}
              minH={16}
              width={`${((event.end - event.start) / TIME_TOTAL) * 100}%`}
              background={colors[event.type]}
              display="inline-flex"
              flexDirection="column"
              justifyContent="space-between"
              borderRadius={3}
            >
              <CardHeader p={1} pb={0}>
                <Heading fontSize="xs">
                  {event.course}
                </Heading>
              </CardHeader>
              <CardFooter p={1} pt={0}>
                <Box fontSize="2xs" width="full">
                  <Text flex={1}>{event.startText} - {event.endText}</Text>
                  <Text>{event.num ?? ' '}</Text>
                </Box>
              </CardFooter>
            </Card>
          </Tooltip>
        )) }
      </Box>
    </HStack>
  );
}

export function TimeTable({
  result,
  variantNumber,
  nextVariant,
  prevVariant,
} : {
  result: MessageResultResult,
  variantNumber: number,
  nextVariant: () => void,
  prevVariant: () => void,
}) {
  const data = useMemo(
    () => result.data.map((variant) => variant.map(([course, parallel]) => parallel.timetable.map((event) => ({
      course: course.code,
      type: parallel.type,
      num: parallel.num,
      day: (event.day - 1) + (event.week === WeekType.Even ? 5 : 0),
      start: event.start[0] * 60 + event.start[1],
      end: event.end[0] * 60 + event.end[1],
      startText: `${event.start[0].toString().padStart(2, '0')}:${event.start[1].toString().padStart(2, '0')}`,
      endText: `${event.end[0].toString().padStart(2, '0')}:${event.end[1].toString().padStart(2, '0')}`,
      room: event.room,
      is_merged: event.is_merged,
    } as TimeTableUIEvent))))
      .map((variant) => variant.reduce((mapping, parallel) => {
        for (const event of parallel) {
          if (!mapping[event.day]) mapping[event.day] = [];
          mapping[event.day].push(event);
        }
        return mapping;
      }, {} as { [key : number]: TimeTableUIEvent[] })),
    [result.data],
  );

  if (data.length === 0) {
    return (
      <Center h="full" w="full">
        <Container textAlign="center">
          <VStack spacing={4}>
            <Heading fontSize="2xl">Nenalezen žádný rozvrh, který by neobsahoval kolize<br />😥</Heading>
            <Text as="i">
              Pronikl jsem vpřed v čase a zahlédl jsem všech {result.total} {result.total >= 5 ? 'možných' : result.total >= 2 ? 'možné' : 'možnou'}{' '}
              budoucnost{result.total >= 2 ? 'i' : ''}, abych zjistil, jak bude vypadat tvůj semestr.
              Ani jedna možnost nebyla bez kolizí.
            </Text>
            <Text>
              Zkus zvolit méně předmětů, zakázat přednášky, cvičení či laboratoře u předmětů, které tě třeba tolik nezajímají, a nebo si přiznat, že tenhle
              semestr bude holt patřit mezi ty náročnější.
            </Text>
          </VStack>
        </Container>
      </Center>
    );
  }

  return (
    <>
      <VStack h="full">
        <HStack w="full" position="sticky" justifyContent="space-around" px={8} py={4}>
          <Button onClick={prevVariant} isDisabled={variantNumber === 0}>
            <Icon as={IoArrowBack} />
          </Button>
          <Text fontFamily="mono">Rozvrh #{variantNumber + 1} / {data.length}</Text>
          <Button onClick={nextVariant} isDisabled={variantNumber === data.length - 1}>
            <Icon as={IoArrowForward} />
          </Button>
        </HStack>
        <Box w={{ base: '100dvw', lg: 'full' }} overflowX="auto">
          <Heading fontSize="lg" mx={4} mt={4}>Lichý týden</Heading>
          <Box pos="relative" mt={6} minW={{ base: 'calc(var(--chakra-sizes-20) * 12)', md: 'auto' }}>
            <Box w="stretch" h="full" pos="absolute" ml={8} pointerEvents="none">
              {range(8, 20).map((i) => <Line key={i} time={i * 60} />)}
            </Box>
            {range(0, 5).map((i) => (
              <Row key={i} events={data[variantNumber][i] ?? []} day={i} />
            ))}
          </Box>
          <Heading fontSize="lg" mx={4} mt={4}>Sudý týden</Heading>
          <Box pos="relative" mt={6} minW={{ base: 'calc(var(--chakra-sizes-20) * 12)', md: 'auto' }}>
            <Box w="stretch" h="full" pos="absolute" ml={8}>
              {range(8, 20).map((i) => <Line key={i} time={i * 60} />)}
            </Box>
            {range(5, 10).map((i) => (
              <Row key={i} events={data[variantNumber][i] ?? []} day={i} />
            ))}
          </Box>
        </Box>
      </VStack>
    </>
  );
}
