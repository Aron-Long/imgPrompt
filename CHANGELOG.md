# 更新日志

## 2024-11-05 - Coze API 集成优化

### 主要更新

✅ **根据 Coze 官方 API 文档重构了 API 调用逻辑**

#### 更新内容

1. **API 调用方式改进**
   - 从 FormData 格式改为标准的 JSON 格式
   - 使用两步调用流程：先上传图片获取文件 ID，再调用工作流
   - 符合 Coze 官方 API 规范

2. **新增功能**
   - `uploadImageToCoze()` - 上传图片到 Coze 平台
   - 使用文件 ID 而不是直接传递图片二进制数据
   - 详细的日志输出，便于调试

3. **配置更新**
   - 新增 `COZE_WORKFLOW_ID` 环境变量
   - API URL 默认使用中国版 `api.coze.cn`
   - 支持国际版切换

4. **响应处理优化**
   - 正确解析 Coze API 的响应格式 `{code, msg, data, debug_url}`
   - 智能提取 `data` 字段中的提示词内容
   - 支持字符串和对象两种格式

5. **错误处理增强**
   - 检查 API 响应的 `code` 字段
   - 更详细的错误信息
   - 调试 URL 输出

### 配置变更

**新的 .env 配置：**
```env
COZE_API_TOKEN=your_token_here
COZE_WORKFLOW_ID=7569042190087159859
COZE_API_URL=https://api.coze.cn/v1/workflow/run
PORT=3000
```

**旧的配置：**
```env
COZE_API_TOKEN=your_token_here
COZE_API_URL=https://api.coze.com/v1/workflows/run
PORT=3000
```

### 文件变更

- ✏️ 修改：[server/routes/api.js](server/routes/api.js)
  - 新增 `uploadImageToCoze()` 函数
  - 重写 `callCozeAPI()` 函数
  - 使用标准 Coze API 格式

- ✏️ 修改：[.env](.env) 和 [.env.example](.env.example)
  - 添加 `COZE_WORKFLOW_ID` 配置
  - 更新 API URL 为中国版

- ✏️ 修改：[README.md](README.md)
  - 更新环境变量说明
  - 添加中国版/国际版区分

- ✨ 新增：[API_GUIDE.md](API_GUIDE.md)
  - Coze API 调用详细说明
  - 参数说明和示例
  - 错误处理指南

### 技术细节

#### API 调用流程

**之前（不正确）：**
```javascript
// 直接使用 FormData 发送图片
const formData = new FormData();
formData.append('img', imageBuffer);
formData.append('promptType', promptType);
// 发送到 /v1/workflows/run
```

**现在（正确）：**
```javascript
// 步骤1: 上传图片
const fileId = await uploadImageToCoze(imageBuffer);

// 步骤2: 调用工作流
const response = await fetch('/v1/workflow/run', {
  body: JSON.stringify({
    workflow_id: '7569042190087159859',
    parameters: {
      img: fileId,  // 使用文件 ID
      promptType: promptType
    }
  })
});
```

### 注意事项

1. **需要重新配置环境变量**
   - 必须添加 `COZE_WORKFLOW_ID`
   - 建议使用中国版 API 地址

2. **API Token 权限**
   - 确保 Token 有文件上传权限
   - 确保 Token 有工作流执行权限

3. **调试建议**
   - 查看服务器日志了解详细的 API 调用过程
   - 使用响应中的 `debug_url` 查看工作流执行详情

### 兼容性

- ✅ 前端代码无需修改
- ✅ API 接口保持不变
- ✅ 用户体验无影响
- ⚠️ 需要更新 `.env` 配置文件

### 参考文档

- [Coze API 官方文档](cozeAPi.md)
- [API 调用指南](API_GUIDE.md)
