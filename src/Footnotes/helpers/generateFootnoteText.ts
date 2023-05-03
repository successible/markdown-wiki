export const generateFootnoteText = () => {
  const replacement = `[^${Math.random().toString(8).slice(2)}]`
  return replacement
}
