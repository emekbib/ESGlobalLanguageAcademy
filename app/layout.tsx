import './globals.css';
import type { Metadata } from 'next';
import { Nunito, Inter } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ESGlobal Language Academy | Book 1-on-1 Lessons with Native Teachers',
  description: 'Book personalized 1-on-1 language lessons with verified native teachers worldwide.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
