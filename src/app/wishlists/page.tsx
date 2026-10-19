import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { listWishlistsByUser } from "@/lib/wishlists";
import ApiForm from "@/components/ApiForm";

export default async function WishlistsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("travel_session")?.value;
  const user = getUserBySessionToken(token);

  if (!user) {
    return (
      <main className="travel-page">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            请先登录
          </h1>
          <a href="/login" className="mt-6 block text-rose-500">
            去登录
          </a>
        </div>
      </main>
    );
  }

  // 只展示当前登录用户的心愿单
  const wishlists = listWishlistsByUser(user.id);
  return (
    <main className="travel-page">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <p className="mb-3 text-sm font-semibold text-rose-500">收藏旅行灵感</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          我的心愿单
        </h1>
        <p className="mt-3 text-gray-600">当前用户：{user.name}</p>

        {/*提交到创建心愿单 API */}
        <ApiForm
          action="/api/wishlists"
          successHref="/wishlists"
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sm:flex-row"
        >
          <input
            name="name"
            required
            maxLength={50}
            placeholder="心愿单名称"
            aria-label="心愿单名称"
            className="min-w-0 flex-1 rounded-lg border p-3"
          />
          <button
            type="submit"
            className="rounded-lg bg-rose-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-rose-600"
          >
            创建
          </button>
        </ApiForm>

        <div className="mt-8 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((wishlist) => (
            <article
              key={String(wishlist.id)}
              className="travel-hover-card rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="break-words text-xl font-semibold">
                {String(wishlist.name)}
              </h2>
              <p className="mt-2 text-gray-600">编号：{String(wishlist.id)}</p>
              <a
                href={`/wishlists/${wishlist.id}`}
                className="mt-3 inline-block text-rose-500"
              >
                查看收藏
              </a>

              {/*提交到删除心愿单 API */}
              <ApiForm
                action="/api/wishlists/delete"
                successHref="/wishlists"
                className="mt-4"
              >
                <input
                  type="hidden"
                  name="wishlistId"
                  value={String(wishlist.id)}
                />

                <button
                  type="submit"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-rose-500 transition-colors hover:border-rose-300 hover:bg-rose-50"
                >
                  删除整个心愿单
                </button>

                <p className="mt-2 text-sm text-gray-600">
                  将同时移除该心愿单中的全部收藏。
                </p>
              </ApiForm>
            </article>
          ))}
        </div>

        {wishlists.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-600">
            还没有心愿单，创建一个，收藏下一段旅程的灵感吧。
          </p>
        )}
      </div>
    </main>
  );
}
