import { getListingById } from "@/lib/listings";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import { listWishlistsByUser } from "@/lib/wishlists";
import { getBusinessToday } from "@/lib/booking-dates";
import Image from "next/image";
import { parseStringArray } from "@/lib/listing-json";
import ApiForm from "@/components/ApiForm";


export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listingId = Number(id);

  if (!Number.isSafeInteger(listingId) || listingId < 1) {
    notFound();
  }

  const listing = getListingById(listingId);

  if (!listing) {
    notFound();
  }

  const images = parseStringArray(listing.images);
  const amenities = parseStringArray(listing.amenities);
  const reviewCount = Number(listing.review_count);

  const cookieStore = await cookies();
  const token = cookieStore.get("travel_session")?.value;
  const user = getUserBySessionToken(token);

  const wishlists = user ? listWishlistsByUser(user.id) : [];

  const today = getBusinessToday();

  //详情页
  return (
    <main className="mx-auto max-w-6xl px-8 py-12">
      <h1 className="text-3xl font-bold">房源详情</h1>

      <p className="mt-4 text-gray-600">房源编号：{String(listing.id)}</p>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">
          {String(listing.name)}
        </h2>

        <p className="mt-2 text-gray-600">
          {String(listing.location)} · {String(listing.property_type)}
        </p>

        <p className="mt-2">
          {reviewCount > 0
            ? `★ ${Number(listing.rating).toFixed(1)} · ${reviewCount}条评论`
            : "暂无评分"}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          房源、图片、评分及评论数均为项目演示资料。
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {images.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`${String(listing.name)}演示图片 ${index + 1}`}
              width={1000}
              height={750}
              className={`aspect-[4/3] w-full rounded-xl object-cover ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            />
          ))}
        </div>

        {images.length === 0 && (
          <p className="mt-6 text-gray-500">暂无图片。</p>
        )}

        <div className="mt-8 space-y-6">
          <section>
            <h3 className="text-xl font-semibold">
              房东：{String(listing.host_name)}
            </h3>
            <p className="mt-2 text-gray-600">
              最多 {String(listing.max_guests)} 人 ·
              {String(listing.bedrooms)} 卧室 ·
              {String(listing.beds)} 床 ·
              {String(listing.bathrooms)} 卫生间
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">房源介绍</h3>
            <p className="mt-2 whitespace-pre-wrap text-gray-600">
              {String(listing.description) || "暂无介绍"}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">设施</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {amenities.map((amenity) => (
                <li key={amenity} className="rounded-lg bg-gray-50 p-3">
                  {amenity}
                </li>
              ))}
            </ul>

            {amenities.length === 0 && (
              <p className="mt-2 text-gray-500">暂无设施信息。</p>
            )}
          </section>
        </div>
      </section>

      {!user ? (
        <a href="/login" className="mt-8 block text-rose-500">
          登录后收藏
        </a>
      ) : wishlists.length === 0 ? (
        <a href="/wishlists" className="mt-8 block text-rose-500">
          先创建一个心愿单
        </a>
      ) : (
        <ApiForm
          action="/api/wishlist-items"
          successHref="/wishlists"
          className="mt-8 space-y-4"
        >
          <input type="hidden" name="listingId" value={String(listing.id)} />

          <label className="block">
            <span>选择心愿单</span>

            <select
              name="wishlistId"
              className="ml-3 rounded-lg border p-3"
            >
              {wishlists.map((wishlist) => (
                <option
                  key={String(wishlist.id)}
                  value={String(wishlist.id)}
                >
                  {String(wishlist.name)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-lg bg-rose-500 px-5 py-3 text-white"
          >
            收藏房源
          </button>
        </ApiForm>
      )}

      <section className="mt-10 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">预订住宿</h2>

        <p className="mt-2">
          每晚 ¥{String(listing.price_per_night)}，
          最多入住 {String(listing.max_guests)} 人
        </p>

        {!user ? (
          <a href="/login" className="mt-4 block text-rose-500">
            登录后预订
          </a>
        ) : (
          // 提交到预订确认界面
          <form
            action="/bookings/confirm"
            method="get"
            className="mt-6 space-y-4"
          >
            {/*提交当前房源编号 */}
            <input type="hidden" name="listingId" value={String(listing.id)} />

            <label className="block">
              <span>入住日期</span>
              <input
                type="date"
                name="checkIn"
                required
                min={today}
                className="mt-2 block w-full rounded-lg border p-3"
              />
            </label>

            <label className="block">
              <span>退房日期</span>
              <input
                type="date"
                name="checkOut"
                required
                min={today}
                className="mt-2 block w-full rounded-lg border p-3"
              />
            </label>

            <label className="block">
              <span>入住人数</span>
              <input
                type="number"
                name="guests"
                required
                min={1}
                max={Number(listing.max_guests)}
                defaultValue={1}
                className="mt-2 block w-full rounded-lg border p-3"
              />
            </label>

            <button
              type="submit"
              className="rounded-lg bg-rose-500 px-5 py-3 text-white"
            >
              查看总价
            </button>
          </form>
        )}
      </section>
    </main>
  );
}