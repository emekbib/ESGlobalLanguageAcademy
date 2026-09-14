import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
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
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <body className={`${nunito.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
