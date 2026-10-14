import { searchListings } from "@/lib/listings";
import {
  listWishlistsByUser,
  addWishlistItem,
} from "@/lib/wishlists";
import { searchAvailableListings } from "@/lib/listing-availability";
import { getStayNights, getBusinessToday } from "@/lib/booking-dates";


// 执行模型提出的工具调用
// userId 必须由服务器验证当前会话后传入
export function executeAgentTool(
  userId: number,
  name: string,
  args: unknown
) {
  if (
    !args ||
    typeof args !== "object" ||
    Array.isArray(args)
  ) {
    return { ok: false, error: "工具参数必须是对象" };
  }

  const params = args as Record<string, unknown>;

  switch (name) {
    case "search_listings": {
      if (
        typeof params.location !== "string" ||
        params.location.trim().length === 0 ||
        params.location.trim().length > 100
      ) {
        return { ok: false, error: "地点参数不合法" };
      }
      if (
        params.maxPrice !== undefined &&
        (
          typeof params.maxPrice !== "number" ||
          !Number.isSafeInteger(params.maxPrice) ||
          params.maxPrice < 0
        )
      ) {
        return { ok: false, error: "每晚预算不合法" };
      }

      if (
        params.guests !== undefined &&
        (
          typeof params.guests !== "number" ||
          !Number.isSafeInteger(params.guests) ||
          params.guests < 1
        )
      ) {
        return { ok: false, error: "人数不合法" };
      }

      if (
        params.propertyType !== undefined &&
        (
          typeof params.propertyType !== "string" ||
          !["公寓", "民宿", "别墅"].includes(params.propertyType)
        )
      ) {
        return { ok: false, error: "房源类型不合法" };
      }

      if (params.checkIn !== undefined || params.checkOut !== undefined) {
        if (
          typeof params.checkIn !== "string" ||
          typeof params.checkOut !== "string" ||
          getStayNights(params.checkIn, params.checkOut) === null ||
          params.checkIn < getBusinessToday()
        ) {
          return { ok: false, error: "入住或退房日期不合法" };
        }
      }
      
      const listings = searchAvailableListings(params.location.trim(), {
        maxPrice: params.maxPrice,
        guests: params.guests,
        propertyType: params.propertyType,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
      });

      return { ok: true, listings };
      
    }

    case "list_wishlists": {
      const wishlists = listWishlistsByUser(userId);
      return { ok: true, wishlists };
    }

    case "add_wishlist_item": {
      if (
        typeof params.wishlistId !== "number" ||
        typeof params.listingId !== "number" ||
        !Number.isSafeInteger(params.wishlistId) ||
        params.wishlistId < 1 ||
        !Number.isSafeInteger(params.listingId) ||
        params.listingId < 1
      ) {
        return { ok: false, error: "收藏编号不合法" };
      }

      const result = addWishlistItem(
            userId,
            params.wishlistId,
            params.listingId
        );

      return result ;
    }

    default:
      return { ok: false, error: "不支持的工具" };
  }
}