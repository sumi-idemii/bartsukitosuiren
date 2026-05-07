import { MicrocmsMenuListSection } from '../ui/MicrocmsMenuListSection'

export function FoodPage() {
  return (
    <MicrocmsMenuListSection
      eyebrow="FOOD"
      title="Food Menu"
      endpoint="food"
      emptyMessage="表示できるフードメニューがありません。"
      intro={
        <p className="bodyText">
          おつまみや軽食のメニューです。内容は仕入れ状況により変更する場合がございます。
        </p>
      }
    />
  )
}
