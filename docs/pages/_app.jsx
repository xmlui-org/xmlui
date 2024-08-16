import "../styles/global.scss";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  style: ["normal"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function App({ Component, pageProps }) {
  return (
    <main style={{fontFamily: inter.style.fontFamily}}>
      <Component {...pageProps} />
    </main>
  );
}
