# トランプ手書き & めくり（Baccara）

Vite + React + TypeScript + Tailwind CSS で、トランプ型キャンバスに手書き → 伏せ → ドラッグでめくり → リセットを行うデモです。

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## 操作

1. 白いカード上に黒い線で描画する
2. **伏せる** で裏面を表示
3. カードをドラッグして任意の方向からめくる（ドラッグ距離で角度が変わる）
4. めくり終わったら **リセット** で最初から
