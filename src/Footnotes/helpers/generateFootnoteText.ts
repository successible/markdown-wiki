import { v4 as uuid } from 'uuid'

export const generateFootnoteText = () => {
  const replacement = `[^${uuid().replace(/-/g, '').slice(0, 5)}]`
  return replacement
}
