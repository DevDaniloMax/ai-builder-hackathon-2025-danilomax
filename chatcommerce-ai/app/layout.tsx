import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatCommerce AI",
  description: "AI-powered conversational shopping assistant",
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
