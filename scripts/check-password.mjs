import {
  hashPassword,
  verifyPassword,
} from "../src/lib/password.ts";

// 生成一份模拟注册时保存的哈希
const passwordHash = await hashPassword("travel-test-123");

// 调用真正的业务函数，检查三种情况
console.log(
  "正确密码：",
  await verifyPassword("travel-test-123", passwordHash)
);

console.log(
  "错误密码：",
  await verifyPassword("wrong-password", passwordHash)
);

console.log(
  "损坏的哈希：",
  await verifyPassword("travel-test-123", "abc")
);