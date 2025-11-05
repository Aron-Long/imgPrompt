import fetch from 'node-fetch';
import fs from 'fs';

// 测试使用在线图片 URL
async function testWithImageUrl() {
    console.log('=== 测试 1: 使用图片 URL ===');

    const testImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4';

    try {
        // 下载测试图片
        console.log('下载测试图片...');
        const imageResponse = await fetch(testImageUrl);
        const imageBuffer = await imageResponse.buffer();

        console.log(`图片下载成功，大小: ${imageBuffer.length} bytes`);

        // 创建 FormData
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('img', imageBuffer, {
            filename: 'test.jpg',
            contentType: 'image/jpeg'
        });
        formData.append('promptType', 'midjourney');
        formData.append('userQuery', '请描述一下这个图片');

        // 调用 API
        console.log('调用生成提示词 API...');
        const response = await fetch('http://localhost:3000/api/generate-prompt', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ 测试成功！');
            console.log('生成的提示词:', result.prompt);
        } else {
            console.log('❌ 测试失败:', result.error);
        }

    } catch (error) {
        console.error('❌ 测试出错:', error.message);
    }
}

// 运行测试
testWithImageUrl();
