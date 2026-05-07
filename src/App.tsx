import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './layout/SiteLayout'
import { AccessPage } from './pages/AccessPage'
import { ApiBrowserHint } from './pages/ApiBrowserHint'
import { DrinkPage } from './pages/DrinkPage'
import { FoodPage } from './pages/FoodPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <Routes>
      {/* アドレスバーで /api/* を開いたとき * にマッチして / へ飛ぶのを防ぐ */}
      <Route path="/api/*" element={<ApiBrowserHint />} />
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="drink" element={<DrinkPage />} />
        <Route path="food" element={<FoodPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="access" element={<AccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
