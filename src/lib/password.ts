import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// 根据传入的密码生成可保存的哈希字符串
export async function hashPassword(
  password: string
): Promise<string> {
  // TODO 1：生成随机盐
  const salt = randomBytes(16).toString("hex");
  // TODO 2：使用 password 和盐，计算 64 字节的结果
  const key =(await scryptAsync(password, salt, 64)) as Buffer;
  // TODO 3：返回“算法名称:盐:计算结果”字符串
  return `scrypt:${salt}:${key.toString("hex")}`;
}



// 验证输入密码是否与保存的哈希匹配
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  const parts = passwordHash.split(":");

  // 检查是否符合当前生成函数的格式
  if (
    parts.length !== 3 ||
    parts[0] !== "scrypt" ||
    !/^[0-9a-f]{32}$/.test(parts[1]) ||
    !/^[0-9a-f]{128}$/.test(parts[2])
  ) {
    return false;
  }

  const savedSalt = parts[1];

  // TODO 1：把 parts[2] 从十六进制文本还原成 Buffer
  const savedKey = Buffer.from(parts[2], "hex");
  // TODO 2：使用输入密码和 savedSalt，计算 64 字节的结果
  const inputKey = (await scryptAsync(password, savedSalt, 64))as Buffer;
  // TODO 3：比较两份结果，并返回布尔值
  const matches = timingSafeEqual(savedKey, inputKey);
  return matches;
}