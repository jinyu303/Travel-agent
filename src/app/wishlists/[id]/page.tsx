import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getUserBySessionToken } from "@/lib/sessions";
import { getWishlistWithListings } from "@/lib/wishlists";
import ApiForm from "@/components/ApiForm";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wishlistId = Number(id);

  if (!Number.isSafeInteger(wishlistId) || wishlistId < 1) {
    notFound();
  }

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

  const result = getWishlistWithListings(user.id,wishlistId);


  if (!result) {
    notFound();
  }

  const { wishlist, listings } = result;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">
        {String(wishlist.name)}
      </h1>

      <a href="/wishlists" className="mt-4 block text-rose-500">
        返回心愿单列表
      </a>

      <div className="mt-8 grid gap-4">
        {listings.map((listing) => (
          <article
            key={String(listing.id)}
            className="rounded-xl border p-5"
          >
            <h2 className="text-xl font-semibold">
              {String(listing.name)}
            </h2>
            <p>{String(listing.location)}</p>
            <p>每晚 ¥{String(listing.price_per_night)}</p>
            <a
              href={`/listings/${listing.id}`}
              className="mt-3 inline-block text-rose-500"
            >
              查看房源
            </a>

            {/* 提交到移除收藏 API */}
          <ApiForm 
          action = "/api/wishlist-items/remove"
          successHref ={`/wishlists/${String(wishlist.id)}`}
          className="mt-4">

            <input type="hidden" name="wishlistId" value={String(wishlist.id)} />

            <input type="hidden" name="listingId" value={String(listing.id)} />

            <button
              type="submit"
              className="rounded-lg border px-4 py-2 text-rose-500"
            >
              移除收藏
            </button>
          </ApiForm>

          </article>
        ))}
      </div>

      {listings.length === 0 && (
        <p className="mt-8">这个心愿单还没有收藏房源。</p>
      )}
    </main>
  );
}