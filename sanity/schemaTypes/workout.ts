import {defineField, defineType, defineArrayMember} from 'sanity'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  icon: () => '💪',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'The unique Clerk user ID that identifies the user who performed this workout.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Workout Date',
      description: 'The date when the workout took place.',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      description: 'The total duration of the workout in seconds.',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      description:
        'List of exercises included in this workout, with multiple sets for each exercise.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'workoutExercise',
          title: 'Workout Exercise',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise Reference',
              description: 'Exercise that was performed during the workout.',
              type: 'reference',
              to: [{type: 'exercise'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description:
                'Each set performed for this exercise, including reps, weight, and unit.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'exerciseSet',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      description: 'Number of repetitions completed for this set.',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(0),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description: 'The amount of weight lifted for this set.',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(0),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description: 'The unit of measurement used for weight (lbs or kg).',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Pounds (lbs)', value: 'lbs'},
                          {title: 'Kilograms (kg)', value: 'kg'},
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'lbs',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare({reps, weight, weightUnit}) {
                      const unit = weightUnit?.toUpperCase() || 'LBS'
                      return {
                        title: `${reps ?? '-'} reps × ${weight ?? '-'} ${unit}`,
                      }
                    },
                  },
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: {
              exerciseName: 'exercise.name',
              exerciseImage: 'exercise.image',
              sets: 'sets',
            },
            prepare({exerciseName, exerciseImage, sets}) {
              const setCount = sets?.length || 0
              return {
                title: exerciseName || 'Unnamed Exercise',
                subtitle: `${setCount} set${setCount !== 1 ? 's' : ''}`,
                media: exerciseImage, // ✅ show exercise image thumbnail
              }
            },
          },
        }),
      ],
    }),
  ],

  preview: {
    select: {
      date: 'date',
      exercises: 'exercises',
      userId: 'userId',
    },
    prepare({date, exercises, userId}) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
      const exerciseCount = exercises?.length || 0
      return {
        title: `Workout (${formattedDate})`,
        subtitle: `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • User: ${userId}`,
      }
    },
  },
})
