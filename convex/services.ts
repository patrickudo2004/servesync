import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const getChurchServices = query({
  args: { churchId: v.id("churches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_church", (q) => q.eq("churchId", args.churchId))
      .order("desc")
      .collect();
  },
});

export const createService = mutation({
  args: {
    name: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    qrType: v.union(v.literal("Unique"), v.literal("Generic")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.churchId) throw new Error("Church not found");

    // Generate a secure secret for QR code
    const qrCodeSecret = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);

    return await ctx.db.insert("services", {
      churchId: user.churchId,
      name: args.name,
      startTime: args.startTime,
      endTime: args.endTime,
      qrCodeSecret,
      qrType: args.qrType,
    });
  },
});

export const deleteService = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "SuperAdmin") throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
