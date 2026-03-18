import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Helper to check permissions
async function checkRole(ctx: any, requiredRoles: string[]) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || !requiredRoles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

export const createInvite = mutation({
  args: {
    email: v.string(),
    role: v.string(),
    department: v.optional(v.string()),
    subunit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkRole(ctx, ["SuperAdmin", "DepartmentHead"]);
    
    // DeptHead can only invite to their own department
    if (user.role === "DepartmentHead" && args.department !== user.department) {
      throw new Error("You can only invite to your own department");
    }

    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const inviteId = await ctx.db.insert("invites", {
      email: args.email,
      churchId: user.churchId!,
      invitedBy: user._id,
      role: args.role,
      department: args.department,
      subunit: args.subunit,
      token,
      expiresAt,
      status: "pending",
    });

    // In a real app, trigger an email action here
    return inviteId;
  },
});

export const bulkInvite = mutation({
  args: {
    emails: v.array(v.string()),
    role: v.string(),
    department: v.optional(v.string()),
    subunit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkRole(ctx, ["SuperAdmin", "DepartmentHead"]);
    
    for (const email of args.emails) {
      const token = Math.random().toString(36).substring(2, 15);
      await ctx.db.insert("invites", {
        email,
        churchId: user.churchId!,
        invitedBy: user._id,
        role: args.role,
        department: args.department,
        subunit: args.subunit,
        token,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        status: "pending",
      });
    }
  },
});

export const acceptInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invite || invite.status !== "pending") throw new Error("Invalid or expired invite");
    if (invite.expiresAt < Date.now()) {
      await ctx.db.patch(invite._id, { status: "expired" });
      throw new Error("Invite has expired");
    }

    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Please sign in to accept invite");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, {
      churchId: invite.churchId,
      role: invite.role as any,
      department: invite.department,
      subunit: invite.subunit,
    });

    await ctx.db.patch(invite._id, { status: "accepted" });

    return { churchId: invite.churchId };
  },
});

export const promoteUser = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await checkRole(ctx, ["SuperAdmin", "DepartmentHead"]);
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    // Hierarchy check
    const roles = ["Volunteer", "SubunitLead", "DepartmentHead", "SuperAdmin"];
    if (roles.indexOf(admin.role) <= roles.indexOf(targetUser.role) && admin.role !== "SuperAdmin") {
      throw new Error("You cannot promote someone of equal or higher rank");
    }

    await ctx.db.patch(args.userId, { role: args.newRole as any });

    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: "Promotion!",
      message: `You have been promoted to ${args.newRole}`,
      type: "promotion",
      read: false,
    });
  },
});

export const revokeInvite = mutation({
  args: { inviteId: v.id("invites") },
  handler: async (ctx, args) => {
    await checkRole(ctx, ["SuperAdmin", "DepartmentHead"]);
    await ctx.db.patch(args.inviteId, { status: "revoked" });
  },
});

export const getInvites = query({
  handler: async (ctx) => {
    const user = await checkRole(ctx, ["SuperAdmin", "DepartmentHead"]);
    return await ctx.db
      .query("invites")
      .filter((q) => q.eq(q.field("churchId"), user.churchId))
      .collect();
  },
});
