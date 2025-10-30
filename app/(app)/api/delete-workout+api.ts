import { adminClient } from '@/src/lib/sanity/client';

export async function POST(request: Request) {
  const { workoutId }: { workoutId: string } = await request.json();

  try {
    await adminClient.delete(workoutId);
    console.log('Workout deleted successfully:', workoutId);
    return Response.json(
      { success: true, message: 'Workout deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting workout:', error);
    return Response.json({ success: false, error: 'Failed to delete workout' }, { status: 500 });
  }
}
