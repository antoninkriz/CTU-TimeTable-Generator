import {
  Center, Container, HStack, Progress, Stack, Text, Tooltip,
} from '@chakra-ui/react';
import type { MessageResult } from '@src/types';
import { MessageResultTypes } from '@src/types';

export function ProgressBar({ result }: { result: MessageResult }) {
  if (result.type !== MessageResultTypes.STATUS && result.type !== MessageResultTypes.INIT) return undefined;
  const { done, total } = result.type === MessageResultTypes.STATUS ? result : { done: 0, total: 1 };

  const progress = (done / total) * 100;

  return (
    <Center h="full" w="full">
      <Container>
        <Stack>
          <HStack justifyContent="space-between" px={4}>
            <Text>Probíhá výpočet...</Text>
            <Text fontFamily="mono">{progress.toFixed(1)} %</Text>
          </HStack>
          <Tooltip
            fontFamily="mono"
            label={`${done} / ${total}`}
            hasArrow
          >
            <Progress value={progress} rounded="sm" />
          </Tooltip>
        </Stack>
      </Container>
    </Center>
  );
}
