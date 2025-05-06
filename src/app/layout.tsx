import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Header } from "../components/layout/header";
import "./styles/globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"],
  preload: true,
  weight: ["400", "500", "700"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  preload: true,
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JOSANISM",
    template: "%s | JOSANISM",
  },
  applicationName: "JOSANISM",
  referrer: "origin-when-cross-origin",
  description: "ジョサン教公式ホームページ。",
  keywords: [
    "ジョサン教",
    "JOSANISM",
    "ジョサン中央銀行",
    "Josan Central Bank",
  ],
  generator: "Next.js",
  publisher: "Allah",
  creator: "Allah",
  authors: [{ name: "Allah" }],

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${notoSansJP.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
