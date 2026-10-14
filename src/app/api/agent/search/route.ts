import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { searchListings } from "@/lib/listings";

// 发送一次模型请求
async function requestModel(
  messages: Record<string, unknown>[],
  tools?: Record<string, unknown>[]
) {
  const apiKey = process.env.AGNES_API_KEY;

  if (!apiKey) {
    throw new Error("缺少模型密钥");
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
        model: "agnes-2.5-flash",
        messages,
        ...(tools ? { tools } : {}),
        max_tokens: 512,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!response.ok) {
    throw new Error(`模型请求失败，HTTP ${response.status}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;

  if (!message || message.role !== "assistant") {
    throw new Error("模型响应缺少有效助手消息");
  }

  return message;
}

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("travel_session")?.value;
    const user = getUserBySessionToken(token);

    if (!user) {
      return Response.json(
        { error: "请先登录" },
        { status: 401, headers }
      );
    }

    const formData = await request.formData().catch(() => null);
    const question = formData?.get("message");

    if (
      typeof question !== "string" ||
      question.trim().length === 0 ||
      question.trim().length > 500
    ) {
      return Response.json(
        { error: "请输入 1～500 个字符的问题" },
        { status: 400, headers }
      );
    }

    const messages: Record<string, unknown>[] = [
      {
        role: "system",
        content:
          "你是本站房源搜索助手。必须调用 search_listings 查询地点。" +
          "回答只能依据工具结果，结果为空时说明没有匹配房源。" +
          "不要编造房源、价格或设施。",
      },
      { role: "user", content: question.trim() },
    ];

    // 复制已验证脚本中的工具定义对象
    const tools: Record<string, unknown>[] = [
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
        ];

    const message = await requestModel(messages, tools);
    const calls = message.tool_calls;

    if (!Array.isArray(calls) || calls.length !== 1) {
      throw new Error("本接口要求一次搜索工具调用");
    }

    const call = calls[0];

    if (
      call?.type !== "function" ||
      typeof call.id !== "string" ||
      call.id.length === 0 ||
      call.function?.name !== "search_listings" ||
      typeof call.function.arguments !== "string"
    ) {
      throw new Error("工具调用不合法");
    }

    const args = JSON.parse(call.function.arguments);

    if (
      !args ||
      typeof args !== "object" ||
      Array.isArray(args) ||
      typeof args.location !== "string" ||
      args.location.trim().length === 0 ||
      args.location.trim().length > 100
    ) {
      throw new Error("搜索工具参数不合法");
    }

    //执行真实搜索，保存为 listings
    const listings = searchListings(args.location.trim());

    messages.push(message);
    messages.push({
      role: "tool",
      tool_call_id: call.id,
      content: JSON.stringify({ listings }),
    });

    const finalMessage = await requestModel(messages);
    const reply = finalMessage.content;

    if (typeof reply !== "string" || reply.trim().length === 0) {
      throw new Error("没有取得最终回复");
    }

    return Response.json(
      {
        reply,
        listings,
        tool: {
          name: "search_listings",
          location: args.location.trim(),
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Agent 搜索失败", error);

    return Response.json(
      { error: "Agent 搜索失败，请稍后重试" },
      { status: 500, headers }
    );
  }
}