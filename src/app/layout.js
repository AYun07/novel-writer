import './globals.css'

export const metadata = {
  title: 'Integrated Author - AI小说创作平台',
  description: '整合91Writing和Author的AI小说创作工具',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-bg-primary">
        {children}
      </body>
    </html>
  )
}
