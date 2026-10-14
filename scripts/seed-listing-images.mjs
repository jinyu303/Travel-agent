import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const imagePaths = [
  "/images/stay-1.jpg",
  "/images/stay-2.jpg",
  "/images/stay-3.jpg",
];

// 先确认资源存在，再修改数据库
for (const path of imagePaths) {
  if (!existsSync(`public${path}`)) {
    throw new Error(`缺少图片：public${path}`);
  }
}

const db = new DatabaseSync("data/travel.db");

try {
  db.exec("BEGIN");

  try {
    const rows = db
      .prepare("SELECT id FROM listings WHERE images = '[]'")
      .all();

    const update = db.prepare(
      "UPDATE listings SET images = ? WHERE id = ?"
    );

    for (const row of rows) {
      const start = Number(row.id) % imagePaths.length;

      // 循环调整顺序，使不同房源的封面有所变化
      const gallery = imagePaths.map(
        (_, index) => imagePaths[(start + index) % imagePaths.length]
      );



      update.run(JSON.stringify(gallery), row.id);

      
    }

    db.exec("COMMIT");
    console.log("已为", rows.length, "条房源设置图片");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(
    db.prepare("SELECT id, images FROM listings WHERE id = 3").get()
  );
} finally {
  db.close();
}