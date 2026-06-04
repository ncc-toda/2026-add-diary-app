# 日記アプリ 仕様書

## 1. プロジェクト概要

React Native (Expo) と Firebase を題材にした、AI 駆動開発ハンズオン用の日記アプリ。
ハンズオン受講者が「最低限の機能を一通り備えた現実的なアプリ」を AI エージェントと協働で完成させることを通じて、フロントエンド (Expo Router / TypeScript) とバックエンド (Firestore / Cloud Storage) の連携を体得することを目的とする。

本仕様書は、本リポジトリにある簡易ベース実装（メモリ上の Context、ホーム画面と新規作成画面のみ）を出発点として、外部サーバ連携と必須画面群を備えた完成形を定義する。

### 1.1 目的

- AI 駆動開発の体験を、見栄え・触り心地のあるプロダクトを作りながら学ぶ。
- React Native + Expo + Firebase という、現代的かつ実務で頻出のスタックに触れる。
- 「仕様書 → 実装 → テスト → 動作確認」というサイクルを、AI エージェントと一緒に回す。

### 1.2 想定ユーザー / 利用形態

- **シングルユーザー**前提。一人の利用者が、自分の端末で自分の日記だけを読み書きする。
- 認証は導入しない。同一の Firebase プロジェクトに対して、複数端末から接続するとデータは共有される（ハンズオン教材として割り切る）。
- 想定プラットフォーム: **iOS / Android（Expo Go で実機検証）**。Web はベストエフォート（動けば良いが、必須サポートではない）。

---

## 2. 機能仕様

### 2.1 画面構成

| ルート (Expo Router) | 画面名 | 役割 |
| --- | --- | --- |
| `/` | ホーム（一覧 + 検索） | 日記一覧 + 上部に検索バー。無限スクロールで過去エントリを順次読み込む。 |
| `/new` | 新規作成 | アイコン / タイトル / 本文 / 日付 / 画像 を入力して保存。 |
| `/[id]` | 詳細 | 1 件の日記の全体表示。編集・削除への動線を持つ。 |
| `/[id]/edit` | 編集 | 既存エントリの上書き編集。新規作成と同じフォーム部品を再利用。 |

> memo.md に従い、検索専用画面は作らず、ホーム画面に検索 UI を内包する。

### 2.2 ホーム（日記一覧 + 検索）

- 上部に固定の検索バー。下に日記カードのリスト。
- リストは **無限スクロール**（`FlatList` の `onEndReached` + Firestore カーソルページネーション）。
  - 1 ページあたり 20 件。
  - ソート順: `date desc, createdAt desc`（同じ日付内では新しく作成されたものが上）。
- 各カードに表示する項目: アイコン / 日付（曜日 + 日） / タイトル / 本文の冒頭 2 行 / 画像があればサムネ。
- 右下に「新規作成」FAB（既存実装の `＋` ボタンを踏襲）。
- カードタップで詳細画面 (`/[id]`) へ遷移。

#### 検索

- 検索バーに入力中、リストを **タイトル + 本文の部分一致**（大文字小文字無視・全角半角は素のまま）で絞り込む。
- 検索対象は「現在クライアント側に読み込み済みのエントリ」。日記件数が多くなった場合の全文検索は将来課題（§7）。
- 空入力時は通常の一覧表示に戻る。

### 2.3 新規作成 / 編集

入力フォームは新規作成と編集で共通コンポーネント化する。

| 項目 | 型 | 必須 | 入力方式 |
| --- | --- | --- | --- |
| アイコン | `string`（絵文字 1 文字） | ✅ | プリセット絵文字グリッドから 1 つ選択 |
| タイトル | `string` | ✅ | 1 行テキスト入力（最大 60 文字） |
| 本文 | `string` | ✅ | 複数行テキスト入力（上限なし、目安 5,000 文字） |
| 日付 | `Date` | ✅ | DatePicker（デフォルト = 今日、過去・未来とも選択可、同日複数エントリ OK） |
| 画像 | `string`（URL） | 任意 | 端末ライブラリから 1 枚選択 → クライアントでリサイズ → Storage アップロード |

- アイコンのプリセットは 16〜24 個程度（例: ☀️ ☁️ 🌧 ❄️ 😀 😴 😢 ☕️ 🍜 🍣 📚 ✏️ 🎵 🏃 ✈️ 🐱 …）。
- 「保存」ボタンは、必須項目のいずれかが未入力の間は無効化（disabled）する。
- 編集画面は既存エントリの値で初期化し、保存時は同じドキュメントを上書き。
- 画像欄 UI: 未設定時「タップして写真を追加」プレースホルダ → 設定後はサムネ + ✕ ボタンで取り消し。

