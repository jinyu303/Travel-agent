import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserBySessionToken } from "@/lib/sessions";
import { getWishlistWithListings } from "@/lib/wishlists";
import ApiForm from "@/components/ApiForm";
import ListingCard from "@/components/ListingCard";

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
      <main className="travel-page">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
          <p className="mb-3 text-sm font-semibold text-rose-500">
            我的收藏住宿
          </p>
          <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
            请先登录
          </h1>
          <a href="/login" className="mt-6 block text-rose-500">
            去登录
          </a>
        </div>
      </main>
    );
  }

  const result = getWishlistWithListings(user.id, wishlistId);

  if (!result) {
    notFound();
  }

  const { wishlist, listings } = result;

  return (
    <main className="travel-page">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <p className="mb-3 text-sm font-semibold text-rose-500">我的收藏住宿</p>
        <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
          {String(wishlist.name)}
        </h1>

        <Link href="/wishlists" className="mt-4 block text-rose-500">
          返回心愿单列表
        </Link>

        <div className="mt-8 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={String(listing.id)}
              listing={listing}
              footer={
                <ApiForm
                  action="/api/wishlist-items/remove"
                  successHref={`/wishlists/${String(wishlist.id)}`}
                >
                  <input
                    type="hidden"
                    name="wishlistId"
                    value={String(wishlist.id)}
                  />
                  <input
                    type="hidden"
                    name="listingId"
                    value={String(listing.id)}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-rose-500 transition-colors hover:border-rose-300 hover:bg-rose-50"
                  >
                    移除收藏
                  </button>
                </ApiForm>
              }
            />
          ))}
        </div>

        {listings.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-600">
            这个心愿单还没有收藏房源。
          </p>
        )}
      </div>
    </main>
  );
}
