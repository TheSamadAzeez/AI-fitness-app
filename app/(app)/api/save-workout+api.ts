import { adminClient } from '@/src/lib/sanity/client';

export interface WorkoutData {
  _type: 'workout';
  userId: string;
  date: string;
  duration: number;
  exercises: {
    _type: string;
    _key: string;
    exercise: {
      _type: string;
      _ref: string;
    };
    sets: {
      _type: string;
      _key: string;
      weight: number;
      reps: number;
      weightUnit: 'lbs' | 'kg';
    }[];
  }[];
}

export async function POST(request: Request) {
  const { workoutData }: { workoutData: WorkoutData } = await request.json();
  try {
    // save to Sanity using admin client
    const result = await adminClient.create(workoutData);

    console.log('Workout saved to Sanity successfully:', result);

    return Response.json(
      { success: true, message: 'Workout saved successfully', workoutId: result._id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving workout to Sanity:', error);
    return Response.json({ success: false, message: 'Error saving workout' }, { status: 500 });
  }
}
