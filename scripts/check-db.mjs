import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

mkdirSync("data", { recursive: true });

const db = new DatabaseSync("data/travel.db");



console.log("数据库已打开");

db.exec(`
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    price_per_night INTEGER NOT NULL

  )
`);

db.prepare(
  "INSERT OR IGNORE INTO listings (id, name,location,price_per_night) VALUES (?, ?,?,?)"
).run(1, "东京公寓","东京",680);
db.prepare(
  "INSERT OR IGNORE INTO listings (id, name,location,price_per_night) VALUES (?, ?,?,?)"
).run(2, "京公寓","天堂",68880);

//用户
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL

  )
`);


// 保存登录会话
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at INTEGER NOT NULL
  )
`);


// 保存心愿单本身
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL ,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// 保存心愿单与房源的收藏关系 创建收藏条目表。
db.exec(`
  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY,
    wishlist_id INTEGER NOT NULL REFERENCES wishlists(id),
    listing_id INTEGER NOT NULL REFERENCES listings(id),
    UNIQUE (wishlist_id, listing_id)
  )
`);

// 保存预订订单
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY,

    user_id INTEGER NOT NULL ,
    listing_id INTEGER NOT NULL,

    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    guests INTEGER NOT NULL CHECK (guests >= 1),
    nights INTEGER NOT NULL CHECK (nights >= 1),

    nightly_price INTEGER NOT NULL CHECK (nightly_price >= 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    created_at INTEGER NOT NULL,


    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (listing_id) REFERENCES listings(id),

    CHECK (check_out > check_in)
  )
`);


// 查询当前房源表有哪些字段
const listingColumns = db.prepare("PRAGMA table_info(listings)").all();

// 只有字段不存在时才添加，方便重复运行脚本
if (!listingColumns.some((column) => column.name === "max_guests")) {
  db.exec(`
    ALTER TABLE listings
    ADD COLUMN max_guests INTEGER NOT NULL DEFAULT 4
    CHECK (max_guests >= 1)
  `);
}

console.log(
  db.prepare("SELECT id, name, max_guests FROM listings").all()
);



const rows = db.prepare("SELECT * FROM listings").all();
console.log(rows);
const count = db.prepare("SELECT COUNT(*) AS total FROM listings").get();
console.log("总共有", count.total, "条房源");

console.log(
  "心愿单 4：",
  db.prepare(
    "SELECT id, name, user_id FROM wishlists WHERE id = ?"
  ).get(4)
);

console.log(
  db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()
);
db.close();