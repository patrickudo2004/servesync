import Google from "@auth/core/providers/google";
import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut } = convexAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Email({
      id: "magic-link",
      async sendVerificationRequest(params) {
        console.log(`Magic link requested for ${params.identifier}`);
        // In a real app, send email here
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }
      return ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name,
        image: args.profile.picture || args.profile.image,
        role: "Volunteer",
        onboardingCompleted: false,
      });
    },
  },
});
