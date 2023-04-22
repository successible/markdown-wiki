export const generateFootnoteText = () => {
  const replacement = `[^${Math.random().toString(18).slice(2)}]`
  return replacement
}
