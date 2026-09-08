import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const weekdayFilter = [
  { sunday: true }, { monday: true }, { tuesday: true }, { wednesday: true },
  { thursday: true }, { friday: true }, { saturday: true },
] as const;

export async function GET(request: NextRequest) {
  const stationId = request.nextUrl.searchParams.get("station_id")?.trim();
  if (!stationId) return NextResponse.json({ error: "station_id query parameter is required" }, { status: 400 });
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const station = await prisma.stop.findUnique({ where: { id: stationId }, select: { id: true, name: true } });
  if (!station) return NextResponse.json({ error: "Station not found" }, { status: 404 });
  const arrivals = await prisma.stopTime.findMany({
    where: { stopId: stationId, departureSeconds: { gte: secondsSinceMidnight }, trip: { calendar: { startDate: { lte: today }, endDate: { gte: today }, ...weekdayFilter[now.getDay()] } } },
    orderBy: { departureSeconds: "asc" }, take: 5,
    select: { arrivalTime: true, departureTime: true, stopHeadsign: true, trip: { select: { id: true, headsign: true, route: { select: { id: true, shortName: true, longName: true, color: true } } } } },
  });
  return NextResponse.json({ station, serverTime: now.toISOString(), arrivals });
}
