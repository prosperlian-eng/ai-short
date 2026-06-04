# ShortAI — AIショート動画生成デモ

> **これはデモ（DEMO）です。** バックエンド・外部APIは一切使用せず、ブラウザだけで動作します。

---

## 起動方法

```bash
cd ~/Desktop/short-ai-demo
open index.html
```

または `index.html` をダブルクリックしてブラウザで開くだけでOKです。

---

## 使い方

1. **動画をアップロード** — mp4 / mov ファイルをドロップまたは選択
2. **生成設定** — 本数（3・5・10）とテキストスタイルを選択
3. **「AIショートを生成する」ボタンをクリック**
4. 9:16 縦型プレビューが生成本数分カード表示される
5. **「バズる言葉を再生成」** でキャッチコピーをシャッフル
6. カードをホバーすると動画が再生プレビューされる

---

## 今後 AI API を入れる場所

**`script.js` の `pickCopies()` 関数を置き換えます。**

```js
// 現在: ローカルのランダム配列から選択
function pickCopies(n) { ... }

// 将来: Claude / GPT-4o API を呼んで動画のメタ情報からコピー生成
async function pickCopies(n, videoMetadata) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 500,
      messages: [{ role: 'user', content: `動画「${videoMetadata.title}」のショート用キャッチコピーを${n}本生成してください。` }]
    })
  });
  // レスポンスをパースして copies[] に変換
}
```

---

## 今後 YouTube 自動投稿を入れる場所

**`script.js` のレンダリング後に以下を追加します。**

```js
// short-card の「投稿」ボタン押下時
async function uploadToYouTube(videoBlob, title, description) {
  // 1. Google OAuth 2.0 でアクセストークン取得
  // 2. YouTube Data API v3 / videos.insert でアップロード
  //    POST https://www.googleapis.com/upload/youtube/v3/videos
  // 3. タイトル・説明・タグ・カテゴリを設定
  // 4. shorts フォーマット（9:16、60秒以内）であることを確認
}
```

---

## 今後 FFmpeg で動画書き出しする場所

現在はブラウザプレビューのみ。実際の mp4 書き出しは以下で実装します。

**Node.js バックエンド（`server.js`）を追加：**

```js
const ffmpeg = require('fluent-ffmpeg');

// 9:16 縦型変換 + テキスト焼き込み
ffmpeg(inputPath)
  .videoFilter([
    'scale=1080:1920:force_original_aspect_ratio=decrease',
    'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
    `drawtext=text='${catchcopy}':fontfile=NotoSansJP.ttf:fontsize=52:fontcolor=white:x=(w-text_w)/2:y=80`
  ])
  .output(outputPath)
  .run();
```

**または ffmpeg.wasm でブラウザ完結にする選択肢もあります：**

```js
import { createFFmpeg } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });
await ffmpeg.load();
// 同様のフィルタを適用
```

---

## ファイル構成

```
short-ai-demo/
├── index.html   # アプリ本体
├── style.css    # スタイル（黒背景SaaS風）
├── script.js    # ロジック（アップロード・生成・プレビュー）
└── README.md    # このファイル
```

---

## 技術スタック（DEMO）

- **HTML / CSS / JavaScript** のみ（フレームワーク不使用）
- 外部API・バックエンド・ビルドツール 一切なし
- ブラウザの `URL.createObjectURL` で動画をプレビュー

---

*ShortAI DEMO — 2025*
