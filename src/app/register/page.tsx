import ApiForm from "@/components/ApiForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-3xl font-bold">创建账户</h1>

      {/* TODO：给 form 添加 action 和 method，提交到注册 API */}
      <ApiForm 
      action="/api/auth/register"
      successHref="/login"
      className="mt-8 space-y-5">
        <label className="block">
          <span>姓名</span>
          {/* TODO：添加对应的 name */}
          <input
            type="text"
            name="name"
            required
            maxLength={50}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </label>

        <label className="block">
          <span>邮箱</span>
          {/* TODO：添加对应的 name */}
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
          {/* TODO：添加对应的 name */}
          <input
            type="password"
            name="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border p-3"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-rose-500 p-3 font-semibold text-white"
        >
          注册
        </button>
      </ApiForm>
    </main>
  );
}