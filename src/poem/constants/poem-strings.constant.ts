export const PoemStrings = {
  POEM_QUEUE: 'poetry',
  JOBS: {
    TEXT: 'text',
    AUDIO: 'audio',
  },
} as const;

export type PoemQueueType = typeof PoemStrings.POEM_QUEUE;
export type PoemJobName =
  (typeof PoemStrings.JOBS)[keyof typeof PoemStrings.JOBS];
