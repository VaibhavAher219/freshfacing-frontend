import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Incoming Leads' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'url', 'status', 'auditScore', 'createdAt'],
    group: 'Growth',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: () => true, // Public — lead capture from marketing site
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Their Current Website URL',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'auditScore',
      type: 'number',
      label: 'Audit Score',
      min: 0,
      max: 100,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Site Built', value: 'site_built' },
        { label: 'Preview Sent', value: 'preview_sent' },
        { label: 'Converted', value: 'converted' },
        { label: 'Lost', value: 'lost' },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        description: 'Linked tenant (after conversion)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
