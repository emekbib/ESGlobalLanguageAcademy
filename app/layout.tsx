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
  description:
    'Connect with verified native educators for personalized 1-on-1 video lessons in Amharic, Tigrigna, Afaan Oromo, Somali, and Swahili. Zero subscriptions, instant scheduling, and escrow protection.',
  keywords: [
    'Amharic tutor',
    'learn Amharic online',
    'Tigrigna lessons',
    'learn Tigrigna',
    'Afaan Oromo language teacher',
    'Somali tutor',
    'Swahili language lessons',
    'ESGlobal Language Academy',
    '1-on-1 language lessons',
  ],
  authors: [{ name: 'ESGlobal Language Academy' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'ESGlobal Language Academy | Book 1-on-1 Lessons with Native Teachers',
    description:
      'Book personalized 1-on-1 language lessons with verified native teachers in Amharic, Tigrigna, Afaan Oromo, Somali, and Swahili.',
    siteName: 'ESGlobal Language Academy',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESGlobal Language Academy | Book 1-on-1 Lessons with Native Teachers',
    description:
      'Book personalized 1-on-1 language lessons with verified native teachers in Amharic, Tigrigna, Afaan Oromo, Somali, and Swahili.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <body className={`${nunito.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
