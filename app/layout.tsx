import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Teemdrop × PagePilote Connector",
  description:
    "Automation blueprint for syncing Teemdrop orders into PagePilote in real time."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
