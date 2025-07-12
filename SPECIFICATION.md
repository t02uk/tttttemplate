# テンプレートエンジンアプリケーション仕様書

## 概要

Handlebars.jsを使用したテンプレートエンジンアプリケーション。  
JavaScript関数による動的なデフォルト値設定と、戻り値の型に基づく自動UI生成機能を持つ。

## 機能要件

### 1. テンプレート機能
- `{{variable}}`構文によるテンプレート作成
- Handlebars.jsによるテンプレート処理
- テンプレートからの変数自動抽出
- リアルタイムプレビュー表示

### 2. 動的UI生成機能
- JavaScript関数の戻り値の型に基づくUI要素の自動決定
  - **文字列** → テキストボックス
  - **数値** → 数値入力ボックス
  - **配列** → ラジオボタン
  - **オブジェクト配列** → セレクトボックス
  - **真偽値** → チェックボックス

### 3. 変数設定機能
- 各変数に対するインライン設定（⚙️ボタン）
- JavaScript関数による動的デフォルト値設定
- 関数のテスト・プレビュー機能
- 型検出とUI要素プレビュー

### 4. データ永続化
- LocalStorageによるテンプレート保存・読み込み
- テンプレートメタデータ管理（名前、作成日時、更新日時）
- 変数設定の永続化

## 画面レイアウト

```
┌─────────────────────────────────────────────────────────────────┐
│ Template Engine App                                    [Save] [Clear] │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────────┐   │
│  │ Saved Templates │  │ Template Editor                     │   │
│  │                 │  │                                     │   │
│  │ • Template 1    │  │ ┌─────────────────────────────────┐ │   │
│  │ • Template 2    │  │ │今日は{{yyyy}}/{{mm}}/{{dd}}です。│ │   │
│  │ • Template 3    │  │ │こんにちは{{name}}さん。         │ │   │
│  │                 │  │ │天気は{{weather}}です。          │ │   │
│  │ [New Template]  │  │ └─────────────────────────────────┘ │   │
│  │                 │  │ Template Name: [_______________]    │   │
│  └─────────────────┘  └─────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────────┐   │
│  │ Variables       │  │ Preview                             │   │
│  │                 │  │                                     │   │
│  │ yyyy: [2025___] [⚙️] │ 今日は2025/06/29です。             │   │
│  │ mm:   [06_____] [⚙️] │ こんにちは田中太郎さん。           │   │
│  │ dd:   [29_____] [⚙️] │ 天気は晴れです。                   │   │
│  │ name: [田中太郎] [⚙️] │                                     │   │
│  │ weather: [⚙️]        │                                     │   │
│  │ ○ 晴れ ○ 曇り ○ 雨  │                                     │   │
│  └─────────────────┘  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 技術仕様

### 技術スタック
- **フロントエンド**: React + TypeScript + Vite
- **テンプレートエンジン**: Handlebars.js (CDN経由)
- **データ永続化**: LocalStorage
- **JavaScript実行**: eval() または Function constructor

### JavaScript関数実行仕様

#### デフォルト値関数の例
```javascript
// 文字列を返す関数
"田中太郎"
new Date().getFullYear().toString()

// 数値を返す関数
2025
Math.floor(Math.random() * 100)

// 配列を返す関数（ラジオボタン生成）
["晴れ", "曇り", "雨", "雪"]
["選択肢1", "選択肢2", "選択肢3"]

// オブジェクト配列を返す関数（セレクトボックス生成）
[
  {value: "sunny", label: "晴れ"},
  {value: "cloudy", label: "曇り"},
  {value: "rainy", label: "雨"}
]

// 真偽値を返す関数（チェックボックス生成）
true
Math.random() > 0.5
```

#### 型検出ロジック
```javascript
function detectUIType(value) {
  if (typeof value === 'string') return 'text';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'checkbox';
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object') {
      return 'select'; // オブジェクト配列
    }
    return 'radio'; // プリミティブ配列
  }
  return 'text'; // fallback
}
```

### データ構造

#### テンプレートデータ
```typescript
interface Template {
  id: string;
  name: string;
  content: string;
  variables: VariableConfig[];
  createdAt: Date;
  updatedAt: Date;
}

interface VariableConfig {
  name: string;
  defaultFunction: string; // JavaScript関数のコード
  uiType: 'text' | 'number' | 'radio' | 'select' | 'checkbox';
  currentValue: any;
}
```

#### LocalStorageキー
- `templates`: Template[]
- `currentTemplate`: Template | null

## ファイル構成

```
src/
├── App.tsx                      # メインレイアウト（4分割）
├── components/
│   ├── TemplateList.tsx         # 保存済みテンプレート一覧
│   ├── TemplateEditor.tsx       # テンプレート編集エリア
│   ├── VariableForm.tsx         # 動的変数入力フォーム
│   ├── VariableConfigDialog.tsx # 変数設定ダイアログ
│   └── TemplatePreview.tsx      # テンプレートプレビュー
├── hooks/
│   ├── useHandlebars.ts         # Handlebars関連処理
│   ├── useLocalStorage.ts       # LocalStorage操作
│   └── useDynamicVariables.ts   # 動的変数管理
├── utils/
│   ├── variableExtractor.ts     # テンプレートから変数抽出
│   ├── jsEvaluator.ts           # JavaScript関数実行
│   └── uiTypeDetector.ts        # UI型検出
└── types/
    └── template.ts              # 型定義
```

## セキュリティ考慮事項

⚠️ **注意**: JavaScript関数を直接実行するため、セキュリティリスクが存在します。
- 本アプリケーションは開発・テスト環境での使用を想定
- 外部入力の検証は最小限
- eval()使用によるコードインジェクションの可能性

## 今後の拡張可能性

1. **関数ライブラリ**: よく使用される関数のプリセット集
2. **テンプレート共有**: インポート/エクスポート機能
3. **バリデーション**: 入力値の検証機能
4. **ヘルパー関数**: Handlebars.jsカスタムヘルパー
5. **テーマ機能**: UI外観のカスタマイズ