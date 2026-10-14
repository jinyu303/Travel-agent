import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { listBookingsByUser } from "@/lib/bookings";
import ApiForm from "@/components/ApiForm";

export default async function TripsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("travel_session")?.value;

  const user = getUserBySessionToken(token);

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">请先登录</h1>
        <a href="/login" className="mt-6 block text-rose-500">
          去登录
        </a>
      </main>
    );
  }

  //查询当前用户的订单，保存为 bookings
  const bookings = listBookingsByUser(user.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">我的行程</h1>
      <p className="mt-3 text-gray-600">
        当前用户：{user.name}
      </p>

      <div className="mt-8 grid gap-4">
        {bookings.map((booking) => (
          <article
            key={String(booking.id)}
            className="rounded-xl border p-5"
          >
            <h2 className="text-xl font-semibold">
              {String(booking.listing_name)}
            </h2>

            <div className="mt-3 space-y-2 text-gray-600">
              <p>订单编号：{String(booking.id)}</p>
              <p>地点：{String(booking.location)}</p>
              <p>
                入住：{String(booking.check_in)}
                {" → "}
                退房：{String(booking.check_out)}
              </p>
              <p>
                {String(booking.guests)} 人，
                {String(booking.nights)} 晚
              </p>
              <p>
                每晚 ¥{String(booking.nightly_price)}
              </p>
            </div>

            <p className="mt-3 font-semibold">
              订单总价：¥{String(booking.total_price)}
            </p>

            {/* ===== 新增：状态 ===== */}
            <p className="mt-3 font-medium">
              状态：{booking.status === "cancelled" ? "已取消" : "已确认"}
            </p>

            {/* ===== 新增：取消预订（仅 confirmed 时显示） ===== */}
            {booking.status === "confirmed" && (
              <ApiForm
                action="/api/bookings/cancel"
                successHref="/trips"
                className="mt-4"
              >
                <input
                  type="hidden"
                  name="bookingId"
                  value={String(booking.id)}
                />
                <button
                  type="submit"
                  className="rounded-lg border px-4 py-2 text-rose-500"
                >
                  取消预订
                </button>
              </ApiForm>
            )}

            <a
              href={`/listings/${String(booking.listing_id)}`}
              className="mt-4 inline-block text-rose-500"
            >
              查看房源
            </a>
          </article>
        ))}
      </div>

      {bookings.length === 0 && (
        <p className="mt-8">还没有行程，去寻找住宿吧。</p>
      )}

      <a href="/" className="mt-8 block text-rose-500">
        返回首页
      </a>
    </main>
  );
}