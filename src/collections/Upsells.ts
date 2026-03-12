import type { CollectionConfig } from 'payload'

export const Upsells: CollectionConfig = {
  slug: 'upsells',
  labels: { singular: 'Add-On', plural: 'Add-Ons' },
  admin: {
    defaultColumns: ['tenant', 'service', 'status', 'price'],
    group: 'Growth',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'client' && user?.tenant) {
        return { tenant: { equals: typeof user.tenant === 'object' ? user.tenant.id : user.tenant } }
      }
      return false
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'service',
      type: 'select',
      required: true,
      options: [
        { label: 'SEO Starter Package', value: 'seo_package' },
        { label: 'Google Business Profile Setup', value: 'google_business' },
        { label: 'Monthly Blog Posts (4/mo)', value: 'monthly_blog' },
        { label: 'Custom Logo Design', value: 'logo_design' },
        { label: 'Social Media Profile Setup', value: 'social_media' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'offered',
      options: [
        { label: 'Offered', value: 'offered' },
        { label: 'Purchased', value: 'purchased' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      label: 'Price ($)',
    },
    {
      name: 'stripeProductId',
      type: 'text',
      admin: { readOnly: true },
    },
  ],
}
