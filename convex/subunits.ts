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
