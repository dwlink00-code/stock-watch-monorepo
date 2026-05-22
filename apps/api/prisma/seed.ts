import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/utils/password.js";

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@stockwatch.dev" },
    update: {},
    create: {
      email: "demo@stockwatch.dev",
      name: "Demo User",
      passwordHash: await hashPassword("Password123"),
    },
  });

  console.log(`Seeded demo user ${demoUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
