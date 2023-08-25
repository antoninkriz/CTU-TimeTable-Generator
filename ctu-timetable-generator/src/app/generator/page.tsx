'use client';

import {
  useEffect, useRef, useState,
} from 'react';
import {
  Heading, Stack, Text, Button,
} from '@chakra-ui/react';
import type { SWRResponse } from 'swr';
import { useData } from '@src/app/generator/lib';
import type { Data } from '@src/app/generator/lib';
import type { MessageData, MessageResult } from '@src/app/generator/worker';

function useDataWorker(): [string | undefined, (params: MessageData) => void] {
  const workerRef = useRef<Worker>();
  const [result, setResult] = useState<string | undefined>(undefined);

  // Manage response from the worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<MessageResult>) => {
      if ('rand' in event.data) {
        setResult(event.data.rand.toString());
      } else {
        setResult(event.data.result.toString());
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  return [result, (params: MessageData) => workerRef.current?.postMessage(params)];
}

function DataComponent({
  dataResponse,
}: {
  dataResponse: SWRResponse<Data>
}) {
  const {
    data, isLoading, isValidating, error,
  } = dataResponse;

  const [result, postMessage] = useDataWorker();

  if (isLoading || isValidating) return <Text>Načítání dat</Text>;
  if (error || data === undefined) return <Text>Nastala chyba při načítání dat</Text>;

  return (
    <Text>Dostupné semestry: {result?.toString() || (
    <Button onClick={() => {
      console.time('hello');
      postMessage({ classes: [], semesters: data });
    }}
    >LOAD
    </Button>
    )}
    </Text>
  );
}

export default function Generator() {
  const data = useData();

  return (
    <Stack textAlign="center" fontFamily="monospace">
      <Heading>IN-PROGRESS</Heading>
      <Text>
        Aplikace je zatím ve vývoji. Zkus to prosím později!
      </Text>
      <DataComponent dataResponse={data} />
    </Stack>
  );
}
