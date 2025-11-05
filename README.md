# 图片提示词反推工具

一个基于 Coze AI 的图片提示词生成工具，支持本地上传和 URL 上传图片，自动生成适用于不同 AI 绘画平台的提示词。

## 功能特性

- 📤 **多种上传方式**：支持本地图片上传和 URL 图片上传
- 🖼️ **图片预览**：上传后即时预览，支持自动压缩（≤5MB）
- 🎨 **多平台支持**：支持 Midjourney、Stable Diffusion、Flux、通用基础版
- 🤖 **AI 生成**：基于 Coze 工作流 API 生成精准提示词
- 📋 **一键复制**：快速复制生成的提示词
- 💻 **响应式设计**：支持桌面和移动端访问

## 技术栈

### 前端
- HTML5 / CSS3
- 原生 JavaScript (ES6+)
- 响应式设计

### 后端
- Node.js + Express
- Multer (文件上传)
- Sharp (图片处理)
- Node-fetch (API 调用)

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd 提示词反推网站
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Coze API 配置：

```env
COZE_API_TOKEN=your_coze_api_token_here
COZE_WORKFLOW_ID=7569042190087159859
COZE_API_URL=https://api.coze.cn/v1/workflow/run
PORT=3000
```

**注意：**
- 中国版 Coze 使用 `https://api.coze.cn`
- 国际版 Coze 使用 `https://api.coze.com`

#### 获取 Coze API Token

1. 访问 [Coze 平台](https://www.coze.com/)
2. 登录账号后进入 API 设置
3. 创建个人访问令牌（Personal Access Token）
4. 复制 Token 并填入 `.env` 文件

### 4. 启动服务器

```bash
npm start
```

或使用开发模式：

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## 使用指南

### 1. 上传图片

**本地上传：**
- 点击"选择本地图片"按钮
- 选择 JPG 或 PNG 格式图片（≤5MB）
- 系统自动压缩并显示预览

**URL 上传：**
- 在输入框输入图片 URL（HTTP/HTTPS）
- 点击"确认 URL"按钮
- 系统自动加载并显示预览

**注意：** 两种上传方式互斥，选择一种方式后另一种会自动禁用。

### 2. 选择提示词类型

在下拉框中选择目标平台：
- Midjourney
- Stable Diffusion
- Flux
- 通用基础版

### 3. 生成提示词

点击"生成提示词"按钮，等待 AI 处理（通常需要几秒钟）。

### 4. 复制使用

生成完成后，点击"复制"按钮即可将提示词复制到剪贴板。

## API 接口说明

### 1. 获取远程图片

**接口：** `POST /api/fetch-image`

**请求体：**
```json
{
  "url": "https://example.com/image.jpg"
}
```

**响应：** 返回图片二进制数据

### 2. 生成提示词

**接口：** `POST /api/generate-prompt`

**请求体：** `multipart/form-data`

| 参数 | 类型 | 说明 | 必填 |
|------|------|------|------|
| img | File | 图片文件 | 是 |
| promptType | String | 提示词类型（midjourney/stableDiffusion/flux/normal） | 是 |
| userQuery | String | 查询文本（默认："请描述一下这个图片"） | 否 |

**响应：**
```json
{
  "success": true,
  "prompt": "生成的提示词内容..."
}
```

### 3. 健康检查

**接口：** `GET /api/health`

**响应：**
```json
{
  "success": true,
  "message": "API 运行正常",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 项目结构

```
提示词反推网站/
├── public/                 # 前端静态文件
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       └── app.js         # 前端逻辑
├── server/                # 后端服务
│   ├── index.js          # 服务器入口
│   └── routes/
│       └── api.js        # API 路由
├── .env.example          # 环境变量示例
├── .gitignore           # Git 忽略文件
├── package.json         # 项目配置
└── README.md           # 项目说明
```

## 注意事项

1. **图片大小限制**：单张图片不超过 5MB，超过会自动压缩
2. **支持格式**：仅支持 JPG 和 PNG 格式
3. **API 配置**：务必正确配置 `.env` 文件中的 Coze API Token
4. **网络要求**：URL 上传需要服务器能访问目标图片地址
5. **CORS 配置**：已默认启用 CORS，可根据需要调整

## 常见问题

### Q: 上传图片后没有反应？
A: 检查图片格式（必须是 JPG/PNG）和大小（≤5MB）。

### Q: 生成失败怎么办？
A:
1. 检查 `.env` 文件中的 API Token 是否正确
2. 确认 Coze API URL 是否正确
3. 查看服务器日志获取详细错误信息

### Q: URL 上传提示"无效的图片 URL"？
A:
1. 确认 URL 是 HTTP 或 HTTPS 协议
2. 确认 URL 指向的是图片文件
3. 确认服务器能访问该 URL

## 开发计划

- [ ] 支持更多图片格式（GIF、WebP）
- [ ] 批量上传和处理
- [ ] 提示词历史记录
- [ ] 用户认证系统
- [ ] 提示词优化建议

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
