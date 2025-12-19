
export enum ConversionStatus {
  IDLE = 'IDLE',
  READING = 'READING',
  AI_PROCESSING = 'AI_PROCESSING',
  GENERATING_WORD = 'GENERATING_WORD',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ConversionStep {
  status: ConversionStatus;
  message: string;
  progress: number;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}
