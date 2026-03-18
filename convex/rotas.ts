import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRotaEntry = mutation({
  args: {
    serviceId: v.id("services"),
    subunitId: v.id("subunits"),
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rotas", {
      serviceId: args.serviceId,
      subunitId: args.subunitId,
      userId: args.userId,
      role: args.role,
      status: "Pending",
    });
  },
});

export const updateRotaStatus = mutation({
  args: {
    rotaId: v.id("rotas"),
    status: v.union(v.literal("Confirmed"), v.literal("Declined")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.rotaId, { status: args.status });
  },
});

export const getServiceRota = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rotas")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .collect();
  },
});
