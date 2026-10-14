import { DatabaseSync } from "node:sqlite";


// 返回符合地点条件的房源
export type ListingFilters = {
  maxPrice?: number;
  guests?: number;
  propertyType?: string;
};

export function searchListings(
  location?: string | null,
  filters: ListingFilters = {}
) {
  if (
    filters.maxPrice !== undefined &&
    (!Number.isSafeInteger(filters.maxPrice) || filters.maxPrice < 0)
  ) {
    throw new Error("每晚预算必须是非负整数");
  }

  if (
    filters.guests !== undefined &&
    (!Number.isSafeInteger(filters.guests) || filters.guests < 1)
  ) {
    throw new Error("人数必须是正整数");
  }

  if (
    filters.propertyType !== undefined &&
    !["公寓", "民宿", "别墅"].includes(filters.propertyType)
  ) {
    throw new Error("房源类型不合法");
  }

  const db = new DatabaseSync("data/travel.db");

  try {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (location?.trim()) {
      conditions.push("location = ?");
      params.push(location.trim());
    }

    if (filters.maxPrice !== undefined) {
      conditions.push("price_per_night <= ?");
      params.push(filters.maxPrice);
    }

    if (filters.guests !== undefined) {
      conditions.push("max_guests >= ?");
      params.push(filters.guests);
    }

    if (filters.propertyType !== undefined) {
      conditions.push("property_type = ?");
      params.push(filters.propertyType);
    }

    let sql = "SELECT * FROM listings";

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY price_per_night ASC, id ASC";

    return db.prepare(sql).all(...params);
  } finally {
    db.close();
  }
}


{/*id 查询 */}
export function getListingById(id: number){
  const db = new DatabaseSync("data/travel.db");

  try {
    return db
      .prepare("SELECT * FROM listings WHERE id = ?")
      .get(id);
  } finally {
    db.close();
  }
}