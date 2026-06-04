import { prisma, withDatabase } from "@/lib/db/client";
import { verifyPassword } from "@/lib/security/password";
import { demoRoleForEmail, setSessionCookie, type CurrentUser } from "./session";

const demoEmails = new Set([
  "agency@nss.local",
  "owner@nss.local",
  "manager@nss.local",
  "cashier@nss.local",
  "inventory@nss.local",
  "accountant@nss.local",
  "viewer@nss.local"
]);

export async function loginWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!prisma) {
    if (!demoEmails.has(normalizedEmail) || password !== "Namdhari@123") {
      return { ok: false, message: "Invalid email or password." };
    }

    const demoUser: CurrentUser = {
      id: `demo-${normalizedEmail}`,
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0]?.replaceAll(".", " ") ?? "Demo User",
      roleKey: demoRoleForEmail(normalizedEmail)
    };
    await setSessionCookie(demoUser);
    return { ok: true, user: demoUser };
  }

  return withDatabase(
    async (client) => {
      const user = await client.user.findFirst({
        where: {
          email: normalizedEmail,
          active: true
        },
        include: {
          role: true
        }
      });

      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return { ok: false, message: "Invalid email or password." };
      }

      await client.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      const currentUser: CurrentUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        roleKey: user.role.key
      };

      await setSessionCookie(currentUser);
      return { ok: true, user: currentUser };
    },
    { ok: false, message: "Database is not reachable. Try demo mode or verify DATABASE_URL." }
  );
}
