# クリッカーシミュレーター

シンプルで楽しいクリッカーゲーム。ボタンをクリックしてポイントを集め、アップグレードを購入してさらに効率よくポイントを稼ごう！

![ゲームロゴ](logo.svg)

## 🎮 遊び方

1. 中央の大きなボタンをクリック（タップ）してポイントを獲得
2. 貯まったポイントでアップグレードを購入
3. 自動クリッカーでクリックしなくてもポイントが増える！
4. 100万ポイント貯めてリボーンし、倍率ボーナスを獲得！

## ✨ 機能

### アップグレード
- **クリックパワー**: 1クリックあたりの獲得ポイントを+1増加
- **スーパークリックパワー**: 1クリックあたりの獲得ポイントを+5増加
- **自動クリッカー**: 毎秒+1ポイントを自動獲得
- **スーパー自動クリッカー**: 毎秒+5ポイントを自動獲得
- **ハイパー自動クリッカー**: 毎秒+10ポイントを自動獲得

### リボーン機能
- 100万ポイント（初回）でリボーン可能
- リボーンすると全てのアップグレードとポイントがリセット
- 代わりに永続的な倍率ボーナス（+0.5倍）を獲得
- リボーンコストは毎回2.5倍に増加

### その他
- **自動セーブ**: ブラウザのローカルストレージに進行状況を自動保存
- **効果音**: クリック音、購入音、エラー音
- **モバイル対応**: マルチタッチ対応、軽量化されたアニメーション
- **アニメーション**: Anime.jsライブラリを使用した滑らかなアニメーション

## 🚀 プレイ方法

### オンラインでプレイ

GitHub Pagesでホストされています:
```
https://tyatyaneko.github.io/clicker_simulator/
```

### ローカルでプレイ

1. このリポジトリをクローン:
```bash
git clone https://github.com/tyatyaneko/clicker_simulator.git
cd clicker_simulator
```

2. `index.html` をブラウザで開く:
- ファイルをダブルクリック
- または、右クリック → 「プログラムから開く」 → お好みのブラウザを選択

## 📁 ファイル構成

```
clicker_simulator/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── script.js           # ゲームロジック
├── logo.svg            # ゲームロゴ
├── logo.png            # OGP用ロゴ画像
├── SoundEffects/       # 効果音フォルダ
│   ├── Click.mp3       # クリック音
│   ├── Upgrade.mp3     # 購入成功音
│   └── Error.mp3       # 購入失敗音
└── README.md           # このファイル
```

## 🛠️ 技術スタック

- **HTML5**: ページ構造
- **CSS3**: スタイリングとレスポンシブデザイン
- **JavaScript (ES6)**: ゲームロジック
- **[Anime.js](https://animejs.com/)**: アニメーションライブラリ
- **LocalStorage API**: データ永続化
- **Web Audio API**: 効果音再生（オーディオプールシステム）

## 🎨 カスタマイズ

### ゲームバランスを変更

`script.js` の `GAME_CONFIG` オブジェクトで各種設定を変更できます:

```javascript
const GAME_CONFIG = {
    // アップグレードの基本コストとコスト倍率
    clickPower: { baseCost: 10, costMultiplier: 1.5 },
    superClickPower: { baseCost: 300, costMultiplier: 1.5 },
    autoClicker: { baseCost: 50, costMultiplier: 1.5 },
    superAutoClicker: { baseCost: 100, costMultiplier: 1.5 },
    hyperAutoClicker: { baseCost: 500, costMultiplier: 1.5 },
    // リボーン設定
    reborn: {
        baseCost: 1000000,      // リボーンの初期コスト
        costMultiplier: 2.5,    // リボーンコストの増加倍率
        multiplierBonus: 0.5    // リボーンごとに増える倍率
    }
};
```

### 色を変更

`style.css` のグラデーションカラーを変更:

```css
body {
    background: linear-gradient(135deg, #66ea83 0%, #4c4ba2 100%);
}
```

## 📝 ライセンス

MIT License - 自由に使用、変更、配布できます。

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📧 お問い合わせ

質問やフィードバックがある場合は、issueを開いてください。

---

**楽しんでプレイしてください！** 🎉🎉
