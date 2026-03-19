import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const createService = mutation({
  args: {
    name: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.churchId) throw new Error("User has no church");

    return await ctx.db.insert("services", {
      churchId: user.churchId,
      name: args.name,
      startTime: args.startTime,
      endTime: args.endTime,
      qrCodeSecret: Math.random().toString(36).substring(2, 12).toUpperCase(),
    });
  },
});

export const getNextService = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.churchId) return null;

    const now = Date.now();
    return await ctx.db
      .query("services")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .filter((q) => q.gt(q.field("endTime"), now))
      .order("asc")
      .first();
  },
});

export const getChurchServices = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user?.churchId) return [];

    return await ctx.db
      .query("services")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .order("desc")
      .collect();
  },
});
