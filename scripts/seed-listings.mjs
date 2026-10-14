import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/travel.db");

const cities = ["东京", "厦门", "成都", "杭州", "大理", "上海"];
const types = ["公寓", "民宿", "别墅"];

try {
  db.exec("BEGIN");

  try {
    const insert = db.prepare(`
      INSERT INTO listings (
        id, name, location, price_per_night, max_guests,
        property_type, description, images, amenities,
        host_name, bedrooms, beds, bathrooms, rating, review_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `);

    // 保留已有编号 1、2，新数据使用 3～60
    for (let id = 3; id <= 60; id++) {
      const index = id - 3;
      const city = cities[index % cities.length];

      // 每轮城市更换一种类型，避免某城市始终只有一种类型
      const type = types[
        Math.floor(index / cities.length) % types.length
      ];

      const maxGuests = 2 + (index % 3) * 2;
      const beds = Math.ceil(maxGuests / 2);
      const bedrooms = Math.max(1, Math.ceil(beds / 2));
      const bathrooms = bedrooms > 1 ? 2 : 1;
      const price = 280 + (index * 73) % 1000;

      const images = [];
      const amenities = ["无线网络", "空调", "厨房"];

      // TODO 1：将 images 转为可保存的 JSON 文本
      const imagesJson = JSON.stringify(images);

      // TODO 2：将 amenities 转为可保存的 JSON 文本
      const amenitiesJson =JSON.stringify(amenities);

      insert.run(
        id,
        `${city}精选${type} ${id}`,
        city,
        price,
        maxGuests,
        type,
        `位于${city}的${type}，最多入住${maxGuests}人。此房源为考核项目演示数据。`,
        imagesJson,
        amenitiesJson,
        `示例房东 ${id}`,
        bedrooms,
        beds,
        bathrooms,
        Number((4.3 + (index % 7) / 10).toFixed(1)),
        10 + (index * 17) % 190
      );
    }

    // 为旧房源补介绍，不改原来的编号、名称、地点和价格
    db.prepare(`
      UPDATE listings
      SET description = '此房源为考核项目演示数据。',
          amenities = ?
      WHERE id IN (1, 2) AND description = ''
    `).run(JSON.stringify(["无线网络", "空调", "厨房"]));

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(
    "房源总数：",
    db.prepare("SELECT COUNT(*) AS total FROM listings").get()
  );

  console.log(
    "各地点数量：",
    db.prepare(`
      SELECT location, COUNT(*) AS total
      FROM listings
      GROUP BY location
      ORDER BY location
    `).all()
  );

  console.log(
    "示例房源：",
    db.prepare(`
      SELECT id, name, property_type, price_per_night,
             max_guests, images, amenities
      FROM listings WHERE id = 3
    `).get()
  );
} finally {
  db.close();
}