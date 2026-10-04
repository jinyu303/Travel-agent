import { searchListings } from "@/lib/listings";

export function GET(request: Request) {
  const location = new URL(request.url).searchParams.get("location");
  const rows = searchListings(location);

  return Response.json(rows);
}