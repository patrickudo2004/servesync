import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const getSubunits = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user?.churchId) return [];

    return await ctx.db
      .query("subunits")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .collect();
  },
});

export const createSubunit = mutation({
  args: {
    name: v.string(),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.churchId) throw new Error("User has no church");

    return await ctx.db.insert("subunits", {
      churchId: user.churchId,
      name: args.name,
      department: args.department,
    });
  },
});

export const updateSubunit = mutation({
  args: {
    id: v.id("subunits"),
    name: v.optional(v.string()),
    leadId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "SuperAdmin") throw new Error("Unauthorized");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteSubunit = mutation({
  args: { id: v.id("subunits") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== "SuperAdmin") throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

export const getLiveAttendance = query({
  args: {
    serviceId: v.optional(v.id("services")),
    subunitId: v.optional(v.id("subunits")),
  },
  handler: async (ctx, args) => {
    if (!args.serviceId || !args.subunitId) return [];

    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId!))
      .collect();

    // Filter by subunit and fetch user details
    const results = [];
    for (const record of attendance) {
      const user = await ctx.db.get(record.userId);
      if (user?.subunit === args.subunitId) {
        results.push({
          ...record,
          user,
        });
      }
    }

    return results;
  },
});
