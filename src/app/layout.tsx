import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "algorithm-playground",
    template: "%s | algorithm-playground",
  },
  description: "A minimalist, premium algorithm visualization workspace scaffold built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const key = "algorithm-playground-theme";
              const root = document.documentElement;
              const savedTheme = localStorage.getItem(key);
              const validTheme = savedTheme === "dark" || savedTheme === "light";
              const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              const isDark = validTheme ? savedTheme === "dark" : prefersDark;
              root.classList.toggle("dark", isDark);
              root.style.colorScheme = isDark ? "dark" : "light";
            })();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