### 2.4 詳細

- アイコン / 日付（年月日 + 曜日） / タイトル / 本文（全文） / 画像（あれば大きく表示） を表示。
- ヘッダ右に「編集」ボタン → `/[id]/edit` へ。
- ヘッダ右に「…」メニュー → **削除**（確認ダイアログを経て、Firestore ドキュメント + 紐づく Storage 画像を削除）。

> 削除機能は memo.md の必須要件には含まれていないが、編集はあって削除がないのは UX 上不自然なため、詳細画面に追加する。

### 2.5 状態 / フィードバック

- **ローディング**: 初期取得時はリスト位置にスピナー、追加読み込み時はリスト末尾にスピナー。
- **空状態**: 一件もエントリがない場合は「最初の日記を書いてみよう」のメッセージと中央 CTA。
- **エラー**: 通信失敗時は `Alert.alert` で簡素に通知し、再試行可能にする（一覧は pull-to-refresh で再試行）。
- **オフライン**: Firebase JS SDK の組み込みオフライン永続化を有効にし、明示的なオフライン UI は持たない。

---

## 3. データモデル

### 3.1 Firestore

コレクションは単一 (`entries`)。

```
entries/{entryId}
  icon: string            // 絵文字 1 文字
  title: string           // 1〜60 文字
  body: string            // 1 文字以上
  date: Timestamp         // ユーザーが選択した「その日記の日付」
  images: string[]        // 公開ダウンロード URL の配列。現状は length 0 または 1
  createdAt: Timestamp    // serverTimestamp() で自動付与
  updatedAt: Timestamp    // 保存のたびに serverTimestamp() を上書き
```

- ソート用の複合インデックス: `(date DESC, createdAt DESC)`。
- `images` は **将来 B 案（複数枚）への拡張を見越して、最初から配列型で持つ**。現時点では length 0 か 1 のみ許容。
- `entryId` は Firestore の auto-id を採用。

### 3.2 Cloud Storage

```
entries/{entryId}/{imageId}.jpg
```

- クライアント側で長辺 1600px / JPEG quality 0.8 にリサイズしてからアップロード。
- ドキュメント削除時は同パス配下の画像も削除する。

### 3.3 セキュリティルール

ハンズオン期間中は学習を妨げないよう、開発用に開放する。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read, write: if true;
    }
  }
}
```

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /entries/{entryId}/{file=**} {
      allow read, write: if true;
    }
  }
}
```

> 本番運用や公開配布する際は、最低限「ユーザー認証 + UID 単位の読み書き制限」が必要。これは将来課題 (§7) として扱う。

---

## 4. 技術スタック

### 4.1 既に採用済み（変更しない）

- **Expo SDK 54**（Expo Go で動く最新版 — 本リポジトリの `AGENTS.md` 指定）
- **Expo Router 6** によるファイルベースルーティング
- **React Native 0.81 / React 19**
- **TypeScript 5.9（strict）**
- **pnpm**（パッケージマネージャ）
- **Jest + jest-expo + @testing-library/react-native**（テスト）
- **ESLint + eslint-config-expo**（lint）
- **Nix flake + direnv**（環境固定）

### 4.2 追加で導入する

| ライブラリ | 用途 |
| --- | --- |
| `firebase` (JS SDK v10+) | Firestore / Cloud Storage / Auth クライアント。Expo Go 互換のため `@react-native-firebase/*` ではなく **JS SDK** を採用。 |
| `@tanstack/react-query` | サーバ状態のキャッシュ / 無限スクロール (`useInfiniteQuery`) / 楽観更新 |
| `expo-image-picker` | 端末ライブラリからの画像選択 |
| `expo-image-manipulator` | アップロード前のリサイズ / 圧縮 |
| `expo-image` | 一覧 / 詳細での画像表示（キャッシュ付き） |
| `@react-native-community/datetimepicker` | 日付選択 UI |

> 既存の `src/store/entries.tsx`（メモリ上の Context）は、Firestore + React Query への移行に伴い削除する（このリポジトリでは「不要になった旧コードは積極的に削除する」方針）。

### 4.3 Firebase プロジェクト構成

- Firebase コンソール上に 1 プロジェクトを作成。
- 有効化するサービス: **Cloud Firestore**, **Cloud Storage**。Authentication は使わない。
- Firebase の Web アプリ設定（`apiKey` 等）を `.env` 経由で `EXPO_PUBLIC_FIREBASE_*` として注入。`.env` は `.gitignore` 済みであることを前提とし、`.env.example` をコミットする。

