// normalize a hashtag
export const normalizeTag = (tag: string) => tag
  ?.toLowerCase()
  .replace(/\W/, '')
