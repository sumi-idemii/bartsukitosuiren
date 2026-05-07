import { MicrocmsMenuListSection } from '../ui/MicrocmsMenuListSection'

export function DrinkPage() {
  return (
    <MicrocmsMenuListSection
      eyebrow="DRINK"
      title="Drink Menu"
      endpoint="drink"
      emptyMessage="表示できるドリンクメニューがありません。"
      intro={
        <p className="bodyText">
          bar 月と睡蓮はオリジナルカクテルをメインに提供致します。下記のカクテルは参考までに、フルオーダーでご希望をお伝え下さいませ。
        </p>
      }
    />
  )
}
