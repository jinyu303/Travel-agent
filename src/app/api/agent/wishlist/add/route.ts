import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { addWishlistItem } from "@/lib/wishlists";

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
            "你是本站收藏助手。用户明确要求收藏时，调用 add_wishlist_item。" +
            "wishlistId 和 listingId 必须来自用户明确提供的编号，不猜测编号。" +
            "只依据工具结果回答；added=true 表示新加入，added=false 表示已经收藏。",
      },
      { role: "user", content: question.trim() },
    ];

    // 复制已验证脚本中的工具定义对象
    const tools: Record<string, unknown>[] = [
    {
        type: "function",
        function: {
        name: "add_wishlist_item",
        description: "将指定房源加入当前登录用户拥有的心愿单。",
        parameters: {
            type: "object",
            properties: {
            wishlistId: {
                type: "integer",
                minimum: 1,
                description: "心愿单编号",
            },
            listingId: {
                type: "integer",
                minimum: 1,
                description: "房源编号",
            },
            },
            required: ["wishlistId", "listingId"],
        },
        },
    },
    ];

    const message = await requestModel(messages, tools);
    const calls = message.tool_calls;

    if (!Array.isArray(calls) || calls.length !== 1) {
      throw new Error("本接口要求一次收藏工具调用");
    }

    const call = calls[0];

    if (
      call?.type !== "function" ||
      typeof call.id !== "string" ||
      call.id.length === 0 ||
      call.function?.name !== "add_wishlist_item" ||
      typeof call.function.arguments !== "string"
    ) {
      throw new Error("工具调用不合法");
    }

    const args = JSON.parse(call.function.arguments);

    if (
  !args ||
  typeof args !== "object" ||
  Array.isArray(args) ||
  !Number.isSafeInteger(args.wishlistId) ||
  args.wishlistId < 1 ||
  !Number.isSafeInteger(args.listingId) ||
  args.listingId < 1
) {
  throw new Error("收藏工具参数不合法");
}

// 调用 addWishlistItem
const result = addWishlistItem(user.id,args.wishlistId,args.listingId);

if (!result.ok) {
  return Response.json(
    { error: result.error },
    {
      status: result.error === "房源不存在" ? 404 : 403,
      headers,
    }
  );
}

messages.push(message);
messages.push({
  role: "tool",
  tool_call_id: call.id,
  content: JSON.stringify(result),
});

    const finalMessage = await requestModel(messages);
    const reply = finalMessage.content;

    if (typeof reply !== "string" || reply.trim().length === 0) {
      throw new Error("没有取得最终回复");
    }

    return Response.json(
    {
        reply,
        result,
        tool: {
        name: "add_wishlist_item",
        wishlistId: args.wishlistId,
        listingId: args.listingId,
        },
    },
    { headers }
    );
  } catch (error) {
    console.error("Agent 收藏失败", error);

    return Response.json(
      { error: "Agent 收藏失败，请稍后重试" },
      { status: 500, headers }
    );
  }
}