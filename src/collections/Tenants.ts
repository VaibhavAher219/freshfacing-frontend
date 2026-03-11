import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'industry'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'client' && user?.tenant) {
        return { id: { equals: typeof user.tenant === 'object' ? user.tenant.id : user.tenant } }
      }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Business Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly name (e.g., "joes-dentistry")',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'preview',
      options: [
        { label: 'Preview', value: 'preview' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Churned', value: 'churned' },
      ],
    },
    {
      name: 'industry',
      type: 'select',
      required: true,
      defaultValue: 'dental',
      options: [
        { label: 'Dental', value: 'dental' },
        { label: 'HVAC', value: 'hvac' },
        { label: 'Auto Repair', value: 'auto' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Legal / Accounting', value: 'legal' },
        { label: 'Flooring', value: 'flooring' },
        { label: 'Tailor / Alterations', value: 'tailor' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'template',
      type: 'text',
      defaultValue: 'dental-classic',
      admin: {
        description: 'Template identifier to use for this site',
      },
    },
    {
      name: 'customDomain',
      type: 'text',
      admin: {
        description: 'Custom domain (e.g., "joesdentistry.com")',
      },
    },
    {
      name: 'domainVerified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'subscriptionPlan',
      type: 'select',
      options: [
        { label: 'Monthly ($20/mo)', value: 'monthly' },
        { label: 'Annual ($199/yr)', value: 'annual' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Active', value: 'active' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
