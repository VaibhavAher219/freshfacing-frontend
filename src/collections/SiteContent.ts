import type { CollectionConfig } from 'payload'

export const SiteContent: CollectionConfig = {
  slug: 'site-content',
  labels: { singular: 'Website Content', plural: 'Website Content' },
  admin: {
    defaultColumns: ['tenant'],
    group: 'Businesses',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.role === 'client' && user?.tenant) {
        return { tenant: { equals: typeof user.tenant === 'object' ? user.tenant.id : user.tenant } }
      }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // --- Tenant Relationship ---
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      unique: true,
      index: true,
    },

    // --- Business Info ---
    {
      name: 'businessInfo',
      type: 'group',
      label: 'Business Information',
      fields: [
        {
          name: 'businessName',
          type: 'text',
          required: true,
          label: 'Business Name',
        },
        {
          name: 'tagline',
          type: 'text',
          label: 'Tagline / Slogan',
          admin: {
            description: 'A short catchy phrase (e.g., "Your smile is our passion")',
          },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Street Address',
        },
      ],
    },

    // --- Hours ---
    {
      name: 'hours',
      type: 'array',
      label: 'Business Hours',
      maxRows: 7,
      fields: [
        {
          name: 'day',
          type: 'select',
          required: true,
          options: [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
          ],
        },
        {
          name: 'open',
          type: 'text',
          label: 'Opens',
          admin: { description: 'e.g., "9:00 AM"' },
        },
        {
          name: 'close',
          type: 'text',
          label: 'Closes',
          admin: { description: 'e.g., "5:00 PM"' },
        },
        {
          name: 'closed',
          type: 'checkbox',
          label: 'Closed this day',
          defaultValue: false,
        },
      ],
    },

    // --- Services ---
    {
      name: 'services',
      type: 'array',
      label: 'Services Offered',
      maxRows: 12,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Service Name',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Short Description',
          maxLength: 200,
        },
      ],
    },

    // --- About ---
    {
      name: 'aboutText',
      type: 'richText',
      label: 'About Your Business',
    },

    // --- Hero Section ---
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'headline',
          type: 'text',
          label: 'Main Headline',
          defaultValue: 'Welcome to Our Practice',
        },
        {
          name: 'subtext',
          type: 'textarea',
          label: 'Subtext',
        },
        {
          name: 'ctaText',
          type: 'text',
          label: 'Call-to-Action Button Text',
          defaultValue: 'Book an Appointment',
        },
        {
          name: 'ctaLink',
          type: 'text',
          label: 'Call-to-Action Link',
          defaultValue: '#contact',
        },
      ],
    },

    // --- Images ---
    {
      name: 'images',
      type: 'group',
      label: 'Photos',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Business Logo',
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero / Banner Image',
        },
        {
          name: 'gallery',
          type: 'array',
          label: 'Photo Gallery',
          maxRows: 12,
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'caption',
              type: 'text',
            },
          ],
        },
      ],
    },

    // --- Social Links ---
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
        { name: 'yelp', type: 'text', label: 'Yelp URL' },
        { name: 'google', type: 'text', label: 'Google Business URL' },
      ],
    },

    // --- SEO ---
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      admin: {
        description: 'Search engine optimization — these help your site appear in Google results',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Page Title',
          admin: { description: 'Shows in the browser tab and Google results' },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
          maxLength: 160,
          admin: { description: 'Shows under your site title in Google results (max 160 chars)' },
        },
      ],
    },

    // --- Theme ---
    {
      name: 'theme',
      type: 'group',
      label: 'Colors',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Primary Color',
          defaultValue: '#5c7a5c',
          admin: { description: 'Hex color code (e.g., #5c7a5c)' },
        },
        {
          name: 'accentColor',
          type: 'text',
          label: 'Accent Color',
          defaultValue: '#e8a830',
        },
      ],
    },
  ],
}
