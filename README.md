# TravelPlanner

旅行の旅程（プラン）を作って、地図とタイムラインで確認・共有できる Web アプリです。

## できること

- 旅行プランの作成・編集（日・時刻・カテゴリ・場所・詳細メモ）
- 地図表示（Leaflet / OpenStreetMap）と地名検索による座標取得
- Firebase Authentication（Google / メール）でログインし、Firestore にプランを保存
- 編集者の招待（メールアドレス指定）による共同編集
- shareId による公開プランの共有リンク

## 技術構成

- React 18 + Vite 5
- react-router-dom（HashRouter）
- Firebase（Auth / Firestore / Analytics）
- Leaflet / react-leaflet

## セットアップ

```bash
npm ci
cp .env.example .env   # Firebase の設定値を入力
npm run dev
```

`.env` に入れる値は Firebase コンソールで取得します。ビルド・デプロイは GitHub Actions（`.github/workflows/deploy.yml`）が GitHub Secrets から同じ値を注入し、GitHub Pages へ公開します。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run preview` | ビルド結果のプレビュー |

## 開発記録

設計と作業の記録は `docs/` に置いています（決まったことと経緯のみを残し、定期的に整理します）。
