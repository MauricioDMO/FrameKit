export type MarkdownInlineToken = {
  type: 'text' | 'strong' | 'emphasis' | 'delete'
  value: string
}

export type MarkdownBlock =
  | { type: 'line'; value: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }

const inlineMarkdown = /(\*\*[^*\n]+?\*\*|~~[^~\n]+?~~|\*[^*\n]+?\*|_[^_\n]+?_)/g
const unorderedList = /^[-*]\s+(.+)$/
const orderedList = /^\d+[.)]\s+(.+)$/

export function parseInlineMarkdown(value: string): MarkdownInlineToken[] {
  return value
    .split(inlineMarkdown)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return { type: 'strong', value: part.slice(2, -2) }
      }

      if (part.startsWith('~~') && part.endsWith('~~')) {
        return { type: 'delete', value: part.slice(2, -2) }
      }

      if (
        (part.startsWith('*') && part.endsWith('*')) ||
        (part.startsWith('_') && part.endsWith('_'))
      ) {
        return { type: 'emphasis', value: part.slice(1, -1) }
      }

      return { type: 'text', value: part }
    })
}

export function parseMarkdownBlocks(value: string): MarkdownBlock[] {
  const lines = value.split(/\r?\n/)
  const blocks: MarkdownBlock[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const match = unorderedList.exec(line) ?? orderedList.exec(line)

    if (!match) {
      blocks.push({ type: 'line', value: line })
      continue
    }

    const type = unorderedList.test(line) ? 'unordered-list' : 'ordered-list'
    const items = [match[1]]

    while (index + 1 < lines.length) {
      const nextMatch = (type === 'unordered-list' ? unorderedList : orderedList).exec(
        lines[index + 1],
      )
      if (!nextMatch) break

      items.push(nextMatch[1])
      index += 1
    }

    blocks.push({ type, items })
  }

  return blocks
}
