import { customAlphabet } from 'nanoid'

export const generateFootnoteText = () => {
  const nanoid = customAlphabet('1234567890abcdef', 10)
  const replacement = `[^${nanoid(6)}]`
  return replacement
}