---

## 5. ディレクトリ構成（目標）

```
src/
  app/                       # Expo Router ルート
    _layout.tsx
    index.tsx                # ホーム（一覧 + 検索）
    new.tsx                  # 新規作成
    [id]/
      index.tsx              # 詳細
      edit.tsx               # 編集
  components/                # 画面横断の UI 部品
    EntryCard.tsx
    EntryForm.tsx            # 新規作成 / 編集で共通利用
    IconPicker.tsx
    DateField.tsx
    ImagePickerField.tsx
    SearchBar.tsx
    LoadingView.tsx
    EmptyState.tsx
  hooks/                     # React Query フック
    useEntriesInfinite.ts
    useEntry.ts
    useCreateEntry.ts
    useUpdateEntry.ts
    useDeleteEntry.ts
  lib/
    firebase.ts              # Firebase 初期化（app / db / storage の export）
    image.ts                 # 画像のリサイズ・アップロード・削除
    icons.ts                 # プリセット絵文字リスト
  theme/
    tokens.ts                # カラー / タイポグラフィの共通トークン
```

---

## 6. UI / UX 方針

- **最低限の操作で目的を達成できる**ことを最優先する。タップ数とフォーム入力箇所を増やさない。
- **Apple ライク**な見た目: 角丸 14〜16px、余白を多めに、薄い影、システムフォント、控えめなアクセントカラー。
- **落ち着いたトーン + 親しみのあるテイスト**: 既存実装のパレットを継続採用する。
  - `PAPER #FAF6EE` / `INK #2B2A28` / `SUB #8A8278` / `ACCENT #8B5E3C` / `CARD #FFFFFF`
- 言語は **日本語のみ**（国際化は将来課題）。
- アクセシビリティは最低限：主要なボタン・入力に `accessibilityLabel` を付ける。

---

## 7. 将来の拡張（スコープ外）

- **画像の複数枚化** — `images: string[]` のままスキーマ互換で、UI とアップロード処理を増強。
- **認証の導入** — Firebase Anonymous Auth → メール / Google ログイン。`users/{uid}/entries` 構造への移行。
- **全文検索** — Algolia や Cloud Functions + Firestore で検索インデックスを構築。
- **カレンダー表示** — 月ビュー、日付ジャンプ。
- **タグ / 気分の集計** — アイコン別の出現数や、月別の振り返り。
- **ダークモード** — システム設定に追従。
- **リマインダー通知**、**エクスポート / バックアップ**、**多言語化**。

---

## 8. 開発方針

- AI 駆動開発を前提とする。Cursor + opencode (Anthropic API) を主とし、エージェントに `docs/spec.md` を参照させながら段階的に実装する。
- 小さい単位で動かしながら進める：
  1. Firebase プロジェクト設定 + `.env`
  2. `lib/firebase.ts` の初期化
  3. React Query セットアップ + ホーム画面の Firestore 接続（一覧のみ）
  4. 新規作成画面の Firestore 書き込み
  5. 詳細 / 編集 / 削除
  6. 無限スクロール
  7. 検索バー
  8. 画像（picker → manipulator → Storage → 表示）
  9. 仕上げ（空状態 / ローディング / エラー / アクセシビリティ）
- 既存の簡易実装（`src/store/entries.tsx` の Context、シードデータ等）は、Firestore 接続に置き換わった時点で削除する。中途半端な共存を残さない。
- TypeScript は strict を維持。`any` は基本禁止。
- コードレビューと PR 単位の作業を推奨。1 PR = 1 機能を目安にする。

### 8.1 テスト方針

- 既存の Jest + RTL を活用。
- 重点を置く範囲：
  - フォームのバリデーション（必須入力チェック、保存ボタンの活性条件）
  - 検索フィルタの絞り込みロジック（純粋関数として切り出してユニットテスト）
  - 無限スクロール時のページ結合ロジック
- Firebase との通信はモック化する（実通信はマニュアルで確認）。
- 教材としての性質上、テストの網羅率を厳密に求めるものではない。「読みやすい / 触りやすい」テストを優先する。

---

## 9. 必須要件チェックリスト（memo.md 由来）

- [x] 外部サーバ（Firebase）にデータを格納する
- [x] 日記一覧（ホーム）、日記作成、日記詳細、日記編集、日記検索 の画面を作る
- [x] 日記一覧（ホーム）に無限スクロールを使う
- [x] 日記検索はホーム画面に内包する
- [x] 日記は アイコン / タイトル / 本文 / 日付 / 画像 を入力できる
- [x] 画像は任意入力、それ以外は必須入力
