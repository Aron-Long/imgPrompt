要通过 API 调用扣子（Coze）工作流，需按照以下步骤操作：
一、准备工作

获取访问令牌
在扣子平台创建 个人访问令牌（PAT） 或 服务访问令牌，用于 API 鉴权。
路径：个人设置 → 开发者选项 → 访问令牌 → 创建令牌（需记录令牌，有效期内使用）。
获取工作流 ID 和应用 ID
工作流 ID：在扣子平台的工作流编辑页面，URL 中 workflow_id 参数即为所需 ID（如 73664689170551*****）。
应用 ID（可选）：若工作流依赖应用资源（如知识库、数据库），需在应用设置中获取 app_id（如 743962661420117****）。
二、选择调用方式
方式 1：同步非流式调用（适合无实时交互场景）

API 端点：POST https://api.coze.cn/v1/workflow/run
请求头：
Authorization: Bearer {your_access_token}
Content-Type: application/json

请求体示例：
{
  "workflow_id": "73664689170551*****",  // 替换为你的工作流 ID
  "parameters": {  // 工作流的输入参数（根据实际需求定义）
    "user_id": "12345",
    "user_name": "George"
  },
  "app_id": "743962661420117****"  // 若依赖应用资源，需提供 app_id
}

响应示例：
{
  "code": 0,
  "msg": "Success",
  "data": "{\"output\":\"北京的经度为116.4074°E，纬度为39.9042°N。\"}",  // 工作流输出结果
  "debug_url": "https://www.coze.cn/work_flow?execute_id=xxx"  // 调试链接
}

方式 2：流式调用（适合实时交互场景，如打字机效果）

API 端点：POST https://api.coze.cn/v1/workflow/stream_run
请求头：同上
请求体示例：同上（参数一致）
响应处理：流式返回事件流，需按事件类型解析（如 Message、Done、Error）：
id: 0
event: Message
data: {"content":"正在处理...","node_title":"大模型节点"}

id: 1
event: Done
data: {"debug_url":"https://www.coze.cn/work_flow?execute_id=xxx"}

三、关键参数说明

参数名	类型	说明
workflow_id	String	工作流唯一标识，必填。
parameters	Object	工作流输入参数，需与工作流开始节点的参数定义一致（键名和数据类型）。
app_id	String	若工作流使用应用内资源（如知识库、数据库），需填写应用 ID。
四、调试与排障

调试链接：响应中的 debug_url 可直接访问，查看工作流各节点的输入输出、执行状态，快速定位问题。
错误码处理：若响应 code 非 0，参考 错误码文档 排查（如 4000 表示参数错误）。
五、参考文档

通过 API 运行应用工作流
执行工作流（流式响应）
获取个人访问令牌

按以上步骤操作，即可通过 API 成功调用扣子工作流。如需进一步开发，可参考官方 SDK（Python/Go/Java 等）简化调用流程。