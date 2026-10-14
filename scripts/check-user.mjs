import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "../src/lib/password.ts";

// 模拟注册时收到的用户信息
const name = "测试用户";
const email = "learner@example.com";
const passwordHash = await hashPassword("travel-test-123");

const db = new DatabaseSync("data/travel.db");

try {
  // TODO 1：插入 name、email、password_hash 三个字段
  db.prepare(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
  ).run(name, email, passwordHash);

  // TODO 2：查询刚才插入的用户
  const user = db
    .prepare("SELECT id, name, email FROM users WHERE email = ?")
    .get(email);

  console.log(user);
} finally {
  db.close();
}