import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

async function getAuthenticatedUser(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  return user;
}

export const assignOversight = mutation({
  args: {
    userId: v.id("users"),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "SuperAdmin") {
      throw new Error("Only SuperAdmins can assign Pastoral Oversight");
    }

    // Check if there's already an oversight for this department
    const existing = await ctx.db
      .query("users")
      .withIndex("by_church", (q) => q.eq("churchId", user.churchId!))
      .filter((q) => 
        q.and(
          q.eq(q.field("role"), "PastoralOversight"),
          q.eq(q.field("department"), args.department)
        )
      )
      .first();

    if (existing && existing._id !== args.userId) {
      throw new Error(`Department ${args.department} already has a Pastoral Oversight assigned.`);
    }

    await ctx.db.patch(args.userId, {
      role: "PastoralOversight",
      department: args.department,
    });
  },
});

export const escalateItem = mutation({
  args: {
    type: v.union(v.literal("probation"), v.literal("borrow"), v.literal("timeOff")),
    itemId: v.string(), // Generic ID string
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "PastoralOversight" && user.role !== "SuperAdmin") {
      throw new Error("Unauthorized to escalate items");
    }

    // In a real app, we'd update the specific item status or add an escalation record
    // For now, we'll send a notification to relevant parties
    const churchId = user.churchId!;
    
    // Notify SuperAdmin
    const superAdmin = await ctx.db
      .query("users")
      .withIndex("by_church", (q) => q.eq("churchId", churchId))
      .filter((q) => q.eq(q.field("role"), "SuperAdmin"))
      .first();

    if (superAdmin) {
      await ctx.db.insert("notifications", {
        userId: superAdmin._id,
        title: `Escalation: ${args.type.toUpperCase()}`,
        message: `Pastoral Oversight ${user.name} has escalated a ${args.type} item: ${args.note}`,
        type: "escalation",
        read: false,
      });
    }

    // If it's probation, we might extend it automatically
    if (args.type === "probation") {
      const probationId = args.itemId as any; // Cast for simplicity
      const probation = await ctx.db.get(probationId);
      if (probation) {
        await ctx.db.patch(probationId, {
          status: "extended",
          endDate: probation.endDate + (30 * 24 * 60 * 60 * 1000), // Extend by 30 days
        });
      }
    }
  },
});

export const postOversightMessage = mutation({
  args: {
    channelId: v.id("channels"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "PastoralOversight") {
      throw new Error("Only Pastoral Oversight can post oversight messages");
    }

    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel not found");

    // Must be in their department
    if (channel.department !== user.department) {
      throw new Error("Unauthorized to post in this department's channels");
    }

    return await ctx.db.insert("messages", {
      channelId: args.channelId,
      userId: user._id,
      text: args.text,
      isPinned: true, // Oversight messages are pinned by default
      isOversight: true,
      createdAt: Date.now(),
    });
  },
});

export const getDepartmentHealth = query({
  args: { department: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "PastoralOversight" && user.role !== "SuperAdmin") {
      throw new Error("Unauthorized access to department health");
    }

    const churchId = user.churchId!;

    // 1. Attendance Average
    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_church", (q) => q.eq("churchId", churchId))
      .collect();
    
    // Filter by department (requires joining with users)
    const deptUsers = await ctx.db
      .query("users")
      .withIndex("by_church", (q) => q.eq("churchId", churchId))
      .filter((q) => q.eq(q.field("department"), args.department))
      .collect();
    
    const deptUserIds = new Set(deptUsers.map(u => u._id));
    const deptAttendance = attendance.filter(a => deptUserIds.has(a.userId));
    
    const presentCount = deptAttendance.filter(a => a.status === "Present").length;
    const attendanceRate = deptAttendance.length > 0 ? (presentCount / deptAttendance.length) * 100 : 0;

    // 2. Probation Status
    const probations = await ctx.db
      .query("probationPeriods")
      .withIndex("by_user") // Simplified query
      .collect();
    
    const deptProbations = probations.filter(p => deptUserIds.has(p.userId));
    const activeProbations = deptProbations.filter(p => p.status === "active").length;
    const extendedProbations = deptProbations.filter(p => p.status === "extended").length;

    // 3. Borrow Requests
    const borrowRequests = await ctx.db
      .query("borrowRequests")
      .withIndex("by_church", (q) => q.eq("churchId", churchId))
      .filter((q) => q.eq(q.field("targetDept"), args.department))
      .collect();
    
    const pendingBorrows = borrowRequests.filter(b => b.status === "pending").length;

    // 4. KPI Summary (Needs Improvement / Disapprove)
    const kpis = await ctx.db.query("kpiLogs").collect();
    const deptKpis = kpis.filter(k => deptUserIds.has(k.userId));
    const lowKpis = deptKpis.filter(k => k.score === "Needs Improvement" || k.score === "Disapprove").length;

    return {
      attendanceRate: Math.round(attendanceRate),
      activeProbations,
      extendedProbations,
      pendingBorrows,
      lowKpis,
      volunteerCount: deptUsers.length,
    };
  },
});
