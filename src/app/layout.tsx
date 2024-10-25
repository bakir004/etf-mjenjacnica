import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "../components/ui/sonner";
import Navbar from "./_components/Navbar";

export const metadata: Metadata = {
  title: "ETF Zmanger",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html lang="en" className={`${GeistSans.variable}`}>
        <TRPCReactProvider>
          <body className="dark">
            <Navbar></Navbar>
            {children}
            <Toaster></Toaster>
          </body>
        </TRPCReactProvider>
      </html>
    </ClerkProvider>
  );
}
