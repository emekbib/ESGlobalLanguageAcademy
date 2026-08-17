import './globals.css';
import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  title: 'ESGlobalLanguageAcademy',
  description: 'A language academy connecting students and teachers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
