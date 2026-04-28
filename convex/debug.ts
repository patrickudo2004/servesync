import { query } from "./_generated/server";

export const debugTrends = query({
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    const attendance = await ctx.db.query("attendance").collect();
    
    const invalidServices = services.filter(s => typeof s.startTime !== "number" || !s.name);
    const invalidAttendance = attendance.filter(a => !["Present", "Late", "Excused"].includes(a.status));
    
    return {
      totalServices: services.length,
      totalAttendance: attendance.length,
      invalidServices: invalidServices.map(s => s._id),
      invalidAttendance: invalidAttendance.map(a => a._id),
      sampleService: services[0],
      sampleAttendance: attendance[0],
    };
  }
});
