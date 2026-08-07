import type { CollectionConfig } from 'payload'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'competitionName', 'awardLevel', 'achievementDate', "status"],
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        return `${baseUrl}/achievements/${data.slug}`
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
      label: 'Achievement Title',
      required: true,
      admin: {
        placeholder: 'e.g., 1st Place at Indonesian Rocket Competition 2026',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL identifier (e.g., hmm-wins-hackaton)',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description: 'Add custom keywords or categories for this achievements',
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
      type: 'row',
      fields: [
        {
          name: 'competitionName',
          type: 'text',
          label: 'Competition / Contest Name',
          required: true,
          admin: {
            placeholder: 'e.g., Shell Eco-marathon / KMHE / KTI Nasional',
          },
        },
        {
          name: 'awardLevel',
          type: 'select',
          label: 'Award Level',
          required: true,
          options: [
            { label: '1st Place (Juara 1)', value: 'juara_1' },
            { label: '2nd Place (Juara 2)', value: 'juara_2' },
            { label: '3rd Place (Juara 3)', value: 'juara_3' },
            { label: 'Honorable Mention', value: 'honorable_mention' },
            { label: 'Finalist', value: 'finalist' },
            { label: 'Special Award', value: 'special_award' },
            { label: 'Other', value: 'otherAwardLevel' },
          ],
        },
        {
          name: 'customAwardLevel',
          type: 'text',
          label: 'Specify Award Level',
          admin: {
            condition: (data) => data?.awardLevel === 'otherAwardLevel',
          },
        },
      ],
    },
    {
      name: 'achievementDate',
      type: 'date',
      label: 'Date Awarded',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'teamMembers',
      type: 'array',
      label: 'Team Members & NIMs',
      admin: {
        description: 'List students who won the award',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'memberName',
              type: 'text',
              label: 'Student Name',
              required: true,
            },
            {
              name: 'nim',
              type: 'text',
              label: 'NIM',
              admin: {
                placeholder: '13123000',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Full Story & Project Description',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Trophy / Team Photo',
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
      defaultValue: 'published',
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
