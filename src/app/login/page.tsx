import ApiForm from "@/components/ApiForm";
export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl font-bold">登录</h1>

      <ApiForm
          action="/api/auth/login"
          successHref="/account"
          className="mt-8 space-y-5"
        >

      
        <label className="block">
          <span>邮箱</span>
          
          <input
            type="email"
            name="email"
            required
            maxLength={254}
            autoComplete="email"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </label>

        <label className="block">
          <span>密码</span>
          
          <input
            type="password"
            name="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-rose-500 p-3 font-semibold text-white"
        >
          登录
        </button>

        <a href="/register" className="block text-center text-rose-500">
          还没有账户？去注册
        </a>
      </ApiForm>
    </main>
  );
}