import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Theme Park Planner',
  description: 'Plan your perfect theme park visit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}