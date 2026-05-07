import { SectionErrorBoundary } from './SectionErrorBoundary'
import { SiteInformationFooter } from './SiteInformationFooter'

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footerInner">
        <SectionErrorBoundary>
          <SiteInformationFooter />
        </SectionErrorBoundary>
        <p className="fineprint">Bar 月と睡蓮</p>
      </div>
    </footer>
  )
}
