import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("travel_session")?.value;

    const user = getUserBySessionToken(token);

    if (!user) {
      return Response.json(
        { error: "未登录或会话已失效" },
        { status: 401, headers }
      );
    }

    return Response.json({ user }, { headers });
  } catch {
    return Response.json(
      { error: "查询当前用户失败" },
      { status: 500, headers }
    );
  }
}