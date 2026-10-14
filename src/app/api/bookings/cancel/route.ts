import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { cancelBooking } from "@/lib/bookings";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };

  try {
    const cookieStore = await cookies();
    const user = getUserBySessionToken(
      cookieStore.get("travel_session")?.value
    );

    if (!user) {
      return Response.json(
        { error: "请先登录" },
        { status: 401, headers }
      );
    }

    const formData = await request.formData().catch(() => null);
    const rawId = formData?.get("bookingId");
    const bookingId = typeof rawId === "string" ? Number(rawId) : NaN;

    if (!Number.isSafeInteger(bookingId) || bookingId < 1) {
      return Response.json(
        { error: "订单编号必须为正整数" },
        { status: 400, headers }
      );
    }

    const result = cancelBooking(user.id, bookingId);

    return Response.json(result, {
      status: result.ok ? 200 : 403,
      headers,
    });
  } catch (error) {
    console.error("取消订单失败", error);

    return Response.json(
      { error: "取消失败，请稍后重试" },
      { status: 500, headers }
    );
  }
}