import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { createBooking } from "@/lib/bookings";



//先验证当前用户，然后读取表单，并确认字段是文本
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

    const rawListingId = formData?.get("listingId");
    const checkIn = formData?.get("checkIn");
    const checkOut = formData?.get("checkOut");
    const rawGuests = formData?.get("guests");

    if (
      typeof rawListingId !== "string" ||
      typeof checkIn !== "string" ||
      typeof checkOut !== "string" ||
      typeof rawGuests !== "string"
    ) {
      return Response.json(
        { error: "请提供房源编号、入住日期、退房日期和人数" },
        { status: 400, headers }
      );
    }

    const listingId = Number(rawListingId);
    const guests = Number(rawGuests);

    
    const result = createBooking(user.id,listingId,checkIn,checkOut,guests);

    if (!result.ok) {
      const status =
        result.error === "房源不存在" ? 404 :
        result.error === "所选日期已被预订" ? 409 :
        400;

      return Response.json(
        { error: result.error },
        { status, headers }
      );
    }

    return Response.json(
      { booking: result.booking },
      { status: 201, headers }
    );
  } catch (error) {
    // 详细错误只在服务器终端记录
    console.error("创建订单失败", error);

    return Response.json(
      { error: "预订失败，请稍后重试" },
      { status: 500, headers }
    );
  }
}