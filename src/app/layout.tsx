import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "RunA Log Technologies — Technology That Moves Your Business Forward",
    template: "%s | RunA Log Technologies",
  },
  description:
    "RunA Log Technologies builds powerful digital products, modern websites, and intelligent automations that help businesses work smarter, serve customers better, and grow faster.",
  keywords: [
    "RunA Log Technologies",
    "application development",
    "website development",
    "business automation",
    "digital marketing",
    "custom software",
    "digital solutions partner",
  ],
  authors: [{ name: "RunA Log Technologies" }],
  creator: "RunA Log Technologies",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "RunA Log Technologies",
    title: "RunA Log Technologies — Technology That Moves Your Business Forward",
    description:
      "We build powerful digital products, modern websites, and intelligent automations that help businesses work smarter, serve customers better, and grow faster.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RunA Log Technologies — Technology That Moves Your Business Forward",
    description:
      "We build powerful digital products, modern websites, and intelligent automations that help businesses work smarter, serve customers better, and grow faster.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
