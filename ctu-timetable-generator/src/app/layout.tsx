import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CTU TimeTable Generator',
  description: 'Najdi svůj optimální rozvrh bez složitého hledání vhodných paralelek, přednášek, cvičení a předmětů.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
