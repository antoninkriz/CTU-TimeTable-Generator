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
        <title>CTU TimeTable Generator</title>
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
