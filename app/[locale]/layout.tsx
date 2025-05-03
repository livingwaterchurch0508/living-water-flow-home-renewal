import './globals.css';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { Analytics } from '@vercel/analytics/react';
import { Geist, Geist_Mono } from 'next/font/google';

import { AppSidebar } from '@/app/components/layout/app-sidebar';
import { Nav } from '@/app/components/layout/nav';
import BottomDock from '@/app/components/layout/bottom-dock';
import { ClientProviders } from '@/app/components/providers/client-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '생수가 흐르는 교회💒',
  description: '생수가 흐르는 교회에 오신걸 환영합니다!',
  openGraph: {
    title: '생수가 흐르는 교회💒',
    description: '생수가 흐르는 교회에 오신걸 환영합니다!',
    images: [
      {
        url: 'https://livingwater-church.co.kr/home_banner.png',
        width: 1134,
        height: 805,
        alt: '홈 배너',
      },
    ],
    type: 'website',
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale}>
          <ClientProviders>
            <div className="relative flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex w-full flex-col">
                <Nav />
                <main className="flex-1">{children}</main>
                <BottomDock />
              </div>
            </div>
            <Analytics />
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
