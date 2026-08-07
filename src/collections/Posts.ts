import type { CollectionConfig } from 'payload';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'authors', 'status', 'publishedAt'],
    livePreview: {
      url: ({ data, collectionConfig }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        if (collectionConfig?.slug === 'posts') {
          return `${baseUrl}/blog/${data.slug}`;
        }
        return baseUrl;
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
      label: 'Blog/Article Title',
      type: 'text',
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
        description: 'URL identifier (e.g., hmm-fem-analysis)',
      },
    },
    {
      name: 'authors',
      label: 'Authors',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      label: 'Blog/Article Content',
      type: 'richText',
      required: true,
    },
    {
      name: 'excerpt',
      label: 'Short Summary',
      type: 'textarea',
      admin: {
        description: 'Short description for preview cards and SEO',
      },
    },
    {
      name: 'featuredImage',
      label: 'Banner / Poster Image',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Main image for the post',
      },
    },
    {
      name: 'status',
      label: 'Publishing Status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
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
      name: 'category',
      label: 'Category',
      type: 'text',
      admin: {
        description: 'Category for organizing blogs/articles',
      },
    },
    {
      name: 'tags',
      label: 'Tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'meta',
      label: 'Metadata',
      type: 'group',
      fields: [
        {
          name: 'title',
          label: 'Meta Title',
          type: 'text',
          admin: {
            description: 'Override the page title for SEO',
          },
        },
        {
          name: 'description',
          label: 'Meta Description',
          type: 'textarea',
          admin: {
            description: 'Meta description for SEO',
          },
        },
      ],
    },
  ],
};
