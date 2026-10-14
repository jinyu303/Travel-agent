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
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">请先登录</h1>
        <a href="/login" className="mt-6 block text-rose-500">
          去登录
        </a>
      </main>
    );
  }

  // TODO 1：查询当前用户的心愿单，保存为 wishlists
  const wishlists = listWishlistsByUser(user.id);
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">我的心愿单</h1>
      <p className="mt-3 text-gray-600">
        当前用户：{user.name}
      </p>

      {/*提交到创建心愿单 API */}
      <ApiForm 
      action = "/api/wishlists"
      successHref = "/wishlists"
      className="mt-8 flex gap-3">
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
          className="rounded-lg bg-rose-500 px-5 py-3 text-white"
        >
          创建
        </button>
      </ApiForm>

      <div className="mt-8 grid gap-4">
        {wishlists.map((wishlist) => (
          <article
            key={String(wishlist.id)}
            className="rounded-xl border p-5"
          >
            <h2 className="text-xl font-semibold">
              {String(wishlist.name)}
            </h2>
            <p className="mt-2 text-gray-600">
              编号：{String(wishlist.id)}
            </p>
            <a
            href={`/wishlists/${wishlist.id}`}
            className="mt-3 inline-block text-rose-500"
            >
            查看收藏
            </a>

            {/*提交到删除心愿单 API */}
            <ApiForm 
            action = "/api/wishlists/delete"
            successHref = "/wishlists"
            className="mt-4">

            <input type="hidden" name="wishlistId" value={String(wishlist.id)} />

            <button
                type="submit"
                className="rounded-lg border px-4 py-2 text-rose-500"
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
        <p className="mt-8">还没有心愿单，创建一个吧。</p>
      )}
    </main>
  );
}