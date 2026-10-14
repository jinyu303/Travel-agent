import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/travel.db");

try {
  const columns = db.prepare("PRAGMA table_info(bookings)").all();

  if (!columns.some((column) => column.name === "status")) {
    db.exec(`
      ALTER TABLE bookings
      ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed'
      CHECK (status IN ('confirmed', 'cancelled'))
    `);
  }

  console.log(
    db.prepare(`
      SELECT id, user_id, listing_id, check_in, check_out, status
      FROM bookings
      ORDER BY id
    `).all()
  );
} finally {
  db.close();
}