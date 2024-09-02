import "../styles/global.scss";
import { Inter } from "next/font/google";
import localFont from 'next/font/local'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  style: ["normal"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const myInter = localFont({
    src: [
      {
        path: './fonts/Inter-Thin.woff2',
        weight: '100',
        style: 'normal',
      },
      {
        path: './fonts/Inter-ThinItalic.woff2',
        weight: '100',
        style: 'italic',
      },
      {
        path: './fonts/Inter-ExtraLight.woff2',
        weight: '200',
        style: 'normal',
      },
      {
        path: './fonts/Inter-ExtraLightItalic.woff2',
        weight: '200',
        style: 'italic',
      },
      {
        path: './fonts/Inter-Light.woff2',
        weight: '300',
        style: 'normal',
      },
      {
        path: './fonts/Inter-LightItalic.woff2',
        weight: '300',
        style: 'italic',
      },
      {
        path: './fonts/Inter-Regular.woff2',
        weight: '400',
        style: 'normal',
      },
      {
        path: './fonts/Inter-Italic.woff2',
        weight: '400',
        style: 'italic',
      },
      {
        path: './fonts/Inter-Medium.woff2',
        weight: '500',
        style: 'normal',
      },
      {
        path: './fonts/Inter-MediumItalic.woff2',
        weight: '500',
        style: 'italic',
      },
      {
        path: './fonts/Inter-SemiBold.woff2',
        weight: '600',
        style: 'normal',
      },
      {
        path: './fonts/Inter-SemiBoldItalic.woff2',
        weight: '600',
        style: 'italic',
      },
      {
        path: './fonts/Inter-Bold.woff2',
        weight: '700',
        style: 'normal',
      },
      {
        path: './fonts/Inter-BoldItalic.woff2',
        weight: '700',
        style: 'italic',
      },
      {
        path: './fonts/Inter-ExtraBold.woff2',
        weight: '800',
        style: 'normal',
      },
      {
        path: './fonts/Inter-ExtraBoldItalic.woff2',
        weight: '800',
        style: 'italic',
      },
      {
        path: './fonts/Inter-Black.woff2',
        weight: '900',
        style: 'normal',
      },
      {
        path: './fonts/Inter-BlackItalic.woff2',
        weight: '900',
        style: 'italic',
      },
    ],
  })

export default function App({ Component, pageProps }) {
  return (
    <main className={myInter.className}>
      <Component {...pageProps} />
    </main>
  );
}
