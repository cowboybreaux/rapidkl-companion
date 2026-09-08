import fs from "node:fs";
import path from "node:path";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const feedDirectory = process.argv[2];
const batchSize = Number.parseInt(process.env.GTFS_BATCH_SIZE ?? "1000", 10);
if (!feedDirectory || !Number.isInteger(batchSize) || batchSize < 1) {
  console.error("Usage: DATABASE_URL=... npm run gtfs:seed -- /path/to/gtfs [--replace]"); process.exit(1);
}
const optional = (v) => v === "" || v == null ? null : v;
const integer = (v) => v == null || v === "" ? null : Number.parseInt(v, 10);
const decimal = (v) => v == null || v === "" ? null : Number(v);
const date = (v) => new Date(`${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}T00:00:00.000Z`);
const enabled = (v) => v === "1";
function seconds(time) {
  const match = /^(\d{1,3}):(\d{2}):(\d{2})$/.exec(time ?? "");
  if (!match) throw new Error(`Invalid GTFS time: ${time}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}
async function importCsv(fileName, mapRow, insert, required = true) {
  const file = path.join(feedDirectory, fileName);
  if (!fs.existsSync(file)) { if (required) throw new Error(`Missing GTFS file: ${fileName}`); return; }
  let batch = [], count = 0;
  const flush = async () => { if (batch.length) { await insert(batch); count += batch.length; batch = []; } };
  for await (const row of fs.createReadStream(file).pipe(csv())) {
    batch.push(mapRow(row));
    if (batch.length >= batchSize) await flush(); // bounded memory and stream backpressure
  }
  await flush(); console.log(`${fileName}: ${count} rows`);
}
async function main() {
  if (process.argv.includes("--replace")) {
    await prisma.stopTime.deleteMany(); await prisma.trip.deleteMany(); await prisma.calendar.deleteMany();
    await prisma.stop.deleteMany(); await prisma.route.deleteMany(); await prisma.agency.deleteMany();
  }
  await importCsv("agency.txt", r => ({ id: r.agency_id || "default", name: r.agency_name, url: optional(r.agency_url), timezone: r.agency_timezone }), data => prisma.agency.createMany({ data, skipDuplicates: true }), false);
  await importCsv("routes.txt", r => ({ id: r.route_id, agencyId: optional(r.agency_id), shortName: optional(r.route_short_name), longName: optional(r.route_long_name), type: integer(r.route_type), color: optional(r.route_color), textColor: optional(r.route_text_color) }), data => prisma.route.createMany({ data, skipDuplicates: true }));
  await importCsv("stops.txt", r => ({ id: r.stop_id, name: r.stop_name, latitude: decimal(r.stop_lat), longitude: decimal(r.stop_lon), parentStation: optional(r.parent_station) }), data => prisma.stop.createMany({ data, skipDuplicates: true }));
  await importCsv("calendar.txt", r => ({ serviceId: r.service_id, monday: enabled(r.monday), tuesday: enabled(r.tuesday), wednesday: enabled(r.wednesday), thursday: enabled(r.thursday), friday: enabled(r.friday), saturday: enabled(r.saturday), sunday: enabled(r.sunday), startDate: date(r.start_date), endDate: date(r.end_date) }), data => prisma.calendar.createMany({ data, skipDuplicates: true }));
  await importCsv("trips.txt", r => ({ id: r.trip_id, routeId: r.route_id, serviceId: r.service_id, headsign: optional(r.trip_headsign), directionId: integer(r.direction_id) }), data => prisma.trip.createMany({ data, skipDuplicates: true }));
  await importCsv("stop_times.txt", r => ({ tripId: r.trip_id, stopId: r.stop_id, stopSequence: integer(r.stop_sequence), arrivalTime: r.arrival_time, departureTime: r.departure_time, departureSeconds: seconds(r.departure_time), stopHeadsign: optional(r.stop_headsign) }), data => prisma.stopTime.createMany({ data, skipDuplicates: true }));
}
main().then(() => console.log("GTFS seed complete.")).catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
