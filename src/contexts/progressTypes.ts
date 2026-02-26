/**
 * Types partagés pour ProgressContext
 */

export interface FamilyProgress {
  completed: number;
  total: number;
  lastReviewed?: number;
}

export interface ExerciseProgress {
  [familyId: string]: FamilyProgress;
}

export interface LevelProgress {
  vocab: ExerciseProgress;
  grammar: ExerciseProgress;
  phrase_types: ExerciseProgress;
  reading: ExerciseProgress;
  dialogues: ExerciseProgress;
  word_games: ExerciseProgress;
  connector: ExerciseProgress;
  fastvocab: ExerciseProgress;
  [key: string]: ExerciseProgress;
}

export interface ProgressState {
  [key: string]: LevelProgress;
}

export interface TrackItemPayload {
  levelId: number;
  exerciseType: string;
  familyId: string;
  itemIndex: number;
  totalItems: number;
}

export interface ProgressAction {
  type: 'SET_PROGRESS' | 'TRACK_ITEM';
  payload?: any;
}

export interface ProgressContextValue {
  progress: ProgressState | null;
  isLoading: boolean;
  trackItemCompletion: (levelId: number, exerciseType: string, familyId: string, itemIndex: number, totalItems: number) => void;
  saveProgressNow: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  resetProgress: () => Promise<void>;
  getFamilyProgress: (levelId: number, exerciseType: string, familyId: string) => number;
  getExerciseProgress: (levelId: number, exerciseType: string, allFamilyIds?: string[] | null) => number;
  getLevelProgress: (levelId: number) => number;
  getRevisionFamilies: (levelId: number) => any[];
  getLastActivity: (levelId: number, exerciseType: string) => { familyId: string; progress: number; lastReviewed: number } | null;
  getRecommendedModule: (levelId: number) => { exerciseType: string; progress: number; lastReviewed: number } | null;
}
