import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import ApiForm from "@/components/ApiForm";

export default async function SiteHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("travel_session")?.value;
  const user = getUserBySessionToken(token);

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-5 text-gray-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <a href="/" className="text-2xl font-bold text-rose-500">
          Wanderly
        </a>

        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-gray-900">
          <a href="/" className="hover:text-rose-500">
            首页
          </a>
          <a href="/wishlists" className="hover:text-rose-500">
            心愿单
          </a>
          <a href="/trips" className="hover:text-rose-500">
            我的行程
          </a>

          {user ? (
            <>
              <a href="/account" className="hover:text-rose-500">
                {user.name} · 我的账户
              </a>

              {/* TODO：提交到登出 API，成功后返回首页 */}
              <ApiForm
                action="/api/auth/logout"
                successHref="/"
                className="inline-block"
              >
                <button
                  type="submit"
                  className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-900 hover:bg-gray-50"
                >
                  登出
                </button>
              </ApiForm>
            </>
          ) : (
            <>
              <a href="/register" className="hover:text-rose-500">
                注册
              </a>
              <a
                href="/login"
                className="rounded-full border border-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-50"
              >
                登录
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}