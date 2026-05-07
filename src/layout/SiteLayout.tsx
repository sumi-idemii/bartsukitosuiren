import { Outlet, useLocation } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeroLogoBackdrop } from '../components/SiteHeroLogoBackdrop'
import { SiteNav } from '../components/SiteNav'

export function SiteLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="app">
      <a className="skipLink" href="#main">
        本文へスキップ
      </a>
      {!isHome ? <SiteHeroLogoBackdrop /> : null}
      {isHome ? null : (
        <header className="header">
          <div className="container headerInner">
            <SiteNav />
          </div>
        </header>
      )}
      <main id="main" className={['main', isHome ? 'mainHome' : ''].join(' ')}>
        {isHome ? (
          <Outlet />
        ) : (
          <div className="container">
            <Outlet />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

