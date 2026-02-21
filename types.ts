
export enum Tone {
  EDUCATIVA = 'Educativa',
  INSTITUCIONAL = 'Institucional'
}

export interface GenerationResult {
  visualPrompt: string;
  mainText: string;
  cta: string | null;
  caption: string;
}

export interface AppState {
  originalImage: string | null;
  referenceImage: string | null; // Added for style reference
  editedImage: string | null;
  prompt: string;
  tone: Tone;
  strongCTA: boolean;
  isLoading: boolean;
  error: string | null;
  result: GenerationResult | null;
}
