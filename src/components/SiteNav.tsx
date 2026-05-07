import { NavLink, Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { ChippedText } from '../ui/ChippedText'

const navItems = [
  { to: '/drink', label: 'DRINK' },
  { to: '/food', label: 'FOOD' },
  { to: '/gallery', label: 'GALLERY' },
  { to: '/access', label: 'ACCESS' },
] as const

export function SiteNav() {
  return (
    <nav className="nav" aria-label="メインメニュー">
      <Link to="/" className="brand" aria-label="月と睡蓮 ホーム">
        <img className="brandMark" src={logo} alt="" aria-hidden="true" />
        <span className="brandText">
          <ChippedText text="月と睡蓮" className="brandName" />
          <span className="brandSub">Whisky Bar</span>
        </span>
      </Link>

      <ul className="navList">
        {navItems.map((item) => (
          <li key={item.to} className="navItem">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                ['navLink', isActive ? 'isActive' : ''].join(' ')
              }
            >
              <ChippedText text={item.label} className="navLabel" />
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

