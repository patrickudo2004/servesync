import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const createChurch = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
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
      location: args.location,
    });

    // Seed default badges for the new church
    await ctx.db.insert("badges", {
      churchId,
      name: "3-Month Streak",
      description: "Served for 3 consecutive months",
      icon: "Flame",
      type: "milestone",
      requirementType: "streak",
      requirementValue: 12,
    });
    // (Adding more directly for efficiency in this mutation)

    await ctx.db.patch(userId, {
      churchId,
      role: "SuperAdmin",
      onboardingCompleted: true,
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

export const getChurchStats = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.churchId || user.role !== "SuperAdmin") return null;

    const users = await ctx.db
      .query("users")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .collect();

    const subunits = await ctx.db
      .query("subunits")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .collect();

    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .collect();

    return {
      totalVolunteers: users.length,
      totalSubunits: subunits.length,
      totalAttendanceRecords: attendance.length,
    };
  },
});

export const getOrganogram = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.churchId) return null;

    const church = await ctx.db.get(user.churchId);
    if (!church) return null;

    const allUsers = await ctx.db
      .query("users")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .collect();

    const subunits = await ctx.db
      .query("subunits")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .collect();

    const depts = new Set(subunits.map(s => s.department));
    
    return {
      id: church._id,
      name: church.name,
      role: "SuperAdmin" as const,
      children: Array.from(depts).map(deptName => ({
        id: deptName,
        name: deptName,
        role: "DepartmentHead" as const,
        children: subunits
          .filter(s => s.department === deptName)
          .map(s => ({
            id: s._id,
            name: s.name,
            role: "SubunitLead" as const,
            children: allUsers
              .filter(u => u.subunit === s._id)
              .map(u => ({
                id: u._id,
                name: u.name || "Unknown Volunteer",
                role: u.role as any,
              }))
          }))
      }))
    };
  },
});
