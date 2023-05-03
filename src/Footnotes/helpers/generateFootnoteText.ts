export const generateFootnoteText = () => {
  const replacement = `[^${Math.random().toString(18).slice(11)}]`
  return replacement
}
