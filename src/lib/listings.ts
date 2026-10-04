import { DatabaseSync } from "node:sqlite";

// 返回符合地点条件的房源
export function searchListings(location?: string | null) {
  const db = new DatabaseSync("data/travel.db");

  try {
    // 1. 基础 SQL：查询所有房源
    let sql = "SELECT * FROM listings";
    // 2. 参数数组：存放占位符对应的值
    const params: string[] = [];

    // 3. 如果 location 有值，追加 WHERE 条件
    if (location) {
      sql += " WHERE location = ?";
      params.push(location);
    }

    // 4. 执行查询，返回所有匹配的行
    const rows = db.prepare(sql).all(...params);
    return rows;
    
  } finally {
    db.close();
  }
}