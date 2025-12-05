// db/index.js
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

// Define path for DB file
const file = path.resolve("db.json");
const adapter = new JSONFile(file);

// ✅ Initialize with default data schema right away
const defaultData = { domains: [], events: [] };

// Create the DB instance with defaults
export const db = new Low(adapter, defaultData);

// Initialize and ensure it's written at least once
export async function initDB() {
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
  console.log("📁 LowDB initialized at", file);
}