import { DatabaseSync } from "node:sqlite";

// 创建属于指定用户的心愿单
export function createWishlist(userId: number, name: string) {
  const db = new DatabaseSync("data/travel.db");

  try {
    // 插入 name、user_id 两个字段
    // 使用两个 ?，依次绑定 name、userId
    // 将 .run(...) 的返回值保存为 result
    const result = db
        .prepare("INSERT INTO wishlists (name, user_id) VALUES (?, ?)")
        .run(name,userId);


    const wishlist = db
      .prepare(
        "SELECT id, name, user_id FROM wishlists WHERE id = ?"
      )
      .get(result.lastInsertRowid);

    if (!wishlist) {
      throw new Error("创建后未能查询到心愿单");
    }

    return {
      id: Number(wishlist.id),
      name: String(wishlist.name),
      userId: Number(wishlist.user_id),
    };
  } finally {
    db.close();
  }
}

// 查询指定用户拥有的心愿单
export function listWishlistsByUser(userId: number) {
  const db = new DatabaseSync("data/travel.db");

  try {
    // 查询 id、name、user_id
    // 从 wishlists 中筛选 user_id = ?
    // 使用 .all(userId)，把结果保存为 rows

    const rows = db
      .prepare("SELECT id, name, user_id FROM wishlists WHERE user_id = ?")
      .all(userId);

    return rows;
  } finally {
    db.close();
  }
}


// 将房源加入当前用户拥有的心愿单
export function addWishlistItem(
  userId: number,
  wishlistId: number,
  listingId: number
) {
  const db = new DatabaseSync("data/travel.db");

  try {
    const wishlist = db
    .prepare("SELECT id FROM wishlists WHERE id = ? AND user_id = ?")
    .get(wishlistId, userId);

    if (!wishlist) {
      return { ok: false, error: "心愿单不存在或无权操作" };
    }

    const listing = db
      .prepare("SELECT id FROM listings WHERE id = ?")
      .get(listingId);

    if (!listing) {
      return { ok: false, error: "房源不存在" };
    }

      // TODO 2：使用 .run(...) 绑定 wishlistId、listingId
        const result = db
      .prepare(`
        INSERT INTO wishlist_items (wishlist_id, listing_id)
        VALUES (?, ?)
        ON CONFLICT(wishlist_id, listing_id) DO NOTHING
      `)
      .run(wishlistId, listingId);

    return {
      ok: true,
      added: result.changes === 1,
    };
  } finally {
    db.close();
  }
}




// 查询当前用户拥有的心愿单及其收藏房源
export function getWishlistWithListings(
  userId: number,
  wishlistId: number
) {
  const db = new DatabaseSync("data/travel.db");

  try {
    const wishlist = db
      .prepare(
        "SELECT id, name FROM wishlists WHERE id = ? AND user_id = ?"
      )
      .get(wishlistId, userId);

    if (!wishlist) {
      return null;
    }

    const listings = db
      .prepare(`
        SELECT
          listings.id,
          listings.name,
          listings.location,
          listings.price_per_night
        FROM wishlist_items
        JOIN listings
          ON listings.id = wishlist_items.listing_id
        WHERE wishlist_items.wishlist_id = ?
      `)
      .all(wishlistId);

    return { wishlist, listings };
  } finally {
    db.close();
  }
}



// 从当前用户拥有的心愿单中移除指定房源
export function removeWishlistItem(
  userId: number,
  wishlistId: number,
  listingId: number
) {
  const db = new DatabaseSync("data/travel.db");

  try {
    const wishlist = db
      .prepare(
        "SELECT id FROM wishlists WHERE id = ? AND user_id = ?"
      )
      .get(wishlistId, userId);

    if (!wishlist) {
      return {
        ok: false,
        error: "心愿单不存在或无权操作",
      };
    }

    const result = db
      .prepare(
        "DELETE FROM wishlist_items WHERE wishlist_id = ? AND listing_id = ?"
      )
      .run(wishlistId, listingId);

    return {
      ok: true,
      removed: result.changes === 1,
    };
  } finally {
    db.close();
  }
}



// 删除当前用户拥有的心愿单及其收藏关联
export function deleteWishlist(
  userId: number,
  wishlistId: number
) {
  const db = new DatabaseSync("data/travel.db");

  try {
    db.exec("BEGIN IMMEDIATE");

    try {
      const wishlist = db
        .prepare(
          "SELECT id FROM wishlists WHERE id = ? AND user_id = ?"
        )
        .get(wishlistId, userId);

      if (!wishlist) {
        db.exec("ROLLBACK");

        return {
          ok: false,
          error: "心愿单不存在或无权操作",
        };
      }

      db.prepare("DELETE FROM wishlist_items WHERE wishlist_id = ?").run(wishlistId);

      const result = db
      .prepare("DELETE FROM wishlists WHERE id = ? AND user_id = ?")
      .run(wishlistId, userId);

      db.exec("COMMIT");

      return {
        ok: true,
        deleted: result.changes === 1,
      };
    } catch (error) {
      // 中途失败，撤销本次事务中的修改
      db.exec("ROLLBACK");
      throw error;
    }
  } finally {
    db.close();
  }
}