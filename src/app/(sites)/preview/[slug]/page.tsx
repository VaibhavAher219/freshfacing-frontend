import { notFound } from 'next/navigation'
import { getTenantBySlug, getSiteContent } from '@/lib/payload'
import { DentalTemplate } from '@/templates/dental-classic'
import type { SiteContentData } from '@/lib/types'
import '@/templates/dental-classic/styles.css'
import { isDemoSlug } from '@/lib/demo-data'
import { PreviewWrapper } from './PreviewWrapper'
import './preview-banner.css'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params

  // Demo slugs render the iframe-based preview with sample sites
  if (isDemoSlug(slug)) {
    return <PreviewWrapper slug={slug} />
  }

  // Real tenant slugs fetch from database
  const tenant = await getTenantBySlug(slug)
  if (!tenant) notFound()

  const content = await getSiteContent(tenant.id)
  if (!content) notFound()

  const siteContent = content as unknown as SiteContentData

  return (
    <DentalTemplate
      content={siteContent}
      isPreview={true}
      slug={slug}
    />
  )
}
