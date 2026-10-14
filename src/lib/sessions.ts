import { randomBytes, createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

// 为已通过登录验证的用户创建会话
export function createSession(userId: number) {
  // 生成随机凭证
  const token = randomBytes(32).toString("hex");

  // 数据库保存凭证的哈希
  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  // 本项目先设置为 7 天有效
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  const db = new DatabaseSync("data/travel.db");

  try {
    // 插入 sessions 的三个字段
    // 使用三个 ?，依次绑定 tokenHash、userId、expiresAt
    db.prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"
    ).run(tokenHash, userId, expiresAt);
    // 返回 { token, expiresAt }
    return { token, expiresAt };

  } finally {
    db.close();
  }
}





// 根据凭证查询有效会话对应的用户
export function getUserBySessionToken(token?: string) {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return null;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const db = new DatabaseSync("data/travel.db");

  try {
    const session = db
      .prepare(
        "SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?"
      )
      .get(tokenHash,Date.now());

    if (!session) {
      return null;
    }

    const user = db
      .prepare("SELECT id, name, email FROM users WHERE id = ?")
      .get(Number(session.user_id));

    if (!user) {
      return null;
    }

    return {
      id: Number(user.id),
      name: String(user.name),
      email: String(user.email),
    };
  } finally {
    db.close();
  }
}



// 撤销当前凭证对应的会话
export function deleteSession(token?: string) {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) {
    return;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const db = new DatabaseSync("data/travel.db");

  try {
    // 删除 sessions 中 token_hash 匹配的记录
   db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
  } finally {
    db.close();
  }
}