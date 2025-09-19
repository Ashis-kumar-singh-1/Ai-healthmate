
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthMate AI",
  description: "An AI-powered multilingual healthcare assistant for symptom analysis, report summarization, and lifestyle guidance. This application is for informational purposes and is not a substitute for professional medical advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500;700&family=Noto+Sans+Devanagari:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-100 dark:bg-gray-900">
        {children}
      </body>
    </html>
  );
}
