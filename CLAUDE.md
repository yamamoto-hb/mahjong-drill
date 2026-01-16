




# 麻雀点数計算ドリル

## プロジェクト概要

麻雀の符計算・点数計算を練習できるWebアプリケーション。
麻雀は打てるけど点数計算が苦手な人向けの学習ツール。

## 技術スタック

- **フレームワーク**: Vite + React 19
- **言語**: TypeScript
- **スタイリング**: インラインスタイル（CSS-in-JS）
- **外部依存**: なし（純粋なReactのみ）

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー（ビルド後）
npm run preview

# リント
npm run lint
```

## ディレクトリ構成

```
src/
├── components/          # UIコンポーネント
│   ├── Tile.tsx         # 牌描画（PNG画像）
│   ├── TileGroup.tsx    # 面子表示
│   ├── HandDisplay.tsx  # 手牌全体表示
│   ├── AnswerInput.tsx  # 回答入力フォーム
│   ├── ResultDisplay.tsx # 結果・解説表示
│   ├── TutorialSection.tsx # 解説タブ
│   ├── ScoreTable.tsx   # 点数早見表
│   ├── SettingsBar.tsx  # モード・難易度選択
│   └── Header.tsx       # ヘッダー
├── logic/               # 計算ロジック
│   ├── types.ts         # 型定義
│   ├── tiles.ts         # 牌ユーティリティ
│   ├── fu-calculator.ts # 符計算
│   ├── score-calculator.ts # 点数計算
│   └── problem-generator.ts # 問題生成
├── App.tsx              # メインアプリ
├── main.tsx             # エントリーポイント
└── index.css            # グローバルスタイル
```

## 主要な型定義（src/logic/types.ts）

- `Tile` - 牌（suit, value, honorType）
- `Mentsu` - 面子（type, tiles, isOpen）
- `Problem` - 問題（mentsu, jantou, winType, playerType, waitType, han等）
- `FuBreakdown` - 符の内訳
- `ScoreResult` - 点数計算結果

## 符計算ロジック

符計算は `src/logic/fu-calculator.ts` で実装。

- 副底: 20符
- 門前ロン: +10符
- ツモ: +2符
- 面子の符: 順子0、明刻2/4、暗刻4/8、槓子8-32
- 雀頭の符: 役牌2、連風牌4
- 待ちの符: カンチャン/ペンチャン/単騎2
- 平和ツモ: 20符固定、平和ロン: 30符固定

## 点数計算ロジック

点数計算は `src/logic/score-calculator.ts` で実装。

```
基本点 = 符 × 2^(翻+2)
```

- 子のロン: 基本点 × 4
- 親のロン: 基本点 × 6
- 満貫以上は固定点数

## 牌の描画

`src/components/Tile.tsx` でPNG画像を使用して描画。

- 画像ソース: majandofu.com の麻雀牌画像
- 配置場所: `public/tiles/` ディレクトリ
- 暗槓: 両端の牌を裏向き（緑背景）で表示
- 副露: 鳴いた牌を横向きで表示

## デザインカラー

| 用途 | カラーコード |
|------|-------------|
| メイン（麻雀卓） | #2D5016 |
| アクセント | #8B5A2B |
| 背景 | #F5F3EF |
| 萬子 | #C41E3A |
| 筒子 | #1E6091 |
| 索子 | #1A5F2A |

## 注意事項

- `verbatimModuleSyntax` は無効化している（tsconfig.app.json）
- 関数の戻り値型には `ReactElement` を使用（`JSX.Element` ではなく）

## Claude Code向けルール

- CLAUDE.mdはプロジェクトルートに1つだけ配置する。サブディレクトリに作成しない
- `tmpclaude-*` 等の一時ファイルを作成した場合は必ず削除する
- `public/` や `dist/` 内にソースコード構造を作成しない
- チルダ（~）をリテラルなディレクトリ名として使用しない