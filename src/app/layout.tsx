import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { FILLS_LOGO_SRC } from "@/components/FillsLogo";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "FILLS Bonus — реферальная программа",
  description:
    "Приводите друзей в FILLS: 5% бонус вам и 5% скидка другу на оплаченный заказ.",
  icons: {
    icon: FILLS_LOGO_SRC,
    apple: FILLS_LOGO_SRC,
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${roboto.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
