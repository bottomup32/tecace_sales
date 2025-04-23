import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className={`${inter.variable} font-sans`}>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </div>
    </ThemeProvider>
  );
} 