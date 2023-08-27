'use client';

import { createContext } from 'react';
import { extendTheme } from '@chakra-ui/react';

export const fontsBase = '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"';
export const fontsBaseMono = 'SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace';

export const theme = extendTheme({
  colors: {},
  fonts: {
    heading: `"Open Sans",${fontsBase}`,
    body: `"Open Sans",${fontsBase}`,
    mono: `"JetBrains Mono",${fontsBaseMono}`,
  },
});

export const DrawerContext = createContext({
  isOpen: false,
  onOpen: () => {},
  onClose: () => {},
  onToggle: () => {},
});
