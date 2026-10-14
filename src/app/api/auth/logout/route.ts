import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/sessions";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("travel_session")?.value;

    // 调用 deleteSession，传入 token
    deleteSession(token);
    
    const response = NextResponse.json(
      { message: "已登出" },
      { headers: { "Cache-Control": "no-store" } }
    );

    // 用空值和立即过期的时间清除同名 Cookie
    response.cookies.set("travel_session", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });

    return response;
  } catch {
    return Response.json(
      { error: "登出失败，请稍后重试" },
      { status: 500 }
    );
  }
}