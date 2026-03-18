import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const createChurch = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if slug is taken
    const existing = await ctx.db
      .query("churches")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("Church URL already taken");

    const churchId = await ctx.db.insert("churches", {
      name: args.name,
      slug: args.slug,
      address: args.address,
      logoStorageId: args.logoStorageId,
      superAdminId: userId,
    });

    await ctx.db.patch(userId, {
      churchId,
      role: "SuperAdmin",
      onboardingCompleted: true, // SuperAdmin completes onboarding during creation
    });

    return churchId;
  },
});

export const getMyChurch = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.churchId) return null;
    return await ctx.db.get(user.churchId);
  },
});
