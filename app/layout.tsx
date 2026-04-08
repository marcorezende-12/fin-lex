import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";

import { ThemeProvider } from "./_components/providers/theme-provider";

const mulish = Mulish({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinLex",
  description: "Gestão financeira para advogados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
      >
        <body className={`${mulish.className} h-full antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-full flex-col overflow-hidden">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
