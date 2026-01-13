import { Theme } from "@radix-ui/themes";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import "@radix-ui/themes/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Code Configurator",
  description: "Visual configuration tool for Claude Code settings.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme accentColor="violet" grayColor="slate" radius="medium">
          {children}
        </Theme>
        <Analytics />
      </body>
    </html>
  );
}
