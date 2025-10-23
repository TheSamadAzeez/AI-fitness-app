import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  icon: () => '🏋️',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'The name of the exercise, for example: “Push Ups” or “Squats”.',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description:
        'A brief overview of the exercise, including what muscles it targets and how to perform it safely.',
      type: 'text',
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      description: 'Select the difficulty level that best represents this exercise.',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'An image showing the proper form or posture for this exercise.',
      type: 'image',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          description: 'Describe what is happening in the image for accessibility and SEO.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description:
        'A link to a demonstration video that shows how to properly perform the exercise.',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active?',
      description: 'Toggle this on to make the exercise visible and available in the platform.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      subtitle: 'difficulty',
    },
  },
})
