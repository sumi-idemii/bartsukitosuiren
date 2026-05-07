# Cloudflare Workers + microCMS

フロントは **Cloudflare Workers**（静的アセット + Worker）、コンテンツデータは **[microCMS](https://microcms.io/)** で管理します。API キーは **ブラウザに載せず**、Worker が **microCMS の REST URL と同じ形で fetch 転送**します（`curl https://…microcms.io/api/v1/…` と同等）。

## 前提

- Node.js と npm
- Cloudflare アカウント、`wrangler login` 済み
- microCMS の **サービス ID（ドメイン）** と **API キー**（ダッシュボードで確認）

## 1. 環境変数（必須）

### Worker に渡す値

| 名前 | 種別 | 説明 |
|------|------|------|
| `MICROCMS_SERVICE_DOMAIN` | 非秘匿（`wrangler.jsonc` の `vars` でも可） | **`serviceId`**（例: `bartsukitosuiren`）または **`serviceId.microcms.io`** のどちらでも可。Worker が SDK 向けにサブドメインへ正規化します。 |
| `MICROCMS_API_KEY` | **秘密** | microCMS の API キー。Git に含めない |

### ローカル開発（`.dev.vars`）

リポジトリ直下に `.dev.vars` を作成（`.gitignore` 済み）:

```bash
MICROCMS_API_KEY=あなたのAPIキー
MICROCMS_SERVICE_DOMAIN=xxxx.microcms.io
```

`wrangler.jsonc` の `vars.MICROCMS_SERVICE_DOMAIN` が空のときは `.dev.vars` の値が使われます。

### 本番（Wrangler）

```bash
npx wrangler secret put MICROCMS_API_KEY
```

`MICROCMS_SERVICE_DOMAIN` はダッシュボードの Workers 設定「Variables」で設定するか、`wrangler.jsonc` の `vars` に直接書いても構いません（公開情報に近いため）。

## 2. 開発・ビルド・デプロイ

```bash
npm run dev        # 通常の Vite（HMR）。/api が HTML になる場合は下記も試す
npm run dev:full   # ビルド後に wrangler dev。Worker と SPA が同一オリジンで動く（API 確認向け）
npm run build
npm run preview   # Workers ランタイムに近い動作
npm run deploy
```

**開発で `/api` が効かないとき:** `localhost:5173` だけでは Vite が `index.html` を返すことがあります。対処は (1) `vite.config.ts` で `cloudflare()` を **react() より前**にしていることを確認する (2) **`npm run dev:full`** で表示された URL（例: `http://127.0.0.1:8787`）を開く (3) 別ターミナルで Worker を動かし、`.env` に `VITE_API_BASE_URL` を書く、のいずれか。

## 3. Worker が公開する API（microCMS と同じパス構造）

| メソッド | パス | microCMS 側の実 URL |
|---------|------|---------------------|
| GET | `/api/health` | 稼働確認（Worker のみ） |
| GET | `/api/cms/drink` | `https://{サービスID}.microcms.io/api/v1/drink` と同等 |

クエリはそのまま転送します（`kind` だけ Worker 用で除去）。詳細取得は `/api/cms/{endpoint}/{contentId}` → `/api/v1/{endpoint}/{contentId}`。

**フロントと Worker が別ドメイン**（例: Pages と `*.workers.dev`）のときは、ビルド時に **`VITE_API_BASE_URL`** に Worker のオリジン（`https://xxxx.workers.dev`）を指定してください。さもないとブラウザの `fetch('/api/…')` はページ側のホストに飛び、404 になります。

例: エンドポイント `news` の一覧は `GET /api/cms/news`。フロントでは `src/lib/microcms.ts` の `fetchMicrocmsList` / `fetchMicrocmsObject` を利用してください。

## 4. コンテンツの編集

記事・文言の追加・更新は **microCMS の管理画面** で行います（別途 Cloudflare 上の管理 Worker は不要）。

## 5. セキュリティ

- **API キーをチャットや PR に貼らない。** 漏れたキーは microCMS ダッシュボードで再発行する。
- フロントの `VITE_*` に API キーを置かない（ビルドに埋め込まれる）。

## トラブルシュート

- **`Unexpected token '<'` / JSON が HTML になる:** ブラウザが `/api/...` に対して **JSON ではなく index.html** を受け取っている状態です。
  - **開発:** `npm run dev` で **@cloudflare/vite-plugin** が有効か確認する（`vite.config.ts` に `cloudflare()` があること）。それでも届かない場合は、`.env` に **`VITE_API_BASE_URL=http://127.0.0.1:8787`** のように Worker が動いているオリジンを書くか、別ターミナルで Worker を起動したうえで **`VITE_DEV_PROXY_TARGET=http://127.0.0.1:8787`** を設定して Vite が `/api` をプロキシする（`.env.example` 参照）。
  - **本番:** 静的ファイルだけ別ホストにデプロイしており **Workers が URL に結びついていない**ときも同様になる。`npm run deploy` で Worker とアセットを一体デプロイするか、フロントの **`VITE_API_BASE_URL`** に Worker の HTTPS のオリジンを指定してビルドし直す。
- **503 / not configured:** `.dev.vars` または本番の Secret / Vars が未設定。
- **microCMS 401:** API キー誤り、または参照権限のないキーを使用。
- **404（Drink 等）:** microCMS の **コンテンツ API の API ID**（URL のパス）がコードの `drink` と一致しているか確認する。ダッシュボードの API 設定で「リスト形式」であること、`getList` で取れるエンドポイントであること。名前が `drinks` など別ならフロントの `fetchMicrocmsList('drinks')` に合わせる。**オブジェクト形式**の API だけの場合は Worker で `?kind=object` が必要（フロントは `fetchMicrocmsSingleton`）。
- **SPA でルート 404:** `assets.not_found_handling` が `single-page-application` か確認（本リポジトリでは設定済み）。
