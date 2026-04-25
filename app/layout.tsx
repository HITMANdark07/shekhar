import type { Metadata } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jb-mono",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  title: "shekhar.os — Senior Software Engineer",
  description:
    "Shekhar Kumar — Senior Software Engineer. Backend-heavy, data-driven. Node · NestJS · Postgres · Next · React Native · LangChain · RAG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${vt323.variable}`}
      suppressHydrationWarning
    >
      <body data-theme="green" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
