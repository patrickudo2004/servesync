import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    churchId: v.optional(v.id("churches")),
    role: v.union(
      v.literal("Volunteer"),
      v.literal("SubunitLead"),
      v.literal("DepartmentHead"),
      v.literal("PastoralOversight"),
      v.literal("Probation"),
      v.literal("OnNotice"),
      v.literal("SuperAdmin")
    ),
    department: v.optional(v.string()),
    subunit: v.optional(v.string()),
    availability: v.optional(v.any()), // JSON blob for 4-week calendar
    onboardingCompleted: v.boolean(),
    skills: v.optional(v.array(v.string())),
    additionalSubunits: v.optional(v.array(v.string())),
    isExtendedProbation: v.optional(v.boolean()),
    isBorrowed: v.optional(v.boolean()),
  }).index("by_email", ["email"])
    .index("by_church", ["churchId"]),
  
  churches: defineTable({
    name: v.string(),
    slug: v.string(), // unique identifier for URLs
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    address: v.optional(v.string()),
    superAdminId: v.id("users"),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    settings: v.optional(v.object({
      attendanceWindowMinutes: v.optional(v.number()),
      geofenceRadius: v.optional(v.number()),
      requireLeadApprovalForSwaps: v.optional(v.boolean()),
    })),
  }).index("by_slug", ["slug"]),

  services: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    qrCodeSecret: v.optional(v.string()),
  }).index("by_church", ["churchId"]),

  subunits: defineTable({
    churchId: v.id("churches"),
    department: v.string(),
    name: v.string(),
    leadId: v.optional(v.id("users")),
  }).index("by_church", ["churchId"]),

  rotas: defineTable({
    serviceId: v.id("services"),
    userId: v.id("users"),
    subunitId: v.id("subunits"),
    role: v.string(),
    status: v.union(v.literal("Pending"), v.literal("Confirmed"), v.literal("Declined")),
  }).index("by_service", ["serviceId"])
    .index("by_user", ["userId"]),

  attendance: defineTable({
    serviceId: v.id("services"),
    userId: v.id("users"),
    churchId: v.id("churches"),
    timestamp: v.number(),
    status: v.union(v.literal("Present"), v.literal("Late"), v.literal("Excused")),
    method: v.string(), // "QR" or "Manual"
    markedById: v.id("users"),
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      accuracy: v.number(),
    })),
  }).index("by_service", ["serviceId"])
    .index("by_user", ["userId"])
    .index("by_church", ["churchId"]),

  badges: defineTable({
    churchId: v.id("churches"),
    name: v.string(),
    description: v.string(),
    icon: v.string(), // Lucide icon name
    type: v.union(v.literal("milestone"), v.literal("custom")),
    requirementType: v.optional(v.string()), // "streak", "total_services", "total_hours"
    requirementValue: v.optional(v.number()),
  }).index("by_church", ["churchId"]),

  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    awardedAt: v.number(),
    awardedBy: v.optional(v.id("users")),
    churchId: v.id("churches"),
  }).index("by_user", ["userId"])
    .index("by_church", ["churchId"]),

  swapRequests: defineTable({
    rotaId: v.id("rotas"),
    requesterId: v.id("users"),
    claimantId: v.optional(v.id("users")),
    status: v.union(
      v.literal("available"), 
      v.literal("claimed"), 
      v.literal("approved"), 
      v.literal("declined"),
      v.literal("cancelled")
    ),
    note: v.optional(v.string()),
    churchId: v.id("churches"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_rota", ["rotaId"])
    .index("by_church_status", ["churchId", "status"]),

  probationPeriods: defineTable({
    userId: v.id("users"),
    churchId: v.id("churches"),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("extended"), v.literal("ended")),
    createdBy: v.id("users"), // Dept Head
  }).index("by_user", ["userId"]),

  kpiLogs: defineTable({
    probationId: v.id("probationPeriods"),
    userId: v.id("users"),
    loggerId: v.id("users"), // Subunit Lead
    date: v.number(),
    score: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Needs Improvement"), v.literal("Disapprove")),
    note: v.optional(v.string()),
  }).index("by_probation", ["probationId"]),

  borrowRequests: defineTable({
    churchId: v.id("churches"),
    requestingDeptHeadId: v.id("users"),
    targetDeptHeadId: v.id("users"),
    targetDept: v.string(),
    targetSubunit: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    count: v.number(),
    role: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("declined"), v.literal("active"), v.literal("expired")),
    volunteers: v.optional(v.array(v.id("users"))),
  }).index("by_church", ["churchId"]),

  borrowAssignments: defineTable({
    userId: v.id("users"),
    requestId: v.id("borrowRequests"),
    churchId: v.id("churches"),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("active"), v.literal("expired")),
  }).index("by_user", ["userId"]),

  invites: defineTable({
    email: v.string(),
    churchId: v.id("churches"),
    invitedBy: v.id("users"),
    role: v.string(),
    department: v.optional(v.string()),
    subunit: v.optional(v.string()),
    token: v.string(),
    expiresAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked"), v.literal("expired")),
  }).index("by_token", ["token"])
    .index("by_email_church", ["email", "churchId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    read: v.boolean(),
  }).index("by_user", ["userId"]),

  channels: defineTable({
    churchId: v.id("churches"),
    type: v.union(v.literal("announcement"), v.literal("department"), v.literal("subunit")),
    department: v.optional(v.string()),
    subunit: v.optional(v.string()),
    name: v.string(),
    isDisabled: v.boolean(),
  }).index("by_church", ["churchId"])
    .index("by_dept", ["churchId", "department"])
    .index("by_subunit", ["churchId", "department", "subunit"]),

  messages: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
    text: v.optional(v.string()),
    fileId: v.optional(v.id("fileUploads")),
    isPinned: v.boolean(),
    isOversight: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_channel", ["channelId"]),

  fileUploads: defineTable({
    storageId: v.id("_storage"),
    mimeType: v.string(),
    name: v.string(),
    size: v.number(),
    userId: v.id("users"),
  }),
});
