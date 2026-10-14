import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/travel.db");

// 字段名称和定义由程序固定提供
const fields = [
  ["property_type", "TEXT NOT NULL DEFAULT '公寓'"],
  ["description", "TEXT NOT NULL DEFAULT ''"],
  ["images", "TEXT NOT NULL DEFAULT '[]'"],
  ["amenities", "TEXT NOT NULL DEFAULT '[]'"],
  ["host_name", "TEXT NOT NULL DEFAULT '演示房东'"],
  [
    "bedrooms",
    "INTEGER NOT NULL DEFAULT 1 CHECK (bedrooms >= 0)",
  ],
  [
    "beds",
    "INTEGER NOT NULL DEFAULT 1 CHECK (beds >= 0)",
  ],
  [
    "bathrooms",
    "REAL NOT NULL DEFAULT 1 CHECK (bathrooms >= 0)",
  ],
  [
    "rating",
    "REAL NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5)",
  ],
  [
    "review_count",
    "INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0)",
  ],
];

try {
  db.exec("BEGIN");

  try {
    const columns = db.prepare("PRAGMA table_info(listings)").all();
    const existingNames = new Set(columns.map((column) => column.name));

    for (const [name, definition] of fields) {
      if (!existingNames.has(name)) {
        db.exec(
          `ALTER TABLE listings ADD COLUMN ${name} ${definition}`
        );

        console.log("已添加字段：", name);
      }
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(
    "房源字段：",
    db.prepare("PRAGMA table_info(listings)")
      .all()
      .map((column) => column.name)
  );

  console.log(
    "现有房源数量：",
    db.prepare("SELECT COUNT(*) AS total FROM listings").get()
  );
} finally {
  db.close();
}