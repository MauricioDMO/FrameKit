import { Fragment, type CSSProperties } from 'react'

import {
  parseInlineMarkdown,
  parseMarkdownBlocks,
} from '@/lib/templates/markdown'

interface MarkdownProps {
  value: string
  lists?: boolean
  className?: string
  style?: CSSProperties
}

function InlineMarkdown({ value }: Pick<MarkdownProps, 'value'>) {
  return parseInlineMarkdown(value).map((token, index) => {
    const key = `${token.type}-${index}`

    if (token.type === 'strong') return <strong key={key} className="font-semibold">{token.value}</strong>
    if (token.type === 'emphasis') return <em key={key}>{token.value}</em>
    if (token.type === 'delete') return <del key={key}>{token.value}</del>

    return <Fragment key={key}>{token.value}</Fragment>
  })
}

export function Markdown({ value, lists = false, className, style }: MarkdownProps) {
  if (!lists) {
    return (
      <span className={className} style={style}>
        <InlineMarkdown value={value} />
      </span>
    )
  }

  const blocks = parseMarkdownBlocks(value)

  return (
    <div className={className} style={style}>
      {blocks.map((block, index) => {
        if (block.type === 'unordered-list') {
          return (
            <ul key={index} className="ml-[1.25em] list-disc">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}><InlineMarkdown value={item} /></li>
              ))}
            </ul>
          )
        }

        if (block.type === 'ordered-list') {
          return (
            <ol key={index} className="ml-[1.25em] list-decimal">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}><InlineMarkdown value={item} /></li>
              ))}
            </ol>
          )
        }

        return (
          <Fragment key={index}>
            <InlineMarkdown value={block.value} />
            {index < blocks.length - 1 && <br />}
          </Fragment>
        )
      })}
    </div>
  )
}
