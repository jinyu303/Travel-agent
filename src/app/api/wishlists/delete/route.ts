import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { deleteWishlist } from "@/lib/wishlists";

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
    const rawWishlistId = formData?.get("wishlistId");

    if (typeof rawWishlistId !== "string") {
    return Response.json(
        { error: "请提供心愿单编号" },
        { status: 400 ,
            headers: { "Cache-Control": "no-store" }
        }
    );
    }

    const wishlistId = Number(rawWishlistId);

    if (!Number.isSafeInteger(wishlistId) || wishlistId < 1) {
    return Response.json(
        { error: "编号必须为正整数" },
        { status: 400 ,
            headers: { "Cache-Control": "no-store" }
        }
    );
    }

    //传入已验证用户的编号和心愿单编号
    const result = deleteWishlist(user.id,wishlistId);
    

    if (!result.ok) {
    return Response.json(
        { error: result.error },
        {
        status: 403,
        headers: { "Cache-Control": "no-store" },
        }
    );
    }

    return Response.json(result, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
    });

  } catch {
    return Response.json(
      { error: "删除心愿单失败" },
      { status: 500, headers }
    );
  }
}