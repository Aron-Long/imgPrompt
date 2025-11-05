import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fetch from 'node-fetch';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 配置 multer 用于处理文件上传
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('只支持 JPG 和 PNG 格式'));
        }
    }
});

// 获取远程图片
router.post('/fetch-image', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: '缺少 URL 参数'
            });
        }

        // 验证 URL 格式
        let imageUrl;
        try {
            imageUrl = new URL(url);
            if (!['http:', 'https:'].includes(imageUrl.protocol)) {
                throw new Error('无效的协议');
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: '无效的 URL 格式'
            });
        }

        // 获取图片
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error('无法获取图片');
        }

        // 检查内容类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                error: 'URL 不是有效的图片'
            });
        }

        // 获取图片数据
        const buffer = await response.buffer();

        // 检查文件大小
        if (buffer.length > 5 * 1024 * 1024) {
            // 压缩图片
            const compressedBuffer = await sharp(buffer)
                .resize(2000, 2000, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 85 })
                .toBuffer();

            return res.type('image/jpeg').send(compressedBuffer);
        }

        // 返回原图
        res.type(contentType).send(buffer);

    } catch (error) {
        console.error('获取图片失败:', error);
        res.status(500).json({
            success: false,
            error: '获取图片失败'
        });
    }
});

// 生成提示词
router.post('/generate-prompt', upload.single('img'), async (req, res) => {
    try {
        const { promptType, userQuery } = req.body;
        const imageFile = req.file;

        // 验证参数
        if (!imageFile) {
            return res.status(400).json({
                success: false,
                error: '缺少图片文件'
            });
        }

        if (!promptType) {
            return res.status(400).json({
                success: false,
                error: '缺少 promptType 参数'
            });
        }

        const validTypes = ['midjourney', 'stableDiffusion', 'flux', 'normal'];
        if (!validTypes.includes(promptType)) {
            return res.status(400).json({
                success: false,
                error: '无效的 promptType'
            });
        }

        // 调用 Coze API
        const prompt = await callCozeAPI({
            userQuery: userQuery || '请描述一下这个图片',
            img: imageFile.buffer,
            promptType,
            filename: imageFile.originalname,
            mimetype: imageFile.mimetype
        });

        res.json({
            success: true,
            prompt
        });

    } catch (error) {
        console.error('生成提示词失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || '生成失败，请重试'
        });
    }
});

// 上传图片到 Imgur 匿名 API（无需 API Key）
async function uploadToImgur(imageBuffer) {
    try {
        const base64Image = imageBuffer.toString('base64');

        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                'Authorization': 'Client-ID 546c25a59c58ad7',  // Imgur 公共客户端 ID
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Image,
                type: 'base64'
            })
        });

        const data = await response.json();
        console.log('Imgur响应:', JSON.stringify(data, null, 2));

        if (data.success && data.data && data.data.link) {
            return data.data.link;
        } else {
            console.error('Imgur 上传失败:', data);
            throw new Error('无法从 Imgur 获取图片 URL');
        }
    } catch (error) {
        console.error('上传到 Imgur 失败:', error);
        throw new Error('图片上传失败，请重试');
    }
}

// 上传图片到 Coze 并获取文件 ID
async function uploadImageToCoze(imageBuffer, filename, mimetype) {
    const COZE_API_TOKEN = process.env.COZE_API_TOKEN;
    const COZE_UPLOAD_URL = 'https://api.coze.cn/v1/files/upload';

    try {
        const FormData = (await import('form-data')).default;
        const formData = new FormData();

        formData.append('file', imageBuffer, {
            filename: filename || 'image.jpg',
            contentType: mimetype || 'image/jpeg'
        });

        console.log('正在上传图片到 Coze...');
        const response = await fetch(COZE_UPLOAD_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COZE_API_TOKEN}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        const responseText = await response.text();
        console.log('Coze上传响应状态:', response.status);
        console.log('Coze上传响应:', responseText);

        if (!response.ok) {
            // 如果上传失败,尝试使用URL方式
            throw new Error(`文件上传失败: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);

        // 返回文件 ID
        if (data.data && data.data.id) {
            return data.data.id;
        } else if (data.data && data.data.file_id) {
            return data.data.file_id;
        } else if (data.id) {
            return data.id;
        } else if (data.file_id) {
            return data.file_id;
        } else {
            throw new Error('无法获取文件 ID');
        }

    } catch (error) {
        console.error('上传图片到 Coze 失败:', error.message);
        // 如果上传失败,返回 null,调用方会尝试其他方式
        return null;
    }
}

// 调用 Coze 工作流 API
async function callCozeAPI({ userQuery, img, promptType, filename, mimetype }) {
    const COZE_API_TOKEN = process.env.COZE_API_TOKEN;
    const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID || '7569042190087159859';
    const COZE_API_URL = process.env.COZE_API_URL || 'https://api.coze.cn/v1/workflow/run';

    if (!COZE_API_TOKEN) {
        throw new Error('未配置 COZE_API_TOKEN');
    }

    try {
        console.log('正在准备图片数据...');

        // 尝试1: 直接上传文件到 Coze
        const fileId = await uploadImageToCoze(img, filename, mimetype);
        let imageParameter;

        if (fileId) {
            // 如果上传成功,使用文件 ID
            // 根据 Coze API 文档,file_id 需要包装为 JSON 字符串格式
            console.log('图片已上传到 Coze，文件ID:', fileId);
            imageParameter = JSON.stringify({ file_id: fileId });
        } else {
            // 如果上传失败,尝试使用用户提供的 URL (如果是URL上传的话)
            console.log('Coze上传失败,尝试使用URL方式...');
            // 注意:这里我们假设img是buffer,没有原始URL
            // 为了测试,我们可以传递一个公开的测试图片URL
            throw new Error('无法上传图片到 Coze,且没有备用URL可用');
        }

        // 调用工作流 API
        console.log('正在调用 Coze 工作流...');

        const requestBody = {
            workflow_id: COZE_WORKFLOW_ID,
            parameters: {
                userQuery: userQuery || '请描述一下这个图片',
                img: imageParameter,  // 使用文件ID或URL
                promptType: promptType
            }
        };

        console.log('请求参数:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(COZE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COZE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Coze API 错误响应:', errorText);
            throw new Error(`Coze API 调用失败: ${response.status}`);
        }

        const data = await response.json();
        console.log('Coze API 响应:', JSON.stringify(data, null, 2));

        // 根据文档，响应格式为：
        // {
        //   "code": 0,
        //   "msg": "Success",
        //   "data": "{\"output\":\"生成的提示词内容\"}",
        //   "debug_url": "https://www.coze.cn/work_flow?execute_id=xxx"
        // }

        if (data.code !== 0) {
            throw new Error(data.msg || 'Coze API 返回错误');
        }

        // 解析 data 字段
        let result = data.data;

        // 如果 data 是字符串，尝试解析为 JSON
        if (typeof result === 'string') {
            try {
                const parsed = JSON.parse(result);
                result = parsed.output || parsed.result || parsed;
            } catch (e) {
                // 如果解析失败，直接返回字符串
                result = result;
            }
        }

        // 如果 result 是对象，提取输出字段
        if (typeof result === 'object') {
            result = result.output || result.result || JSON.stringify(result, null, 2);
        }

        return result;

    } catch (error) {
        console.error('Coze API 调用错误:', error);
        throw new Error(error.message || 'API 调用失败，请稍后重试');
    }
}

// 健康检查
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API 运行正常',
        timestamp: new Date().toISOString()
    });
});

export default router;
