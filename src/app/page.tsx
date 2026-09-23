export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="flex items-center justify-between border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-rose-500">
          Wanderly
        </h1>

        <nav className="flex gap-6 text-sm font-medium">
          <a href="#">首页</a>
          <a href="#">心愿单</a>
          <a href="#">我的行程</a>
          <button className="rounded-full border px-4 py-2">
            登录
          </button>
        </nav>
      </header>

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

        <div className="mx-auto mt-10 flex max-w-4xl items-center gap-4 rounded-full border p-3 shadow-lg">
          <input
            className="flex-1 px-4 outline-none"
            placeholder="你想去哪里？"
          />

          <input
            className="rounded-full border px-4 py-3"
            type="date"
          />

          <input
            className="w-28 rounded-full border px-4 py-3"
            type="number"
            min="1"
            placeholder="人数"
          />

          <button className="rounded-full bg-rose-500 px-6 py-3 font-semibold text-white">
            搜索
          </button>
        </div>
      </section>
    </main>
  );
}