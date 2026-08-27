import type { Metadata, Viewport } from "next";
import { Geist_Mono, Mrs_Saint_Delafield, Oswald, Special_Elite } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const typewriter = Special_Elite({
  variable: "--font-typewriter",
  subsets: ["latin"],
  weight: "400",
});

const script = Mrs_Saint_Delafield({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARMADA — Military Personnel System",
  description:
    "Sistema de pessoal militar. Acesso restrito — nível de credencial LV4 requerido.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050706",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${oswald.variable} ${typewriter.variable} ${script.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
