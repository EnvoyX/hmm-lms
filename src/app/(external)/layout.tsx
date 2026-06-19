import { Inter, Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import "~/styles/external.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export default function ExternalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${montserrat.variable} hmm-external min-h-screen scroll-smooth`}
    >
      {children}
    </div>
  );
}
