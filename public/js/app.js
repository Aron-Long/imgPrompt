// API 配置
const API_BASE_URL = 'http://localhost:3000/api';

// 状态管理
const state = {
    uploadedImage: null,
    uploadMethod: null, // 'local' or 'url'
    selectedPromptType: ''
};

// DOM 元素
const elements = {
    localUploadBtn: document.getElementById('localUploadBtn'),
    localFileInput: document.getElementById('localFileInput'),
    urlInput: document.getElementById('urlInput'),
    urlConfirmBtn: document.getElementById('urlConfirmBtn'),
    previewSection: document.getElementById('previewSection'),
    previewImage: document.getElementById('previewImage'),
    reuploadBtn: document.getElementById('reuploadBtn'),
    promptTypeSelect: document.getElementById('promptType'),
    generateBtn: document.getElementById('generateBtn'),
    generateStatus: document.getElementById('generateStatus'),
    resultSection: document.getElementById('resultSection'),
    resultText: document.getElementById('resultText'),
    copyBtn: document.getElementById('copyBtn'),
    copyStatus: document.getElementById('copyStatus')
};

// 初始化事件监听
function initEventListeners() {
    // 本地上传
    elements.localUploadBtn.addEventListener('click', () => {
        elements.localFileInput.click();
    });

    elements.localFileInput.addEventListener('change', handleLocalFileUpload);

    // URL 上传
    elements.urlInput.addEventListener('input', () => {
        if (elements.urlInput.value.trim()) {
            disableLocalUpload();
        } else {
            enableLocalUpload();
        }
    });

    elements.urlConfirmBtn.addEventListener('click', handleUrlUpload);

    // 重新上传
    elements.reuploadBtn.addEventListener('click', resetUpload);

    // promptType 选择
    elements.promptTypeSelect.addEventListener('change', (e) => {
        state.selectedPromptType = e.target.value;
        updateGenerateButton();
    });

    // 生成提示词
    elements.generateBtn.addEventListener('click', generatePrompt);

    // 复制按钮
    elements.copyBtn.addEventListener('click', copyToClipboard);
}

// 本地文件上传处理
async function handleLocalFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        showError('请上传 JPG 或 PNG 格式的图片');
        return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
        showError('图片大小不能超过 5MB');
        return;
    }

    // 压缩并显示预览
    try {
        const compressedFile = await compressImage(file);
        state.uploadedImage = compressedFile;
        state.uploadMethod = 'local';

        // 显示预览
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.previewImage.src = e.target.result;
            showPreview();
            disableUrlUpload();
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        showError('图片处理失败，请重试');
        console.error(error);
    }
}

// URL 上传处理
async function handleUrlUpload() {
    const url = elements.urlInput.value.trim();

    // 验证 URL 格式
    if (!isValidUrl(url)) {
        showError('请输入有效的图片 URL');
        return;
    }

    // 显示加载状态
    elements.urlConfirmBtn.disabled = true;
    elements.urlConfirmBtn.textContent = '加载中...';

    try {
        // 通过后端获取图片
        const response = await fetch(`${API_BASE_URL}/fetch-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('无法加载图片');
        }

        const blob = await response.blob();

        // 验证是否为图片
        if (!blob.type.startsWith('image/')) {
            throw new Error('URL 不是有效的图片');
        }

        state.uploadedImage = blob;
        state.uploadMethod = 'url';

        // 显示预览
        const objectUrl = URL.createObjectURL(blob);
        elements.previewImage.src = objectUrl;
        showPreview();
        disableLocalUpload();

    } catch (error) {
        showError('请输入有效的图片 URL');
        console.error(error);
    } finally {
        elements.urlConfirmBtn.disabled = false;
        elements.urlConfirmBtn.textContent = '确认 URL';
    }
}

// 图片压缩
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 如果图片小于 5MB，直接返回
                if (file.size <= 5 * 1024 * 1024) {
                    resolve(file);
                    return;
                }

                // 计算压缩比例
                const maxSize = 5 * 1024 * 1024;
                const ratio = Math.sqrt(maxSize / file.size);
                width *= ratio;
                height *= ratio;

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: file.type }));
                }, file.type, 0.9);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// 生成提示词
async function generatePrompt() {
    if (!state.uploadedImage || !state.selectedPromptType) return;

    // 显示加载状态
    elements.generateBtn.disabled = true;
    elements.generateStatus.textContent = '生成中...';
    elements.generateStatus.className = 'generate-status';
    elements.resultSection.style.display = 'none';

    try {
        // 准备 FormData
        const formData = new FormData();
        formData.append('img', state.uploadedImage);
        formData.append('promptType', state.selectedPromptType);
        formData.append('userQuery', '请描述一下这个图片');

        // 调用 API
        const response = await fetch(`${API_BASE_URL}/generate-prompt`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('API 调用失败');
        }

        const data = await response.json();

        if (data.success) {
            // 显示结果
            elements.resultText.value = data.prompt || '暂无结果';
            elements.resultSection.style.display = 'block';
            elements.generateStatus.textContent = '';
        } else {
            throw new Error(data.error || '生成失败');
        }

    } catch (error) {
        elements.generateStatus.textContent = '生成失败，请重试';
        elements.generateStatus.className = 'generate-status error';
        console.error(error);
    } finally {
        elements.generateBtn.disabled = false;
        updateGenerateButton();
    }
}

// 复制到剪贴板
async function copyToClipboard() {
    const text = elements.resultText.value;

    try {
        await navigator.clipboard.writeText(text);
        elements.copyStatus.textContent = '已复制';

        setTimeout(() => {
            elements.copyStatus.textContent = '';
        }, 3000);
    } catch (error) {
        // 备用方案
        elements.resultText.select();
        document.execCommand('copy');
        elements.copyStatus.textContent = '已复制';

        setTimeout(() => {
            elements.copyStatus.textContent = '';
        }, 3000);
    }
}

// 重置上传
function resetUpload() {
    state.uploadedImage = null;
    state.uploadMethod = null;

    elements.previewSection.style.display = 'none';
    elements.previewImage.src = '';
    elements.localFileInput.value = '';
    elements.urlInput.value = '';

    enableLocalUpload();
    enableUrlUpload();
    updateGenerateButton();

    elements.resultSection.style.display = 'none';
    elements.generateStatus.textContent = '';
}

// 显示预览
function showPreview() {
    elements.previewSection.style.display = 'block';
    updateGenerateButton();
}

// 禁用本地上传
function disableLocalUpload() {
    elements.localUploadBtn.disabled = true;
}

// 启用本地上传
function enableLocalUpload() {
    elements.localUploadBtn.disabled = false;
}

// 禁用 URL 上传
function disableUrlUpload() {
    elements.urlInput.disabled = true;
    elements.urlConfirmBtn.disabled = true;
}

// 启用 URL 上传
function enableUrlUpload() {
    elements.urlInput.disabled = false;
    elements.urlConfirmBtn.disabled = false;
}

// 更新生成按钮状态
function updateGenerateButton() {
    const canGenerate = state.uploadedImage && state.selectedPromptType;
    elements.generateBtn.disabled = !canGenerate;

    if (!canGenerate) {
        elements.generateBtn.setAttribute('data-tooltip', '请选择提示词类型');
    } else {
        elements.generateBtn.removeAttribute('data-tooltip');
    }
}

// URL 验证
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// 显示错误
function showError(message) {
    elements.generateStatus.textContent = message;
    elements.generateStatus.className = 'generate-status error';

    setTimeout(() => {
        elements.generateStatus.textContent = '';
    }, 3000);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateGenerateButton();
});
