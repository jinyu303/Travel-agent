import { searchListings } from "../src/lib/listings.ts";

const apiKey = process.env.AGNES_API_KEY;

if (!apiKey) {
  throw new Error("缺少 AGNES_API_KEY，请检查 .env.local");
}

const messages = [
  {
    role: "system",
    content:
      "你是本站旅行助手。查询房源必须调用 search_listings。" +
      "回答只能依据工具返回的真实房源。" +
      "结果为空时说明没有符合条件的房源，不编造名称、价格或设施。",
  },
  {
    role: "user",
    content: "请查询东京的房源，并告诉我名称和每晚价格。",
  },
];

const response = await fetch(
  "https://api.agnes-ai.cn/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        model: "agnes-2.5-flash",

        messages,

        tools: [
            {
            type: "function",
            function: {
                name: "search_listings",
                description: "查询本站数据库中指定地点的真实房源。",
                parameters: {
                type: "object",
                properties: {
                    location: {
                    type: "string",
                    description: "房源所在地，例如东京",
                    },
                },
                required: ["location"],
                },
            },
            },
        ],
        max_tokens: 512,
        stream: false,
        }),
    signal: AbortSignal.timeout(60000),
  }
);

console.log("HTTP 状态：", response.status);

if (!response.ok) {
  throw new Error(`模型请求失败，HTTP ${response.status}`);
}

//读取回复并且检查文本
const data = await response.json();
const message = data.choices?.[0]?.message;

if (!message) {
  throw new Error("响应缺少 message");
}

// 工具调用时，content 可能为空，不按普通文本回复判断
console.log("助手消息：", JSON.stringify(message, null, 2));

const toolCalls = message.tool_calls;

if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
  throw new Error("本次没有返回工具调用");
}

const call = toolCalls[0];

if (
  call.type !== "function" ||
  call.function?.name !== "search_listings" ||
  typeof call.function.arguments !== "string"
) {
  throw new Error("工具调用结构或名称不符合预期");
}

//将 call.function.arguments 解析为对象，保存为 args
const args =JSON.parse(call.function.arguments);

if (
  !args ||
  typeof args !== "object" ||
  Array.isArray(args) ||
  typeof args.location !== "string" ||
  args.location.trim().length === 0
) {
  throw new Error("工具参数不合法");
}

// 本次只验证单个工具调用
if (
  toolCalls.length !== 1 ||
  typeof call.id !== "string" ||
  call.id.length === 0
) {
  throw new Error("本次测试要求一个具有有效 id 的工具调用");
}

//调用真实搜索函数，传入清理后的地点
const listings = searchListings(args.location.trim());

console.log("数据库搜索结果：", listings);

// 保存模型提出工具调用的完整消息
messages.push(message);

// 把真实查询结果作为工具消息交回模型
messages.push({
  role: "tool",
  tool_call_id: call.id,
  content: JSON.stringify({ listings }),
});

const finalResponse = await fetch(
  "https://api.agnes-ai.cn/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "agnes-2.5-flash",
      messages,
      max_tokens: 512,
      stream: false,
    }),
    signal: AbortSignal.timeout(60000),
  }
);

console.log("第二次 HTTP 状态：", finalResponse.status);

if (!finalResponse.ok) {
  throw new Error(`工具结果回传失败，HTTP ${finalResponse.status}`);
}

const finalData = await finalResponse.json();

// 取得第二次响应的 choices[0].message.content
const finalContent = finalData.choices?.[0]?.message?.content;

if (
  typeof finalContent !== "string" ||
  finalContent.trim().length === 0
) {
  throw new Error("没有取得最终文本回复");
}

console.log("最终回复：", finalContent);

console.log("工具名称：", call.function.name);
console.log("搜索地点：", args.location);