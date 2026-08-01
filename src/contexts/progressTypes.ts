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
  phrase_types: ExerciseProgress;
  reading: ExerciseProgress;
  dialogues: ExerciseProgress;
  word_games: ExerciseProgress;
  connector: ExerciseProgress;
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

export interface RevisionFamily {
  exerciseType: string;
  familyId: string;
  completed: number;
  total: number;
  lastReviewed?: number;
}

export interface ProgressAction {
  type: 'SET_PROGRESS' | 'TRACK_ITEM';
  payload?: ProgressState | TrackItemPayload;
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
  getLevelProgress: (levelId: number, familyIdsByModule?: Record<string, string[]>) => number;
  getRevisionFamilies: (levelId: number) => RevisionFamily[];
  getLastActivity: (levelId: number, exerciseType: string) => { familyId: string; progress: number; lastReviewed: number } | null;
}
