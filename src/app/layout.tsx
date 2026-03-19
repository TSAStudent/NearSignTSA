import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ThemeApplier from "@/components/ThemeApplier";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NearSign - Meet people who communicate like you",
  description: "A friend-finding app for Deaf/HoH users to connect with nearby people who share communication preferences, interests, and comfort levels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ThemeApplier />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
