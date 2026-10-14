import { DatabaseSync } from "node:sqlite";
import { searchListings } from "@/lib/listings";
import type { ListingFilters } from "@/lib/listings";
import { getStayNights, getBusinessToday } from "@/lib/booking-dates";

export function searchAvailableListings(
  location: string,
  filters: ListingFilters & {
    checkIn?: string;
    checkOut?: string;
  } = {}
) {
  const { checkIn, checkOut } = filters;

  // 没有提供日期时，只执行原来的条件搜索
  if (checkIn === undefined && checkOut === undefined) {
    return searchListings(location, filters);
  }

  if (
    typeof checkIn !== "string" ||
    typeof checkOut !== "string" ||
    getStayNights(checkIn, checkOut) === null ||
    checkIn < getBusinessToday()
  ) {
    throw new Error("请提供合法且不早于今天的入住、退房日期");
  }

  const listings = searchListings(location, filters);
  const db = new DatabaseSync("data/travel.db");

  try {
    const occupied = db
      .prepare(`
        SELECT DISTINCT listing_id
        FROM bookings
        WHERE status = 'confirmed'
          AND check_in < ?
          AND check_out > ?
      `)
      .all(checkOut, checkIn);
      

    const occupiedIds = new Set(
      occupied.map((booking) => Number(booking.listing_id))
    );

    return listings.filter(
      (listing) => !occupiedIds.has(Number(listing.id))
    );
  } finally {
    db.close();
  }
}