import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'eventDate', 'status', 'updatedAt'],
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        return `${baseUrl}/event/${data.slug}`
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
      label: 'Event Title',
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
        description: 'URL identifier (e.g., hmm-company-visit)',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'eventDate',
          type: 'date',
          label: 'Event Start Date & Time',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'eventEndDate',
          type: 'date',
          label: 'Event End Date & Time',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'text',
          label: 'Event Category',
          required: true,
          defaultValue: 'General',
        },
        {
          name: 'location',
          type: 'text',
          label: 'Location / Venue',
          admin: {
            placeholder: 'e.g., Gedung Labtek II ITB / Zoom Meeting',
          },
        },
      ],
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Short Summary',
      admin: {
        description: 'Brief overview displayed on event cards',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description: 'Add custom keywords or categories for this event',
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
      name: 'content',
      type: 'richText',
      label: 'Full Event Description & Agenda',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Event Banner / Poster',
      admin: {
        position: 'sidebar',
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
      name: 'authors',
      type: 'relationship',
      relationTo: 'users',
      label: 'Organizer / Posted By',
      required: true,
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
