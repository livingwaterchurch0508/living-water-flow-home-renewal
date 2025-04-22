import './globals.css';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';

import { AppSidebar } from '@/app/components/app-sidebar';
import { Nav } from '@/app/components/nav';
import BottomDock from '@/app/components/bottom-dock';
import { ClientProviders } from '@/app/components/providers/client-providers';

import { cn } from '@/app/lib/utils';

// S-CoreDream 폰트 스타일 정의
const sCoreDreamFont = {
  variable: '--font-score',
  style: {
    fontFamily: 'S-CoreDream-4Regular',
  },
};

export const metadata: Metadata = {
  title: '생수가 흐르는 교회',
  description: '생수가 흐르는 교회에 오신 것을 환영합니다.',
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
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        'light',
        sCoreDreamFont.variable
      )}
    >
      <head>
        <style>
          {`
            @font-face {
              font-family: 'S-CoreDream-4Regular';
              src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/S-CoreDream-4Regular.woff') format('woff');
              font-weight: normal;
              font-style: normal;
            }

            body {
              font-family: 'S-CoreDream-4Regular', sans-serif;
            }
          `}
        </style>
      </head>
      <body>
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
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
