import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { addWishlistItem } from "@/lib/wishlists";

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
    const wishlistValue = formData?.get("wishlistId");
    const listingValue = formData?.get("listingId");

    if (
      typeof wishlistValue !== "string" ||
      typeof listingValue !== "string"
    ) {
      return Response.json(
        { error: "请提供心愿单和房源编号" },
        { status: 400, headers }
      );
    }

    const wishlistId = Number(wishlistValue);
    const listingId = Number(listingValue);

    if (
      !Number.isSafeInteger(wishlistId) ||
      wishlistId < 1 ||
      !Number.isSafeInteger(listingId) ||
      listingId < 1
    ) {
      return Response.json(
        { error: "编号必须为正整数" },
        { status: 400, headers }
      );
    }

    // TODO：调用 addWishlistItem
    // 依次传入 user.id、wishlistId、listingId
    // 将返回值保存为 result
    const result = addWishlistItem(user.id,wishlistId,listingId);

    if (!result.ok) {
      return Response.json(
        { error: result.error },
        {
          status: result.error === "房源不存在" ? 404 : 403,
          headers,
        }
      );
    }

    return Response.json(result, {
      status: result.added ? 201 : 200,
      headers,
    });
  } catch {
    return Response.json(
      { error: "收藏失败" },
      { status: 500, headers }
    );
  }
}