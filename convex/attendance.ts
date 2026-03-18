import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkMilestonesInternal } from "./recognition";

// Helper for geofence distance calculation (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const markAttendance = mutation({
  args: {
    serviceId: v.id("services"),
    qrSecret: v.string(),
    lat: v.number(),
    lng: v.number(),
    accuracy: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const church = await ctx.db.get(user.churchId);
    if (!church) throw new Error("Church not found");

    // 1. Verify QR Secret
    if (service.qrCodeSecret !== args.qrSecret) {
      throw new Error("Invalid or expired QR code");
    }

    // 2. Verify Time Window (e.g. 30 mins before start to 30 mins after end)
    const now = Date.now();
    const windowMs = (church.settings.attendanceWindowMinutes || 30) * 60 * 1000;
    if (now < service.startTime - windowMs || now > service.endTime + windowMs) {
      throw new Error("Attendance window is closed");
    }

    // 3. Verify Geofence
    const distance = calculateDistance(
      args.lat,
      args.lng,
      church.location.lat,
      church.location.lng
    );

    if (distance > (church.settings.geofenceRadius || 100)) {
      throw new Error(`You are too far from the church (${Math.round(distance)}m away)`);
    }

    // 4. Check if already marked
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    // 5. Determine Status (Late vs Present)
    const status = now > service.startTime + 15 * 60 * 1000 ? "Late" : "Present";

    const attendanceId = await ctx.db.insert("attendance", {
      serviceId: args.serviceId,
      userId: args.userId,
      churchId: user.churchId,
      timestamp: now,
      method: "QR",
      markedById: args.userId,
      location: {
        lat: args.lat,
        lng: args.lng,
        accuracy: args.accuracy,
      },
      status,
    });

    await checkMilestonesInternal(ctx, args.userId);

    return attendanceId;
  },
});

export const manualMark = mutation({
  args: {
    serviceId: v.id("services"),
    userId: v.id("users"),
    status: v.union(v.literal("Present"), v.literal("Late"), v.literal("Excused")),
    markedById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const marker = await ctx.db.get(args.markedById);
    if (!marker || !["SuperAdmin", "DepartmentHead", "SubunitLead"].includes(marker.role)) {
      throw new Error("Unauthorized to mark attendance manually");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const attendanceId = await ctx.db.insert("attendance", {
      serviceId: args.serviceId,
      userId: args.userId,
      churchId: user.churchId,
      timestamp: Date.now(),
      method: "Manual",
      markedById: args.markedById,
      status: args.status,
    });

    await checkMilestonesInternal(ctx, args.userId);

    return attendanceId;
  },
});

export const getServiceAttendance = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendance")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .collect();
  },
});
