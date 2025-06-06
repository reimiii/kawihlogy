export const jobId = (queue: string, action: string, entityId: string) =>
  `${queue}:${action}:${entityId}`;
