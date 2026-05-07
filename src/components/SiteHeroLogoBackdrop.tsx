import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

/**
 * Home 以外のページ用: ヒーローロゴと同じ画像を背景に固定し、初期は透過寄り。
 * スクロールに応じてわずかに濃くする（読みやすさのため）。
 */
export function SiteHeroLogoBackdrop() {
  const [opacity, setOpacity] = useState(0.14)

  useEffect(() => {
    const onScroll = () => {
      const fadeDistance = Math.max(window.innerHeight * 0.65, 300)
      const progress = Math.min(window.scrollY / fadeDistance, 1)
      setOpacity(0.14 + 0.15 * progress)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <img
      className="siteHeroLogoBackdrop"
      src={logo}
      alt=""
      aria-hidden="true"
      style={{ opacity }}
    />
  )
}
