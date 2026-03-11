import { getPayload } from 'payload'
import config from '@payload-config'

export async function getPayloadClient() {
  return getPayload({ config })
}

export async function getTenantBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getTenantByDomain(domain: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'tenants',
    where: {
      customDomain: { equals: domain },
      domainVerified: { equals: true },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getSiteContent(tenantId: string | number) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'site-content',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    depth: 2, // Populate media relationships
  })
  return result.docs[0] || null
}
