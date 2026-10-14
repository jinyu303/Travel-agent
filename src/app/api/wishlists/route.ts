import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import {
  createWishlist,
  listWishlistsByUser,
} from "@/lib/wishlists";

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
    const name = formData?.get("name");

    if (
      typeof name !== "string" ||
      name.trim().length < 1 ||
      name.trim().length > 50
    ) {
      return Response.json(
        { error: "心愿单名称需为 1～50 个字符" },
        { status: 400, headers }
      );
    }

    // 调用 createWishlist
    // 传入已验证用户的 id、去除两端空白的名称
    // 保存返回值为 wishlist
    const wishlist = createWishlist(user.id, name.trim());

    return Response.json(
      { wishlist },
      { status: 201, headers }
    );
  } catch {
    return Response.json(
      { error: "创建心愿单失败" },
      { status: 500, headers }
    );
  }
}

export async function GET() {
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

    
    const wishlists = listWishlistsByUser(user.id);

    return Response.json({ wishlists }, { headers });
  } catch {
    return Response.json(
      { error: "查询心愿单失败" },
      { status: 500, headers }
    );
  }
}