import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppSidebar } from '@/app/components/app-sidebar';
import { Nav } from '@/app/components/nav';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { routing } from '@/app/lib/i18n/routing';
import BottomDock from '@/app/components/bottom-dock';
import { ClientProviders } from '@/app/components/providers/client-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Living Water Church',
  description: 'Living Water Church Website',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider>
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
