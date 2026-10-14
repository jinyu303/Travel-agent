import { DatabaseSync } from "node:sqlite";
import {
  getStayNights,
  getBusinessToday,
  MAX_STAY_NIGHTS,
} from "@/lib/booking-dates";

// 查询同一房源是否已有日期重叠的订单
// 调用前需要先校验日期
export function findConflictingBooking(
  listingId: number,
  checkIn: string,
  checkOut: string
) {
  const db = new DatabaseSync("data/travel.db");


  {/*冲突的条件是：
    已有订单的入住日期 < 新订单的退房日期
    已有订单的退房日期 > 新订单的入住日期   同时成立*/}


  try {
    const booking = db
      .prepare(`
        SELECT id
        FROM bookings
        WHERE listing_id = ?
          AND status = 'confirmed'
          AND check_in < ?
          AND check_out > ?
        LIMIT 1
      `)
      .get(listingId, checkOut, checkIn);

    return booking;
  } finally {
    db.close();
  }
}



// userId 必须由调用方验证登录状态后取得
export function createBooking(
  userId: number,
  listingId: number,
  checkIn: string,
  checkOut: string,
  guests: number
) {
  const nights = getStayNights(checkIn, checkOut);

  if (nights === null) {
    return { 
      ok: false, 
      error: `日期不合法：退房须晚于入住，且单次最多入住 ${MAX_STAY_NIGHTS} 晚`,
    };
  }

  if (
    !Number.isSafeInteger(userId) || userId < 1 ||
    !Number.isSafeInteger(listingId) || listingId < 1 ||
    !Number.isSafeInteger(guests) || guests < 1
  ) {
    return { ok: false, error: "编号或人数不合法" };
  }

  const today = getBusinessToday();

  if(checkIn < today){
        return { ok: false, error: "入住日期不能早于今天" }
  }

  const db = new DatabaseSync("data/travel.db");

  try {
    // 在本连接上启用外键约束
    db.exec("PRAGMA foreign_keys = ON");
    db.exec("BEGIN IMMEDIATE");

    try {
      const listing = db
        .prepare(`
            SELECT id, price_per_night, max_guests
            FROM listings
            WHERE id = ?
        `)
        .get(listingId);

      if (!listing) {
        db.exec("ROLLBACK");
        return { ok: false, error: "房源不存在" };
      }
      const maxGuests = Number(listing.max_guests);

      //人数检查
      if (guests > maxGuests) {
        db.exec("ROLLBACK");
        return { ok: false, error: "入住人数超过房源上限" };
      }
      

      const conflict = db
        .prepare(`
          SELECT id FROM bookings
          WHERE listing_id = ?
            AND status = 'confirmed'
            AND check_in < ?
            AND check_out > ?
          LIMIT 1
        `)
        .get(listingId, checkOut, checkIn);

      if (conflict) {
        db.exec("ROLLBACK");
        return { ok: false, error: "所选日期已被预订" };
      }

      const nightlyPrice = Number(listing.price_per_night);

      const totalPrice = nightlyPrice*nights;

      if (
        !Number.isSafeInteger(nightlyPrice) || nightlyPrice < 0 ||
        !Number.isSafeInteger(totalPrice) || totalPrice < 0
      ) {
        throw new Error("房源价格或订单总价不合法");
      }

      const createdAt = Date.now();

      const result = db
        .prepare(`
          INSERT INTO bookings (
            user_id, listing_id, check_in, check_out,
            guests, nights, nightly_price, total_price, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(userId, 
            listingId, 
            checkIn, 
            checkOut, 
            guests, 
            nights, 
            nightlyPrice, 
            totalPrice, 
            createdAt
        );
        

      const booking = db
        .prepare("SELECT * FROM bookings WHERE id = ?")
        .get(result.lastInsertRowid);
        

      if (!booking) {
        throw new Error("无法读取新创建的订单");
      }

      db.exec("COMMIT");

      return { ok: true, booking };
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } finally {
    db.close();
  }
}



// 查询指定用户的订单及房源信息
export function listBookingsByUser(userId: number) {
  const db = new DatabaseSync("data/travel.db");

  try {
    const bookings = db
      .prepare(`
        SELECT
          bookings.id,
          bookings.status,
          bookings.listing_id,
          bookings.check_in,
          bookings.check_out,
          bookings.guests,
          bookings.nights,
          bookings.nightly_price,
          bookings.total_price,
          listings.name AS listing_name,
          listings.location
        FROM bookings
        JOIN listings
          ON listings.id = bookings.listing_id
        WHERE bookings.user_id = ?
        ORDER BY bookings.created_at DESC, bookings.id DESC
      `)
      .all( userId);
      

    return bookings;
  } finally {
    db.close();
  }
}



export function cancelBooking(userId: number, bookingId: number) {
  const db = new DatabaseSync("data/travel.db");

  try {
    const booking = db
      .prepare("SELECT id FROM bookings WHERE id = ? AND user_id = ?")
      .get(bookingId, userId);

    if (!booking) {
      return { ok: false, error: "订单不存在或无权操作" };
    }

    const result = db
      .prepare(`
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ? AND user_id = ? AND status = 'confirmed'
      `)
      .run(bookingId, userId);

    return {
      ok: true,
      cancelled: result.changes === 1,
    };
  } finally {
    db.close();
  }
}