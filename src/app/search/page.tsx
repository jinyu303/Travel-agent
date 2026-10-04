import { searchListings } from "@/lib/listings";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string | string[] }>;
}) {
  const params = await searchParams;

  // 同名参数出现多次时，先使用第一个值
  const location = Array.isArray(params.location)
    ? params.location[0]
    : params.location;

    const listings = searchListings(location);
    
  return (
    <main className="mx-auto max-w-6xl px-8 py-12">
      <h1 className="text-3xl font-bold">搜索结果</h1>

      <p 
        className="mt-4">
        搜索地点：{location || "全部地点"}

      </p>
    </main>
  );
}