import { createUser } from "@/lib/users";

export async function POST(request: Request) {
  // 读取表单；无法解析时返回 null
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return Response.json(
      { error: "无法读取表单" },
      { status: 400 }
    );
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  // 先检查字段类型
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return Response.json(
      { error: "请提供姓名、邮箱和密码" },
      { status: 400 }
    );
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  // 本项目第一版输入规则
  if (
    cleanName.length < 1 ||
    cleanName.length > 50 ||
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    password.length < 8 ||
    password.length > 128
  ) {
    return Response.json(
      { error: "姓名或邮箱不合法，密码需为 8～128 个字符" },
      { status: 400 }
    );
  }

  try {
    // await 调用 createUser，传入清理后的姓名、邮箱和原密码
    // 将返回值保存为 user
    const user = await createUser(cleanName, cleanEmail, password);

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    // 当前 SQLite 实现中，识别邮箱唯一约束错误
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed: users.email")
    ) {
      return Response.json(
        { error: "该邮箱已注册" },
        { status: 409 }
      );
    }

    return Response.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}