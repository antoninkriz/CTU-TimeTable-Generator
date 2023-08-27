'use client';

import type { ReactNode } from 'react';

import Nav from '@src/components/nav';
import { BASE_URL } from '@src/consts';
import { Flex } from '@chakra-ui/react';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;400;700;800&family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap" rel="stylesheet" />

        <title>Vytvoř si rozvrh | TTG</title>
        <meta name="description" content="Najdi svůj optimální rozvrh bez složitého hledání vhodných paralelek, přednášek, cvičení a předmětů." />
        <link rel="canonical" href="https://antoninkriz.github.io/CTU-TimeTable-Generator/" />

        <link rel="apple-touch-icon" sizes="180x180" href="/CTU-TimeTable-Generator/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/CTU-TimeTable-Generator/favicon-512x512.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/CTU-TimeTable-Generator/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/CTU-TimeTable-Generator/favicon-16x16.png" />
        <link rel="manifest" href="/CTU-TimeTable-Generator/site.webmanifest" />
        <link rel="mask-icon" href="/CTU-TimeTable-Generator/safari-pinned-tab.svg" color="#000000" />

        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Vytvoř si rozvrh | TTG" />
        <meta property="og:description" content="Najdi svůj optimální rozvrh bez složitého hledání vhodných paralelek, přednášek, cvičení a předmětů." />
        <meta property="og:url" content="https://antoninkriz.github.io/CTU-TimeTable-Generator/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${BASE_URL}/CTU-TimeTable-Generator/favicon-512x512.png`} />
        <meta property="og:image:alt" content="Logo for CTU TimeTable Generator" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:locale" content="cz_CS" />
      </head>
      <Flex as="body" direction="column" minH="100vh">
        <Providers>
          <Nav />
          <Flex as="main" direction="row" w="full" flex="1">
            {children}
          </Flex>
        </Providers>
      </Flex>
    </html>
  );
}
