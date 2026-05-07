import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'
import { ChippedText } from '../ui/ChippedText'

export function HomePage() {
  return (
    <div className="homePage">
      <section className="homeHero" aria-label="月と睡蓮 ファーストビュー">
        <div className="homeHeroMain">
          <div className="homeHeroLogoContainer">
            <img className="homeHeroLogo" src={logo} alt="" aria-hidden="true" />
            <h1 className="homeHeroSiteTitle chippedText">
              <span className="chippedWhole" data-text="月と睡蓮" aria-hidden="true">
                月と睡蓮
              </span>
              <span className="srOnly">月と睡蓮</span>
            </h1>
          </div>
        </div>
        <nav className="homeHeroMenu" aria-label="トップメニュー">
          <ul className="homeHeroMenuList">
            <li>
              <Link className="homeHeroMenuLink" to="/drink">
                <ChippedText text="DRINK" />
              </Link>
            </li>
            <li>
              <Link className="homeHeroMenuLink" to="/food">
                <ChippedText text="FOOD" />
              </Link>
            </li>
            <li>
              <Link className="homeHeroMenuLink" to="/gallery">
                <ChippedText text="GALLERY" />
              </Link>
            </li>
            <li>
              <Link className="homeHeroMenuLink" to="/access">
                <ChippedText text="ACCESS" />
              </Link>
            </li>
          </ul>
        </nav>
      </section>
    </div>
  )
}
