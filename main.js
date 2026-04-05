// Configuration
const TESSERACT_LANG = 'eng';
const STATUS_EL = document.getElementById('status-display');
const TEXT_OUTPUT = document.getElementById('text-output');
const FILE_INPUT = document.getElementById('file-input');
const DROP_ZONE = document.getElementById('drop-zone');
const REPEAT_COUNT = document.getElementById('repeat-count');
const INTERVAL_INPUT = document.getElementById('interval');
const RATE_INPUT = document.getElementById('rate');

const CAMERA_CONTAINER = document.getElementById('camera-container');
const CAMERA_STREAM = document.getElementById('camera-stream');
const BTN_CAMERA_TOGGLE = document.getElementById('btn-camera-toggle');
const BTN_CAPTURE = document.getElementById('btn-capture');
const BTN_CAMERA_CLOSE = document.getElementById('btn-camera-close');

let isSpeaking = false;
let currentUtterance = null;
let stream = null;

// --- OCR Logic ---

async function processFile(file) {
    showStatus(`正在處理 ${file.name}...`);
    try {
        if (file.type === 'application/pdf') {
            await processPDF(file);
        } else if (file.type.startsWith('image/')) {
            await processImage(file);
        } else {
            alert('不支援的檔案格式，請上傳圖片或 PDF。');
        }
    } catch (err) {
        console.error(err);
        alert('辨識過程中發生錯誤。');
    } finally {
        hideStatus();
    }
}

async function processImage(file) {
    const reader = new FileReader();
    reader.onload = async () => {
        const { data: { text } } = await Tesseract.recognize(reader.result, TESSERACT_LANG, {
            logger: m => console.log(m)
        });
        TEXT_OUTPUT.value = text;
    };
    reader.readAsDataURL(file);
}

async function processPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    showStatus(`PDF 已載入：共 ${pdf.numPages} 頁。正在進行辨識...`);

    for (let i = 1; i <= pdf.numPages; i++) {
        showStatus(`正在處理第 ${i} / ${pdf.numPages} 頁...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');

        const { data: { text } } = await Tesseract.recognize(dataUrl, TESSERACT_LANG, {
             logger: m => console.log(m)
        });
        
        fullText += text + '\n\n';
    }
    
    TEXT_OUTPUT.value = fullText.trim();
}

// --- Camera Logic ---

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        CAMERA_STREAM.srcObject = stream;
        CAMERA_CONTAINER.classList.remove('hidden');
        BTN_CAMERA_TOGGLE.classList.add('hidden');
    } catch (err) {
        console.error(err);
        alert('無法開啟相機，請確定已授權網站使用相機功能。');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    CAMERA_CONTAINER.classList.add('hidden');
    BTN_CAMERA_TOGGLE.classList.remove('hidden');
}

async function captureAndOCR() {
    const canvas = document.createElement('canvas');
    canvas.width = CAMERA_STREAM.videoWidth;
    canvas.height = CAMERA_STREAM.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(CAMERA_STREAM, 0, 0);
    
    showStatus('正在從相機畫面辨識文字...');
    
    try {
        const dataUrl = canvas.toDataURL('image/png');
        const { data: { text } } = await Tesseract.recognize(dataUrl, TESSERACT_LANG, {
            logger: m => console.log(m)
        });
        
        if (text.trim()) {
            TEXT_OUTPUT.value = text.trim();
        } else {
            alert('辨識不到文字，請對準一點再試一次。');
        }
    } catch (err) {
        console.error(err);
        alert('相機辨識出錯了。');
    } finally {
        hideStatus();
    }
}

// --- Speech Logic ---

async function speakText() {
    const text = TEXT_OUTPUT.value.trim();
    if (!text) return;

    if (isSpeaking) {
        window.speechSynthesis.cancel();
    }

    const repeats = parseInt(REPEAT_COUNT.value) || 1;
    const interval = parseFloat(INTERVAL_INPUT.value) * 1000;
    const rate = parseFloat(RATE_INPUT.value);

    // Split text into sentences for better learning experience
    // This regex splits by punctuation but keeps it
    const sentences = text.match(/[^.!?]+[.!?]*|[^.!?]+/g) || [text];
    
    isSpeaking = true;
    
    for (let sentence of sentences) {
        if (!isSpeaking) break;
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;

        for (let i = 0; i < repeats; i++) {
            if (!isSpeaking) break;
            
            showStatus(`朗讀中： "${trimmedSentence.substring(0, 30)}..." (${i + 1}/${repeats})`);
            
            await new Promise((resolve) => {
                const utterance = new SpeechSynthesisUtterance(trimmedSentence);
                utterance.lang = 'en-US';
                utterance.rate = rate;
                
                utterance.onend = () => {
                    setTimeout(resolve, interval);
                };
                
                utterance.onerror = () => {
                    isSpeaking = false;
                    resolve();
                };

                window.speechSynthesis.speak(utterance);
            });
        }
    }
    
    isSpeaking = false;
    hideStatus();
}

function stopSpeaking() {
    isSpeaking = false;
    window.speechSynthesis.cancel();
    hideStatus();
}

// --- UI Helpers ---

function showStatus(msg) {
    STATUS_EL.textContent = msg;
    STATUS_EL.classList.remove('hidden');
}

function hideStatus() {
    STATUS_EL.classList.add('hidden');
}

// --- Event Listeners ---

DROP_ZONE.addEventListener('click', () => FILE_INPUT.click());

DROP_ZONE.addEventListener('dragover', (e) => {
    e.preventDefault();
    DROP_ZONE.classList.add('drag-active');
});

DROP_ZONE.addEventListener('dragleave', () => {
    DROP_ZONE.classList.remove('drag-active');
});

DROP_ZONE.addEventListener('drop', (e) => {
    e.preventDefault();
    DROP_ZONE.classList.remove('drag-active');
    const files = e.dataTransfer.files;
    if (files.length) processFile(files[0]);
});

FILE_INPUT.addEventListener('change', (e) => {
    if (e.target.files.length) processFile(e.target.files[0]);
});

document.getElementById('btn-read').addEventListener('click', speakText);
document.getElementById('btn-stop').addEventListener('click', stopSpeaking);

// Camera events
BTN_CAMERA_TOGGLE.addEventListener('click', startCamera);
BTN_CAPTURE.addEventListener('click', captureAndOCR);
BTN_CAMERA_CLOSE.addEventListener('click', stopCamera);
