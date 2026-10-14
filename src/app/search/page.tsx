import ListingCard from "@/components/ListingCard";
import { searchAvailableListings } from "@/lib/listing-availability";
import { getStayNights, getBusinessToday } from "@/lib/booking-dates";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // 同名参数重复时使用第一个值
  function read(name: string) {
    const value = params[name];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  }

  const location = read("location");
  const checkIn = read("checkIn");
  const checkOut = read("checkOut");
  const rawGuests = read("guests");
  const rawMaxPrice = read("maxPrice");
  const propertyType = read("propertyType");

  // 没填写的可选条件保持 undefined，不能把空字符串转成 0
  const guests = rawGuests ? Number(rawGuests) : undefined;
  const maxPrice = rawMaxPrice ? Number(rawMaxPrice) : undefined;
  const today = getBusinessToday();

  let error = "";

  if (
    guests !== undefined &&
    (!Number.isSafeInteger(guests) || guests < 1)
  ) {
    error = "人数必须是正整数";
  } else if (
    maxPrice !== undefined &&
    (!Number.isSafeInteger(maxPrice) || maxPrice < 0)
  ) {
    error = "每晚预算必须是非负整数";
  } else if (
    propertyType &&
    !["公寓", "民宿", "别墅"].includes(propertyType)
  ) {
    error = "房源类型不合法";
  } else if (
    (checkIn || checkOut) &&
    (
      getStayNights(checkIn, checkOut) === null ||
      checkIn < today
    )
  ) {
    error = "请填写合法且不早于今天的入住、退房日期";
  }

  const listings = error
    ? []
    : searchAvailableListings(location, {
        maxPrice,
        guests,
        propertyType: propertyType || undefined,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
      });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold">搜索住宿</h1>

      <form
        action="/search"
        method="get"
        className="mt-6 grid gap-4 rounded-2xl border p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label>
          <span className="text-sm">目的地</span>
          <input
            name="location"
            defaultValue={location}
            placeholder="全部地点"
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        <label>
          <span className="text-sm">入住日期</span>
          <input
            type="date"
            name="checkIn"
            defaultValue={checkIn}
            min={today}
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        <label>
          <span className="text-sm">退房日期</span>
          <input
            type="date"
            name="checkOut"
            defaultValue={checkOut}
            min={today}
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        <label>
          <span className="text-sm">入住人数</span>
          <input
            type="number"
            name="guests"
            min={1}
            defaultValue={rawGuests}
            placeholder="不限"
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        <label>
          <span className="text-sm">每晚最高预算（元）</span>
          <input
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={rawMaxPrice}
            placeholder="不限"
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        <label>
          <span className="text-sm">房源类型</span>
          <select
            name="propertyType"
            defaultValue={propertyType}
            className="mt-1 w-full rounded-lg border p-3"
          >
            <option value="">全部类型</option>
            <option value="公寓">公寓</option>
            <option value="民宿">民宿</option>
            <option value="别墅">别墅</option>
          </select>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-rose-500 p-3 font-semibold text-white"
        >
          搜索
        </button>

        <a href="/search" className="self-center text-rose-500">
          清空条件
        </a>
      </form>

      {error ? (
        <p role="alert" className="mt-6 text-red-600">{error}</p>
      ) : (
        <>
          <p className="mt-6 text-gray-600">
            找到 {listings.length} 套房源
          </p>
          <p className="mt-2 text-sm text-gray-500">
            房源、图片、评分及评论数均为演示资料。
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={String(listing.id)} listing={listing} />
            ))}
          </div>

          {listings.length === 0 && (
            <p className="mt-6">没有符合条件的房源，请调整条件。</p>
          )}
        </>
      )}
    </main>
  );
}