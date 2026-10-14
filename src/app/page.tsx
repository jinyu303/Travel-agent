import { searchListings } from "@/lib/listings";
import { getBusinessToday } from "@/lib/booking-dates";
import ListingCard from "@/components/ListingCard";

export default function Home() {

  // 当前按每晚价格升序选取六条，属于固定展示规则
  const featuredListings = searchListings().slice(0, 6);
  const today = getBusinessToday();



  return (
    <main className="min-h-screen bg-white text-gray-900">
      

      <section className="mx-auto max-w-6xl px-8 py-20 text-center">
        <p className="mb-4 text-sm font-semibold text-rose-500">
          AI TRAVEL AGENT
        </p>

        <h2 className="text-5xl font-bold tracking-tight">
          找到适合你的下一段旅程
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          搜索全球特色住宿，或者让 AI 根据你的预算、人数和旅行计划推荐房源。
        </p>

        <form
          action="/search"
          method="get"
          className="mx-auto mt-10 grid max-w-5xl gap-3 rounded-2xl border bg-white p-4 text-left shadow-lg md:grid-cols-5"
        >
          <label className="block">
            <span className="text-sm text-gray-600">目的地</span>
            <input
              name="location"
              placeholder="你想去哪里？"
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">入住日期</span>
            <input
              type="date"
              name="checkIn"
              min={today}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">退房日期</span>
            <input
              type="date"
              name="checkOut"
              min={today}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">人数</span>
            <input
              type="number"
              name="guests"
              min={1}
              placeholder="不限"
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-rose-500 p-3 font-semibold text-white md:self-end"
          >
            搜索
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-8 pb-12">
        <h2 className="text-2xl font-bold">按类型探索</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {["公寓", "民宿", "别墅"].map((type) => (
            <a
              key={type}
              //链接到 /search，并传入 propertyType 查询参数
              href={`/search?propertyType=${encodeURIComponent(type)}`}
              className="rounded-full border px-5 py-3 hover:border-rose-500"
            >
              {type}
            </a>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold">精选住宿</h2>
        <p className="mt-2 text-sm text-gray-500">
          按每晚价格排序展示；房源、图片及评分均为演示资料。
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((listing) => (
            // 渲染 ListingCard，设置 key 并传入 listing
            <ListingCard key={String(listing.id)} listing={listing} />
          ))}
        </div>

        <a href="/search" className="mt-6 inline-block text-rose-500">
          查看全部住宿 →
        </a>
      </section>

      <footer className="border-t px-8 py-6 text-sm text-gray-600">
        <p>Wanderly · AI Travel Agent</p>
        <p className="mt-2">
          旅行住宿考核项目 · 演示房源，不提供真实付款服务
        </p>
      </footer>

    </main>
  );
}