import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.reportExportLog.deleteMany(),
    prisma.ledgerEntry.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.stockMovement.deleteMany(),
    prisma.milkCollection.deleteMany(),
    prisma.salaryPayment.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.farmer.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.product.deleteMany()
  ]);

  console.log("Business data reset complete. Users, roles, permissions, and business settings were kept.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
