import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FreshFacing — A New Website for Your Business. In an Hour.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/css/styles.css" />
      {children}
    </>
  )
}
