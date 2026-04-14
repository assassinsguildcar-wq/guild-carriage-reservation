import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guild Carriage Reservation",
  description: "Guild carriage schedule management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}