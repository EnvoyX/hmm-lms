import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      admin: {
        placeholder: 'John Doe',
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      required: true,
      options: [
        {
          label: 'SUPERADMIN (Full Access)',
          value: 'superadmin',
        },
        {
          label: 'ADMIN (Edit Content)',
          value: 'admin',
        },
      ],
    },
    {
      name: 'prismaId',
      type: 'text',
      label: 'Prisma User ID',
      index: true,
      admin: {
        description: 'Linked User ID from the primary application database.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Picture',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Author Bio',
      admin: {
        description: 'Short bio to display on author pages or article footers.',
      },
    },
  ],
};
