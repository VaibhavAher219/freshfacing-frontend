import { notFound } from 'next/navigation'
import { getTenantBySlug, getSiteContent } from '@/lib/payload'
import { DentalTemplate } from '@/templates/dental-classic'
import type { SiteContentData } from '@/lib/types'
import '@/templates/dental-classic/styles.css'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)

  if (!tenant) notFound()

  const content = await getSiteContent(tenant.id)
  if (!content) notFound()

  // Cast Payload document to our template type
  const siteContent = content as unknown as SiteContentData

  // Always show preview banner on /preview/ routes
  return (
    <DentalTemplate
      content={siteContent}
      isPreview={true}
      slug={slug}
    />
  )
}
