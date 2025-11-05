# 快速启动指南

## 第一次使用？跟着这个步骤走！

### 步骤 1: 安装依赖

```bash
npm install
```

### 步骤 2: 配置 Coze API

1. 复制配置文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 Coze API 信息：
```env
COZE_API_TOKEN=你的_coze_api_token
COZE_API_URL=https://api.coze.com/v1/workflows/run
PORT=3000
```

**如何获取 Coze API Token？**
- 访问 https://www.coze.com/
- 登录后进入 API 设置
- 创建个人访问令牌
- 复制 Token 到 `.env` 文件

### 步骤 3: 启动服务器

```bash
npm start
```

看到这个提示就说明成功了：
```
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🚀 图片提示词反推工具服务器已启动              ║
║                                                  ║
║   📍 地址: http://localhost:3000                 ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

### 步骤 4: 打开浏览器

在浏览器访问：http://localhost:3000

## 开始使用

1. **上传图片**：点击"选择本地图片"或输入图片 URL
2. **选择类型**：选择提示词类型（Midjourney、Stable Diffusion 等）
3. **生成提示词**：点击"生成提示词"按钮
4. **复制使用**：点击"复制"按钮即可使用

## 需要帮助？

查看完整文档：[README.md](README.md)

## 常见错误

### 错误：未配置 COZE_API_TOKEN
**解决方法：** 检查 `.env` 文件是否正确配置了 API Token

### 错误：端口被占用
**解决方法：** 修改 `.env` 文件中的 `PORT` 为其他端口号

### 错误：图片上传失败
**解决方法：**
- 确保图片格式为 JPG 或 PNG
- 确保图片大小不超过 5MB
