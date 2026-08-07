import type { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', 'status'],
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        return `${baseUrl}/news/${data.slug}`
      },
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
        return true;
      }
      return false;
    },
    update: ({ req }) => {
      if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
        return true;
      }
      return false;
    },
    delete: ({ req }) => {
      if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
        return true;
      }
      return false;
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'News Title',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL identifier (e.g., hmm-goes-to-ugm)',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description: 'Add custom keywords or categories for this news',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          label: 'Tag Name',
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Executive Summary',
      required: true,
      admin: {
        description: 'Short snippet used for social previews and card teasers',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Full Article Body',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'users',
      label: 'Authors',
      required: true,
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published Date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Publishing Status',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
