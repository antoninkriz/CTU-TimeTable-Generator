import {
  Box, Button, Card, CardBody, CardFooter, CardHeader, Center, Container, Divider, Heading, HStack, Icon, Text, useColorModeValue, VStack,
} from '@chakra-ui/react';
import type { MessageResult } from '@src/types';
import { MessageResultTypes, ParallelType, WeekType } from '@src/types';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';

type TimeTableUIEvent = {
  course: string,
  type: ParallelType
  num: number | null,
  day: number,
  start: number,
  end: number,
  startText: string,
  endText: string
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
  const minH = 16;
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
      <Box flex={1} w="full">
        { events.map((event, i) => (
          <Card
            key={`${event.course} ${event.num} ${event.day} ${event.start}`}
            size="xs"
            ml={`${(diff[i] / TIME_TOTAL) * 100}%`}
            minH={minH}
            width={`${((event.end - event.start) / TIME_TOTAL) * 100}%`}
            background={colors[event.type]}
            display="inline-flex"
          >
            <CardHeader p={1} pb={0}>
              <Heading fontSize="sm">
                {event.course}
              </Heading>
            </CardHeader>
            <CardBody />
            <CardFooter p={1} pt={0}>
              <Box fontSize="2xs" width="full">
                <Text flex={1}>{event.startText} - {event.endText}</Text>
                <Text>{event.num ?? ' '}</Text>
              </Box>
            </CardFooter>
          </Card>
        )) }
      </Box>
    </HStack>
  );
}

export function TimeTable({
  result,
  variant,
  nextVariant,
  prevVariant,
} : {
  result: MessageResult,
  variant: number,
  nextVariant: () => void,
  prevVariant: () => void,
}) {
  if (result.type !== MessageResultTypes.RESULT) return undefined;

  const data = result.data.map((x) => Object.entries(x).reduce((arrAll, [code, bestParallels]) => {
    arrAll.push(
      ...Object.entries(bestParallels)
        .filter(([, parallel]) => parallel !== undefined)
        .reduce((arrEvents, [type, parallel]) => {
          arrEvents.push(...parallel!.timetable.reduce((arrTmp, event) => {
            const base = {
              course: code,
              type: type as ParallelType,
              num: parallel!.num,
              day: -1,
              start: event.start[0] * 60 + event.start[1],
              end: event.end[0] * 60 + event.end[1],
              startText: `${event.start[0].toString().padStart(2, '0')}:${event.start[1].toString().padStart(2, '0')}`,
              endText: `${event.end[0].toString().padStart(2, '0')}:${event.end[1].toString().padStart(2, '0')}`,
            } as TimeTableUIEvent;

            if (event.week === null) {
              arrTmp.push({ ...base, day: (event.day - 1) });
              arrTmp.push({ ...base, day: (event.day - 1) + 5 });
            } else {
              arrTmp.push({ ...base, day: (event.day - 1) + (event.week === WeekType.Odd ? 0 : 5) });
            }
            return arrTmp;
          }, [] as Array<TimeTableUIEvent>));
          return arrEvents.sort((a, b) => a.start - b.start);
        }, [] as Array<TimeTableUIEvent>),
    );
    return arrAll;
  }, [] as Array<TimeTableUIEvent>).reduce((obj, event) => {
    if (!(event.day in obj)) obj[event.day] = [];
    obj[event.day].push(event);
    return obj;
  }, {} as { [day: number]: Array<TimeTableUIEvent> }));

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
      <Center h="full" w="full" flexDirection="column">
        <HStack w="full" justifyContent="space-around" px={8} py={4}>
          <Button onClick={prevVariant} isDisabled={variant === 0}>
            <Icon as={IoArrowBack} />
          </Button>
          <Text fontFamily="mono">Rozvrh #{variant + 1} / {data.length}</Text>
          <Button onClick={nextVariant} isDisabled={variant === data.length - 1}>
            <Icon as={IoArrowForward} />
          </Button>
        </HStack>
        <Box w="full">
          <Heading fontSize="lg" mx={4} mt={4}>Lichý týden</Heading>
          <Box pos="relative" mt={6}>
            <Box w="stretch" h="full" pos="absolute" ml={8}>
              {range(8, 20).map((i) => <Line key={i} time={i * 60} />)}
            </Box>
            {range(0, 5).map((i) => (
              <Row key={i} events={data[variant][i] ?? []} day={i} />
            ))}
          </Box>
          <Heading fontSize="lg" mx={4} mt={4}>Sudý týden</Heading>
          <Box pos="relative" mt={6}>
            <Box w="stretch" h="full" pos="absolute" ml={8}>
              {range(8, 20).map((i) => <Line key={i} time={i * 60} />)}
            </Box>
            {range(5, 10).map((i) => (
              <Row key={i} events={data[variant][i] ?? []} day={i} />
            ))}
          </Box>
        </Box>
      </Center>
    </>
  );
}
