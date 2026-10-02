import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://xian-family-trip-2026.ch-zhang21th.chatgpt.site'),
  title: '带着十岁少年读一遍长安｜西安亲子旅行攻略',
  description: '2026年10月23日至28日，西安六天五晚亲子历史文化深度旅行。',
  openGraph: { title:'带着十岁少年读一遍长安', description:'西安亲子历史文化之旅 · 2026.10.23—10.28', images:['/og.png'] },
  twitter: { card:'summary_large_image', title:'带着十岁少年读一遍长安', description:'西安亲子历史文化之旅 · 2026.10.23—10.28', images:['/og.png'] },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) { return <html lang="zh-CN"><body>{children}</body></html>; }
