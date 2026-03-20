import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

async function checkAdmin(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (user?.role !== "SuperAdmin") throw new Error("Unauthorized");
  return user;
}

export const createDepartment = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await checkAdmin(ctx);
    return await ctx.db.insert("departments", {
      churchId: user.churchId!,
      name: args.name,
    });
  },
});

export const getDepartments = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user?.churchId) return [];

    return await ctx.db
      .query("departments")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId))
      .collect();
  },
});

export const deleteDepartment = mutation({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    
    // Check if any subunits are using this department
    const subunits = await ctx.db
      .query("subunits")
      .withIndex("by_department", (q) => q.eq("departmentId", args.id))
      .collect();
    
    if (subunits.length > 0) {
      throw new Error("Cannot delete department with active subunits");
    }

    await ctx.db.delete(args.id);
  },
});

export const updateDepartmentHeads = mutation({
  args: {
    id: v.id("departments"),
    headId: v.optional(v.id("users")),
    assistantId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    await ctx.db.patch(args.id, {
      headId: args.headId,
      assistantId: args.assistantId,
    });
  },
});
