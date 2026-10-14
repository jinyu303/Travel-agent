import { authenticateUser } from "@/lib/users";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/sessions";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return Response.json(
      { error: "无法读取表单" },
      { status: 400 }
    );
  }

  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return Response.json(
      { error: "请提供邮箱和密码" },
      { status: 400 }
    );
  }

  const cleanEmail = email.trim().toLowerCase();

  if (
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    password.length < 8 ||
    password.length > 128
  ) {
    return Response.json(
      { error: "邮箱或密码格式不符合要求" },
      { status: 400 }
    );
  }

  try {
    // TODO：await 调用 authenticateUser
    // 传入 cleanEmail 和 password，把结果保存为 user
    const user = await authenticateUser(cleanEmail,password);

    if (!user) {
      return Response.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // TODO：调用 createSession，传入已验证用户的 id
    // 把返回值保存为 session
    const session = createSession(user.id);
    const response = NextResponse.json({ user });

    response.cookies.set("travel_session", session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt),
    });

    return response;
  } catch {
    return Response.json(
      { error: "登录验证失败，请稍后重试" },
      { status: 500 }
    );
  }
}