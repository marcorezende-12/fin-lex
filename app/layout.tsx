import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";

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
    <html lang="en" className="h-full">
      <ClerkProvider
        appearance={{
          theme: dark,
        }}
      >
        <body className={`${mulish.className} dark h-full antialiased`}>
          <div className="flex h-full flex-col overflow-hidden">{children}</div>
        </body>
      </ClerkProvider>
    </html>
  );
}
