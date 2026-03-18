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

export const createBorrowRequest = mutation({
  args: {
    targetDept: v.string(),
    targetSubunit: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    count: v.number(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (currentUser.role !== "DepartmentHead" && currentUser.role !== "SuperAdmin") {
      throw new Error("Only Department Heads can request help");
    }

    // Find the target department head
    const targetDeptHead = await ctx.db
      .query("users")
      .withIndex("by_church", (q) => q.eq("churchId", currentUser.churchId!))
      .filter((q) => q.and(q.eq(q.field("role"), "DepartmentHead"), q.eq(q.field("department"), args.targetDept)))
      .first();

    if (!targetDeptHead) throw new Error("Target department head not found");

    const requestId = await ctx.db.insert("borrowRequests", {
      churchId: currentUser.churchId!,
      requestingDeptHeadId: currentUser._id,
      targetDeptHeadId: targetDeptHead._id,
      targetDept: args.targetDept,
      targetSubunit: args.targetSubunit,
      startDate: args.startDate,
      endDate: args.endDate,
      count: args.count,
      role: args.role,
      status: "pending",
    });

    // Notify target dept head
    await ctx.db.insert("notifications", {
      userId: targetDeptHead._id,
      title: "Help Requested",
      message: `${currentUser.department} department is requesting ${args.count} ${args.role}s for ${args.targetSubunit}.`,
      type: "borrow_request",
      read: false,
    });

    return requestId;
  },
});

export const approveBorrow = mutation({
  args: {
    requestId: v.id("borrowRequests"),
    volunteerIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    if (currentUser._id !== request.targetDeptHeadId && currentUser.role !== "SuperAdmin") {
      throw new Error("Unauthorized to approve this request");
    }

    await ctx.db.patch(args.requestId, {
      status: "approved",
      volunteers: args.volunteerIds,
    });

    // Create assignments for volunteers
    for (const vId of args.volunteerIds) {
      await ctx.db.insert("borrowAssignments", {
        userId: vId,
        requestId: args.requestId,
        churchId: currentUser.churchId!,
        startDate: request.startDate,
        endDate: request.endDate,
        status: "pending",
      });

      // Notify volunteer
      await ctx.db.insert("notifications", {
        userId: vId,
        title: "Borrow Request",
        message: `You have been requested to help in the ${request.targetDept} department (${request.targetSubunit}) from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}.`,
        type: "borrow_assignment_pending",
        read: false,
      });
    }

    // Notify requesting dept head
    await ctx.db.insert("notifications", {
      userId: request.requestingDeptHeadId,
      title: "Borrow Request Approved",
      message: `Your request for help has been approved. Waiting for volunteers to accept.`,
      type: "borrow_request_approved",
      read: false,
    });
  },
});

export const respondToAssignment = mutation({
  args: {
    assignmentId: v.id("borrowAssignments"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment || assignment.userId !== currentUser._id) {
      throw new Error("Assignment not found or unauthorized");
    }

    const status = args.accept ? "active" : "declined";
    await ctx.db.patch(args.assignmentId, { status });

    if (args.accept) {
      await ctx.db.patch(currentUser._id, { isBorrowed: true });
    }

    const request = await ctx.db.get(assignment.requestId);
    if (request) {
      // Notify requesting dept head
      await ctx.db.insert("notifications", {
        userId: request.requestingDeptHeadId,
        title: args.accept ? "Volunteer Accepted" : "Volunteer Declined",
        message: `${currentUser.name} has ${args.accept ? "accepted" : "declined"} the borrow assignment.`,
        type: args.accept ? "borrow_accepted" : "borrow_declined",
        read: false,
      });
    }
  },
});

export const getActiveBorrowRequests = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("borrowRequests")
      .withIndex("by_church", (q) => q.eq("churchId", currentUser.churchId!))
      .filter((q) => q.neq(q.field("status"), "expired"))
      .collect();
  },
});

export const autoExpire = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Expire assignments
    const activeAssignments = await ctx.db
      .query("borrowAssignments")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const assignment of activeAssignments) {
      if (assignment.endDate < now) {
        await ctx.db.patch(assignment._id, { status: "expired" });
        await ctx.db.patch(assignment.userId, { isBorrowed: false });
        
        await ctx.db.insert("notifications", {
          userId: assignment.userId,
          title: "Borrow Period Ended",
          message: "Your temporary assignment has ended. You have returned to your original department.",
          type: "borrow_expired",
          read: false,
        });
      }
    }

    // Expire requests
    const activeRequests = await ctx.db
      .query("borrowRequests")
      .filter((q) => q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "approved"), q.eq(q.field("status"), "active")))
      .collect();

    for (const request of activeRequests) {
      if (request.endDate < now) {
        await ctx.db.patch(request._id, { status: "expired" });
      }
    }
  },
});
