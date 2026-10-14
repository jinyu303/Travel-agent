import { DatabaseSync } from "node:sqlite";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  // TODO 1：根据传入的 password 生成 passwordHash
  const passwordHash = await hashPassword(password);
  const db = new DatabaseSync("data/travel.db");

  try {
    // TODO 2：插入用户，使用 name、email、passwordHash
  db.prepare(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
  ).run(name, email, passwordHash);
    // TODO 3：按 email 查询 id、name、email，保存为 user
    const user = db
    .prepare("SELECT id, name, email FROM users WHERE email = ?")
    .get(email);

    // TODO 4：返回 user
    return user;
  } finally {
    db.close();
  }
}


// 验证账户信息；失败返回 null，成功返回用户基本信息
export async function authenticateUser(
  email: string,
  password: string
) {
  const db = new DatabaseSync("data/travel.db");

  let user;

  try {
    //按 email 查询用户
    user = db
      .prepare(
        "SELECT id, name, email, password_hash FROM users WHERE email = ?" 
      )
      .get(email);
  } finally {
    db.close();
  }

  if (!user || typeof user.password_hash !== "string") {
    return null;
  }

  // await 调用 verifyPassword
  // 传入此次输入的 password 和查询到的 user.password_hash
  // 把结果保存为 matches
  const matches = await verifyPassword(password, user.password_hash);

  if (!matches) {
    return null;
  }

  //返回用户基本信息对象
  // id 使用 Number(user.id)
  // name、email 使用 String(...)，不要返回 password_hash

  return {
    id:Number(user.id),
    name:String(user.name),
    email:String(user.email)
  };
}