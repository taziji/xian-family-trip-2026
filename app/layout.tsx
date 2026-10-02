import type { Metadata } from 'next';
import './globals.css';
import { heroTitle, siteTitle, socialSubtitle } from './branding.mjs';
export const metadata: Metadata = {
  metadataBase: new URL('https://xian-family-trip-2026.ch-zhang21th.chatgpt.site'),
  title: siteTitle,
  description: '2026年10月23日至28日，西安六天五晚亲子历史文化深度旅行。',
  openGraph: { title:heroTitle, description:socialSubtitle, images:['/og.png'] },
  twitter: { card:'summary_large_image', title:heroTitle, description:socialSubtitle, images:['/og.png'] },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) { return <html lang="zh-CN"><body>{children}</body></html>; }
