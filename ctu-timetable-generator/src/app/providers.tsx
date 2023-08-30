'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, useDisclosure } from '@chakra-ui/react';
import { DrawerContext, theme } from '@src/lib';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const disclosure = useDisclosure();

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DrawerContext.Provider value={disclosure}>{children}</DrawerContext.Provider>
      </ChakraProvider>
    </CacheProvider>
  );
}
