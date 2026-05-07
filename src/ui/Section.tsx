import type { ReactNode } from 'react'
import { ChippedText } from './ChippedText'

type Props = {
  eyebrow?: string
  title: string
  children?: ReactNode
}

export function Section({ eyebrow, title, children }: Props) {
  return (
    <section className="section">
      <header className="sectionHeader">
        {eyebrow ? (
          <p className="eyebrow">
            <ChippedText text={eyebrow} />
          </p>
        ) : null}
        <h1 className="h1">
          <ChippedText text={title} />
        </h1>
      </header>
      <div className="sectionBody">{children}</div>
    </section>
  )
}

