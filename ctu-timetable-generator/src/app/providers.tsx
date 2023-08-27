'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, useDisclosure } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { theme, DrawerContext } from '@src/lib';

export function Providers({
  children,
}: {
  children: ReactNode
}) {
  const disclosure = useDisclosure();

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <DrawerContext.Provider value={disclosure}>
          {children}
        </DrawerContext.Provider>
      </ChakraProvider>
    </CacheProvider>
  );
}
