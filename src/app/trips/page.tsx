import { cookies } from "next/headers";
import Link from "next/link";
import { getUserBySessionToken } from "@/lib/sessions";
import { listBookingsByUser } from "@/lib/bookings";
import ApiForm from "@/components/ApiForm";

export default async function TripsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("travel_session")?.value;
  const user = getUserBySessionToken(token);

  if (!user) {
    return (
      <main className="travel-page">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
          <p className="mb-3 text-sm font-semibold text-rose-500">
            记录每一段旅程
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            请先登录
          </h1>
          <p className="mt-3 text-gray-600">登录后查看你的预订与行程记录。</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-rose-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-rose-600"
          >
            去登录
          </Link>
        </div>
      </main>
    );
  }

  // 始终按服务端验证过的当前用户查询订单。
  const bookings = listBookingsByUser(user.id);

  return (
    <main className="travel-page">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <p className="mb-3 text-sm font-semibold text-rose-500">
          记录每一段旅程
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              我的行程
            </h1>
            <p className="mt-3 text-gray-600">当前用户：{user.name}</p>
          </div>
          <Link
            href="/search"
            className="inline-block rounded-lg bg-rose-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-rose-600"
          >
            探索更多住宿
          </Link>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          共 {bookings.length} 条预订记录，包含已取消的订单。
        </p>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          {bookings.map((booking) => (
            <article
              key={String(booking.id)}
              className="travel-hover-card min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    订单编号：{String(booking.id)}
                  </p>
                  <h2 className="mt-2 break-words text-xl font-semibold">
                    {String(booking.listing_name)}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {String(booking.location)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${booking.status === "cancelled" ? "bg-gray-100 text-gray-600" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {booking.status === "cancelled" ? "已取消" : "已确认"}
                </span>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                <div>
                  <dt className="text-xs text-gray-500">入住日期</dt>
                  <dd className="mt-1 break-words text-sm font-medium">
                    {String(booking.check_in)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">退房日期</dt>
                  <dd className="mt-1 break-words text-sm font-medium">
                    {String(booking.check_out)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">入住安排</dt>
                  <dd className="mt-1 text-sm">
                    {String(booking.guests)} 人 · {String(booking.nights)} 晚
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">预订时每晚价格</dt>
                  <dd className="mt-1 break-words text-sm">
                    ¥{String(booking.nightly_price)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-5">
                <span className="text-sm text-gray-600">订单总价</span>
                <strong className="break-all text-2xl font-bold">
                  ¥{String(booking.total_price)}
                </strong>
              </div>

              <div className="mt-5 flex flex-wrap items-start gap-3">
                <Link
                  href={`/listings/${String(booking.listing_id)}`}
                  className="inline-block rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100"
                >
                  查看房源
                </Link>
                {booking.status === "confirmed" && (
                  <ApiForm action="/api/bookings/cancel" successHref="/trips">
                    <input
                      type="hidden"
                      name="bookingId"
                      value={String(booking.id)}
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                    >
                      取消预订
                    </button>
                  </ApiForm>
                )}
              </div>
            </article>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">下一段旅程，从这里开始</h2>
            <p className="mt-3 text-gray-600">
              还没有行程，去寻找适合你的住宿吧。
            </p>
            <Link
              href="/search"
              className="mt-6 inline-block text-sm font-medium text-rose-500 hover:text-rose-600"
            >
              浏览住宿 →
            </Link>
          </div>
        )}

        <Link
          href="/"
          className="mt-8 inline-block text-sm text-rose-500 hover:text-rose-600"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
