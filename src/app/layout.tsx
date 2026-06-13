import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FILLS_LOGO_SRC } from "@/components/FillsLogo";
import { getBonusSiteUrl } from "@/lib/site-urls";
import "./globals.css";

const siteUrl = getBonusSiteUrl();

export const metadata: Metadata = {
  title: "FILLS Bonus — реферальная программа",
  description:
    "Приводите друзей в FILLS: 5% бонус вам и 5% скидка другу. Бесплатная регистрация, личный кабинет, вывод или трата бонусов на мебель.",
  icons: {
    icon: FILLS_LOGO_SRC,
    apple: FILLS_LOGO_SRC,
  },
  openGraph: {
    title: "FILLS Bonus — зарабатывайте, рекомендуя мебель FILLS",
    description:
      "5% бонус вам и 5% скидка другу. Бесплатно, без ограничений по количеству приглашений.",
    url: siteUrl,
    siteName: "FILLS Bonus",
    locale: "ru_RU",
    type: "website",
    images: [{ url: `${siteUrl}${FILLS_LOGO_SRC}` }],
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full font-sans antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          href="/fonts/Roboto-Regular.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Roboto-Light.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
