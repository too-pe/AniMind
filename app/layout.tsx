import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AniMind - AI智能动漫搜索',
  description: '想看啥番，一搜便知道',
  icons: {
    icon: '/pixel-cat.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
