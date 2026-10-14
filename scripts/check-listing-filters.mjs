import { searchListings } from "../src/lib/listings.ts";

const listings = searchListings("东京", {
  maxPrice: 700,
  guests: 2,
  propertyType: "公寓",
});

console.log(
  listings.map((listing) => ({
    id: listing.id,
    price: listing.price_per_night,
    capacity: listing.max_guests,
    type: listing.property_type,
  }))
);

console.log(
  "无匹配结果：",
  searchListings("东京", { maxPrice: 100 })
);