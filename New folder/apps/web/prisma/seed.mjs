import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@fumgpt.local" },
    update: {},
    create: {
      email: "demo@fumgpt.local",
      phone: "09000000000",
      profile: {
        create: {
          displayName: "کاربر نمونه",
          firstName: "نمونه",
          lastName: "فام"
        }
      },
      authIdentities: {
        create: {
          provider: "mock-password",
          providerUserId: "demo@fumgpt.local",
          identifier: "demo@fumgpt.local",
          isPrimary: true
        }
      }
    }
  });

  const openCart = await prisma.cart.create({
    data: {
      userId: user.id,
      currency: "IRR",
      items: {
        create: [
          {
            productSlug: "demo-subscription",
            titleSnapshot: "اشتراک نمونه",
            unitPrice: 220000,
            quantity: 1
          }
        ]
      }
    },
    include: {
      items: true
    }
  });

  await prisma.supportRequest.create({
    data: {
      userId: user.id,
      status: "open",
      channel: "seed",
      name: "کاربر نمونه",
      email: "demo@fumgpt.local",
      phone: "09000000000",
      subject: "درخواست تست محلی",
      message: "این رکورد برای تست مسیر دیتابیس در محیط توسعه ساخته شده است."
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "seed.created",
      entityType: "cart",
      entityId: openCart.id,
      details: "Local development seed created a sample user, cart, and support request."
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
