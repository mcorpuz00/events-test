import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "./SmoothScroll";
import AgentationWrapper from "./AgentationWrapper";

export const metadata: Metadata = {
  title: "Airspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        {children}
        <AgentationWrapper />
      </body>
    </html>
  );
}
