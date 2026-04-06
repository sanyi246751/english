const TEXT_OUTPUT = document.getElementById('text-output');
const STATUS_DISPLAY = document.getElementById('status-display');
const REPEAT_COUNT_INPUT = document.getElementById('repeat-count');
const INTERVAL_INPUT = document.getElementById('interval');
const RATE_INPUT = document.getElementById('rate');
const RATE_VALUE_EL = document.getElementById('rate-value');
const BTN_READ = document.getElementById('btn-read');
const BTN_STOP = document.getElementById('btn-stop');
const FILE_INPUT = document.getElementById('file-input');
const BTN_UPLOAD_TRIGGER = document.getElementById('btn-upload-trigger');
const BTN_CAMERA_TOGGLE = document.getElementById('btn-camera-toggle');
const BTN_CAPTURE = document.getElementById('btn-capture');
const BTN_CAMERA_CLOSE = document.getElementById('btn-camera-close');
const VIDEO = document.getElementById('camera-stream');
const CAMERA_CONTAINER = document.getElementById('camera-container');

let isReading = false;
let currentUtterance = null;
let stream = null;

/// 更新語速顯示
RATE_INPUT.addEventListener('input', (e) => {
    RATE_VALUE_EL.textContent = parseFloat(e.target.value).toFixed(1);
});

// 觸發隱藏的檔案選擇器
BTN_UPLOAD_TRIGGER.addEventListener('click', () => {
    FILE_INPUT.click();
});

// 檔案處理邏輯
FILE_INPUT.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
});

async function processFile(file) {
    if (typeof Tesseract === 'undefined' || typeof pdfjsLib === 'undefined') {
        alert('核心組件載入中，請稍候再試...');
        return;
    }

    showStatus('正在讀取檔案...');

    if (file.type === 'application/pdf') {
        await processPDF(file);
    } else {
        await processImage(file);
    }
    hideStatus();
}

async function processImage(file) {
    showStatus('正在辨識圖片文字...');
    try {
        const { data: { text } } = await Tesseract.recognize(file, 'eng');
        TEXT_OUTPUT.value = text;
    } catch (err) {
        alert('圖片辨識失敗：' + err.message);
    }
}

async function processPDF(file) {
    showStatus('正在轉換 PDF...');
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        TEXT_OUTPUT.value = fullText;
    } catch (err) {
        alert('PDF 處理失敗：' + err.message);
    }
}

// 相機功能
BTN_CAMERA_TOGGLE.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的瀏覽器不支援相機功能，或未在 HTTPS 安全環境下執行。');
        return;
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        VIDEO.srcObject = stream;
        CAMERA_CONTAINER.classList.remove('hidden');
        BTN_CAMERA_TOGGLE.classList.add('hidden');
    } catch (err) {
        alert('無法開啟相機：' + err.message);
    }
});

BTN_CAMERA_CLOSE.addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    CAMERA_CONTAINER.classList.add('hidden');
    BTN_CAMERA_TOGGLE.classList.remove('hidden');
});

BTN_CAPTURE.addEventListener('click', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = VIDEO.videoWidth;
    canvas.height = VIDEO.videoHeight;
    canvas.getContext('2d').drawImage(VIDEO, 0, 0);

    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'));
    processImage(blob);
    BTN_CAMERA_CLOSE.click();
});

// 朗讀功能
async function speakText() {
    const text = TEXT_OUTPUT.value.trim();
    if (!text) return;

    const repeat = parseInt(REPEAT_COUNT_INPUT.value);
    const interval = parseFloat(INTERVAL_INPUT.value) * 1000;
    const rate = parseFloat(RATE_INPUT.value);

    // 依句號分割
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    isReading = true;
    BTN_READ.disabled = true;

    for (let r = 0; r < repeat; r++) {
        if (!isReading) break;

        for (const sentence of sentences) {
            if (!isReading) break;

            await new Promise((resolve) => {
                const utter = new SpeechSynthesisUtterance(sentence.trim());
                utter.lang = 'en-US';
                utter.rate = rate;
                utter.onend = resolve;
                utter.onerror = resolve;
                currentUtterance = utter;
                window.speechSynthesis.speak(utter);
            });

            if (isReading) {
                await new Promise(r => setTimeout(r, interval));
            }
        }
    }

    isReading = false;
    BTN_READ.disabled = false;
}

BTN_READ.addEventListener('click', speakText);
BTN_STOP.addEventListener('click', () => {
    isReading = false;
    window.speechSynthesis.cancel();
    BTN_READ.disabled = false;
});

function showStatus(msg) {
    STATUS_DISPLAY.textContent = msg;
    STATUS_DISPLAY.classList.remove('hidden');
}

function hideStatus() {
    STATUS_DISPLAY.classList.add('hidden');
}
