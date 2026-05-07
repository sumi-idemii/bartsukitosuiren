type Props = {
  text: string
  className?: string
  /**
   * `whole`: 画像の中心を文字列の中心に合わせたい用途向け
   * `chars`: 文字ごとにテクスチャ位置を変えたい用途向け（旧挙動）
   */
  mode?: 'whole' | 'chars'
}

export function ChippedText({ text, className, mode = 'whole' }: Props) {
  if (mode === 'whole') {
    return (
      <span className={['chippedText', className ?? ''].join(' ').trim()}>
        <span className="chippedWhole" data-text={text} aria-hidden="true">
          {text}
        </span>
        <span className="srOnly">{text}</span>
      </span>
    )
  }

  return (
    <span className={['chippedText', className ?? ''].join(' ').trim()}>
      {Array.from(text).map((ch, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={`${ch}-${i}`}
          className="chippedChar"
          data-ch={ch === ' ' ? '\u00A0' : ch}
          aria-hidden="true"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
      <span className="srOnly">{text}</span>
    </span>
  )
}

