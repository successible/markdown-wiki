import pluralize from 'pluralize'

export const generatePossibleName = (name: string) => {
  return [name, pluralize.plural(name), pluralize.singular(name)]
}
