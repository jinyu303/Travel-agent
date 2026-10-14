import { cookies } from "next/headers";
import { getUserBySessionToken } from "@/lib/sessions";
import ApiForm from "@/components/ApiForm";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("travel_session")?.value;

  const user = getUserBySessionToken(token);

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-12">
        <h1 className="text-3xl font-bold">尚未登录</h1>
        <a
          href="/login"
          className="mt-6 inline-block text-rose-500"
        >
          去登录
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl font-bold">我的账户</h1>

      <div className="mt-6 space-y-2">
        <p>姓名：{user.name}</p>
        <p>邮箱：{user.email}</p>
      </div>

      {/* TODO 2：添加 action 和 method，提交到登出 API */}
      <ApiForm 
      action="/api/auth/logout"
      successHref="/"
      className="mt-8">
        <button
          type="submit"
          className="rounded-lg border px-5 py-3"
        >
          登出
        </button>
      </ApiForm>

      <a href="/" className="mt-6 block text-rose-500">
        返回首页
      </a>
    </main>
  );
}