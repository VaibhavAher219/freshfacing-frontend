import { notFound } from 'next/navigation'
import { getTenantBySlug, getSiteContent } from '@/lib/payload'
import { DentalTemplate } from '@/templates/dental-classic'
import type { SiteContentData } from '@/lib/types'
import type { Metadata } from 'next'
import '@/templates/dental-classic/styles.css'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const tenant = await getTenantBySlug(slug)
    if (!tenant) return { title: 'Not Found' }

    const content = await getSiteContent(tenant.id)
    const seo = (content as any)?.seo
    const businessName = (content as any)?.businessInfo?.businessName
    return {
      title: seo?.title || businessName || tenant.name,
      description: seo?.description || `Welcome to ${tenant.name}`,
    }
  } catch (e) {
    console.error('generateMetadata error:', e)
    return { title: 'Error' }
  }
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params
  const tenant = await getTenantBySlug(slug)

  if (!tenant || (tenant.status !== 'active' && tenant.status !== 'preview')) {
    notFound()
  }

  const content = await getSiteContent(tenant.id)
  if (!content) notFound()

  // Cast Payload document to our template type
  const siteContent = content as unknown as SiteContentData

  return (
    <DentalTemplate
      content={siteContent}
      isPreview={tenant.status === 'preview'}
      slug={slug}
    />
  )
}
