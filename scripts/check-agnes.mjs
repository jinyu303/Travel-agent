const apiKey = process.env.AGNES_API_KEY;

if (!apiKey) {
  throw new Error("缺少 AGNES_API_KEY，请检查 .env.local");
}

const response = await fetch(
  "https://api.agnes-ai.cn/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      //接入说明中的模型标识
      model: "agnes-2.5-flash",
      messages: [
        {
          role: "system",
          content: "你是旅行助手，请用简短中文回答。",
        },
        {
          role: "user",
          content: "请用一句话介绍你能怎样帮助规划旅行。",
        },
      ],
      max_tokens: 256,
      stream: false,
    }),
    signal: AbortSignal.timeout(60000),
  }
);

console.log("HTTP 状态：", response.status);

if (!response.ok) {
  throw new Error(`模型请求失败，HTTP ${response.status}`);
}

//读取回复
const data = await response.json();
const content = data.choices?.[0]?.message?.content;

if (typeof content !== "string" || content.trim().length === 0) {
  throw new Error("响应中没有取得非空文本回复");
}

console.log("模型回复：", content);