'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { ReactNode } from 'react';

const colors = {};

export const theme = extendTheme({ colors });

export function Providers({
  children,
}: {
  children: ReactNode
}) {
  return (
    <CacheProvider>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
