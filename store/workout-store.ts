import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  isCompleted: boolean;
}

interface WorkoutExercise {
  id: string;
  sanityId: string; //store the sanity document id
  name: string;
  sets: WorkoutSet[];
}

interface WorkoutStore {
  workoutExercises: WorkoutExercise[];
  weightUnit: 'lbs' | 'kg';
  // Actions
  addExerciseToWorkout: (exercise: { name: string; sanityId: string }) => void;
  setWorkoutExercises: (
    exercises: WorkoutExercise[] | ((prev: WorkoutExercise[]) => WorkoutExercise[])
  ) => void; // takes either an array or a function that returns an array of WorkoutExercise and updates the state using the previous state
  setWeightUnit: (unit: 'lbs' | 'kg') => void;
  resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      workoutExercises: [],
      weightUnit: 'lbs',
      addExerciseToWorkout: (exercise) => {
        set((state) => {
          const newExercise: WorkoutExercise = {
            id: Math.random().toString(),
            sanityId: exercise.sanityId,
            name: exercise.name,
            sets: [], // start with no sets
          };
          return { workoutExercises: [...state.workoutExercises, newExercise] };
        });
      },
      setWorkoutExercises: (exercises) => {
        set((state) => ({
          workoutExercises:
            typeof exercises === 'function' ? exercises(state.workoutExercises) : exercises,
        }));
      },
      setWeightUnit: (unit) => {
        set({ weightUnit: unit });
      },
      resetWorkout: () => {
        set({ workoutExercises: [] });
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ weightUnit: state.weightUnit }), // only persist weightUnit
    }
  )
);
