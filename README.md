# 品量的英語小助手 (English OCR & Reader)

這是一個簡單且高效的英語學習工具，旨在幫助使用者透過 OCR (光學字元辨識) 技術，快速將圖片或 PDF 中的英文轉換為文字，並結合語音合成技術進行反覆聆聽與朗讀練習。

## ✨ 主要功能

- **🚀 多來源文字辨識**: 
    - 支援圖片上傳 (JPG, PNG)。
    - 支援 PDF 檔案轉換 (多頁掃描)。
    - 支援直接開啟相機拍照辨識。
- **🔊 智慧朗讀系統 (TTS)**:
    - 可調整重複次數。
    - 可設定句子間的間隔時間。
    - 可手動調整語速 (0.5x - 2.0x)。
- **📱 響應式介面**:
    - 採用毛玻璃設計風格 (Glassmorphism)。
    - 適配行動裝置與桌面端。

## 🛠 技術棧

- **核心**: Vanilla JavaScript (原生 JS)
- **構建工具**: [Vite](https://vitejs.dev/)
- **OCR 引擎**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **PDF 引擎**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **樣式**: Vanilla CSS (現代佈局)

## 🚀 快速啟動

### 開發環境

1. 安裝依賴 (雖然目前主要使用 CDN，但 Vite 需要 Node.js 環境):
   ```bash
   npm install
   ```

2. 啟動開發伺服器:
   ```bash
   npm run dev
   ```

### 自動化工作流

專案包含一個特殊的 `push` 指令，方便快速同步到 Git:
```bash
npm run push
```

## 📝 專案結構

- `index.html`: 應用的主結構。
- `main.js`: 核心邏輯 (OCR、相機、朗讀控制)。
- `style.css`: 應用的 UI 設計與動畫。
- `vite.config.js`: Vite 配置環境。

---
*Created with ❤️ for English learners.*
