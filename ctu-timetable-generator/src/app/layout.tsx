'use client';

import type { ReactNode } from 'react';

import Nav from '@src/components/nav';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <title>Vytvoř si rozvrh | TTG</title>
        <meta name="description" content="Najdi svůj optimální rozvrh bez složitého hledání vhodných paralelek, přednášek, cvičení a předmětů." />
        <link rel="canonical" href="https://antoninkriz.github.io/CTU-TimeTable-Generator/" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />

        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Vytvoř si rozvrh | TTG" />
        <meta property="og:description" content="Najdi svůj optimální rozvrh bez složitého hledání vhodných paralelek, přednášek, cvičení a předmětů." />
        <meta property="og:url" content="https://antoninkriz.github.io/CTU-TimeTable-Generator/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/favicon-512x512.png" />
        <meta property="og:image:alt" content="Logo for CTU TimeTable Generator" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:locale" content="cz_CS" />
      </head>
      <body>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
