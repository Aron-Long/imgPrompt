# Coze API 调用说明

## 概述

本项目使用 Coze 工作流 API 来生成图片提示词。API 调用流程分为两步：

1. **上传图片**：将图片上传到 Coze 平台，获取文件 ID
2. **调用工作流**：使用文件 ID 和参数调用工作流，获取生成的提示词

## API 调用流程

### 步骤 1: 上传图片到 Coze

**接口：** `POST https://api.coze.cn/v1/files/upload`

**请求头：**
```
Authorization: Bearer {your_access_token}
Content-Type: multipart/form-data
```

**请求体：**
```
file: [图片二进制数据]
```

**响应示例：**
```json
{
  "code": 0,
  "msg": "Success",
  "data": {
    "id": "file_xxx",
    "filename": "image.jpg"
  }
}
```

### 步骤 2: 调用工作流

**接口：** `POST https://api.coze.cn/v1/workflow/run`

**请求头：**
```
Authorization: Bearer {your_access_token}
Content-Type: application/json
```

**请求体：**
```json
{
  "workflow_id": "7569042190087159859",
  "parameters": {
    "userQuery": "请描述一下这个图片",
    "img": "file_xxx",
    "promptType": "midjourney"
  }
}
```

**响应示例：**
```json
{
  "code": 0,
  "msg": "Success",
  "data": "{\"output\":\"生成的提示词内容...\"}",
  "debug_url": "https://www.coze.cn/work_flow?execute_id=xxx"
}
```

## 参数说明

### workflow_id
- **类型：** String
- **必填：** 是
- **说明：** 工作流唯一标识
- **当前值：** `7569042190087159859`

### parameters

#### userQuery
- **类型：** String
- **必填：** 是
- **说明：** 用户查询文本，引导工作流解析图片
- **默认值：** `"请描述一下这个图片"`

#### img
- **类型：** String
- **必填：** 是
- **说明：** 图片文件 ID（通过文件上传 API 获取）
- **格式：** `file_xxx`

#### promptType
- **类型：** String
- **必填：** 是
- **说明：** 提示词类型
- **可选值：**
  - `midjourney` - Midjourney 提示词
  - `stableDiffusion` - Stable Diffusion 提示词
  - `flux` - Flux 提示词
  - `normal` - 通用基础版提示词

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方法 |
|--------|------|----------|
| 4000 | 参数错误 | 检查请求参数是否正确 |
| 4001 | 认证失败 | 检查 API Token 是否有效 |
| 4004 | 资源不存在 | 检查 workflow_id 是否正确 |
| 5000 | 服务器错误 | 稍后重试 |

### 响应处理

响应的 `data` 字段可能是：
1. **字符串格式的 JSON**：需要解析后提取 `output` 字段
2. **对象格式**：直接提取 `output` 或 `result` 字段
3. **纯字符串**：直接使用

## 代码实现

详见 [server/routes/api.js](server/routes/api.js#L155-L283)

关键函数：
- `uploadImageToCoze()` - 上传图片并获取文件 ID
- `callCozeAPI()` - 调用工作流 API

## 调试

### 查看调试信息

API 响应中包含 `debug_url` 字段，可以访问该链接查看：
- 工作流执行状态
- 各节点的输入输出
- 错误详情

### 日志输出

服务器会输出详细的调试日志：
```
正在上传图片到 Coze...
图片上传成功，文件ID: file_xxx
正在调用 Coze 工作流...
请求参数: {...}
Coze API 响应: {...}
```

## 环境配置

在 `.env` 文件中配置：

```env
# API Token（必填）
COZE_API_TOKEN=pat_xxx

# 工作流 ID（必填）
COZE_WORKFLOW_ID=7569042190087159859

# API 地址（可选，默认为中国版）
COZE_API_URL=https://api.coze.cn/v1/workflow/run
```

**注意：**
- 中国版 Coze：`https://api.coze.cn`
- 国际版 Coze：`https://api.coze.com`

## 参考文档

- [Coze 官方文档 - 通过 API 运行应用工作流](https://www.coze.cn/docs/)
- [Coze API 错误码文档](https://www.coze.cn/docs/error-codes)
- 本地文档：[cozeAPi.md](cozeAPi.md)
