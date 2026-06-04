import bcrypt from "bcryptjs";
import { PrismaClient, type UserRoleKey } from "@prisma/client";

const prisma = new PrismaClient();

const password = "Namdhari@123";

const moduleKeys = [
  "dashboard",
  "business-settings",
  "users",
  "products",
  "invoices",
  "customers",
  "ledgers",
  "inventory",
  "farmers",
  "suppliers",
  "employees",
  "expenses",
  "payments",
  "reports",
  "audit-logs",
  "backup"
] as const;

const actions = ["view", "create", "update", "delete", "export"] as const;

const roleLabels: Record<UserRoleKey, string> = {
  SUPER_ADMIN: "Super Admin / Agency",
  OWNER: "Owner",
  MANAGER: "Manager",
  CASHIER: "Cashier",
  INVENTORY_STAFF: "Inventory Staff",
  ACCOUNTANT: "Accountant",
  READ_ONLY_STAFF: "Read-only Staff"
};

function permissionCodesFor(role: UserRoleKey) {
  if (role === "SUPER_ADMIN" || role === "OWNER") {
    return moduleKeys.flatMap((module) => actions.map((action) => `${module}:${action}`));
  }

  if (role === "MANAGER") {
    return [
      "dashboard:view",
      "products:view",
      "products:create",
      "products:update",
      "invoices:view",
      "invoices:create",
      "invoices:update",
      "customers:view",
      "customers:create",
      "customers:update",
      "inventory:view",
      "inventory:create",
      "inventory:update",
      "farmers:view",
      "farmers:create",
      "farmers:update",
      "suppliers:view",
      "suppliers:create",
      "suppliers:update",
      "employees:view",
      "employees:create",
      "employees:update",
      "reports:view",
      "reports:export"
    ];
  }

  if (role === "CASHIER") {
    return [
      "dashboard:view",
      "invoices:view",
      "invoices:create",
      "customers:view",
      "customers:create",
      "payments:view",
      "payments:create",
      "reports:view"
    ];
  }

  if (role === "INVENTORY_STAFF") {
    return [
      "dashboard:view",
      "products:view",
      "inventory:view",
      "inventory:create",
      "inventory:update",
      "suppliers:view",
      "reports:view",
      "reports:export"
    ];
  }

  if (role === "ACCOUNTANT") {
    return [
      "dashboard:view",
      "customers:view",
      "ledgers:view",
      "ledgers:create",
      "ledgers:update",
      "farmers:view",
      "suppliers:view",
      "employees:view",
      "expenses:view",
      "expenses:create",
      "expenses:update",
      "payments:view",
      "payments:create",
      "payments:update",
      "reports:view",
      "reports:export"
    ];
  }

  return moduleKeys.map((module) => `${module}:view`);
}

async function seedRolesAndUsers() {
  const permissions = [];

  for (const module of moduleKeys) {
    for (const action of actions) {
      permissions.push(
        await prisma.permission.upsert({
          where: { code: `${module}:${action}` },
          update: {},
          create: {
            code: `${module}:${action}`,
            label: `${action[0]?.toUpperCase()}${action.slice(1)} ${module.replaceAll("-", " ")}`,
            module
          }
        })
      );
    }
  }

  for (const roleKey of Object.keys(roleLabels) as UserRoleKey[]) {
    const codes = permissionCodesFor(roleKey);
    await prisma.role.upsert({
      where: { key: roleKey },
      update: {
        permissions: {
          set: permissions.filter((permission) => codes.includes(permission.code)).map((permission) => ({ id: permission.id }))
        }
      },
      create: {
        key: roleKey,
        name: roleLabels[roleKey],
        description: `${roleLabels[roleKey]} access profile`,
        permissions: {
          connect: permissions.filter((permission) => codes.includes(permission.code)).map((permission) => ({ id: permission.id }))
        }
      }
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const roles = await prisma.role.findMany();
  const roleId = (key: UserRoleKey) => roles.find((role) => role.key === key)?.id;

  const users = [
    ["agency@nss.local", "Agency Admin", "SUPER_ADMIN"],
    ["owner@nss.local", "Namdhari Owner", "OWNER"],
    ["manager@nss.local", "Shop Manager", "MANAGER"],
    ["cashier@nss.local", "Billing Counter", "CASHIER"],
    ["inventory@nss.local", "Store Keeper", "INVENTORY_STAFF"],
    ["accountant@nss.local", "Accounts Desk", "ACCOUNTANT"],
    ["viewer@nss.local", "Read Only Staff", "READ_ONLY_STAFF"]
  ] as const;

  for (const [email, name, roleKey] of users) {
    const id = roleId(roleKey);
    if (!id) continue;

    await prisma.user.upsert({
      where: { email },
      update: { name, roleId: id, active: true },
      create: {
        email,
        name,
        passwordHash,
        roleId: id,
        phone: "+91 98765 43210"
      }
    });
  }
}

async function seedBusinessSettings() {
  const existing = await prisma.businessSettings.findFirst();
  if (existing) return;

  await prisma.businessSettings.create({
    data: {
      businessName: "Namdhari Swaich Sweets",
      address: "Main Market, Punjab",
      phone: "+91 98765 43210",
      email: "owner@nss.local",
      gstin: "GSTIN-TO-BE-UPDATED",
      fssaiLicense: "FSSAI-TO-BE-UPDATED",
      invoicePrefix: "NSS",
      invoiceFooterTerms: "Goods once sold will not be returned. Thank you for choosing Namdhari Swaich Sweets.",
      upiPaymentDetails: "UPI: namdhari-sweets@bank",
      currency: "INR",
      defaultTaxRate: "5",
      themeColor: "#1c5a3e",
      branchName: "Main Branch",
      branchCode: "MAIN"
    }
  });
}

async function seedMasterData() {
  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "Fresh Paneer",
          category: "Dairy",
          sku: "NSS-PANEER-001",
          unit: "KG",
          sellingPrice: "360",
          costPrice: "250",
          taxRate: "5",
          wholesalePrice: "330",
          festivalPrice: "350",
          lowStockThreshold: "8"
        },
        {
          name: "Desi Ghee Laddu",
          category: "Sweets",
          sku: "NSS-LADDU-001",
          unit: "KG",
          sellingPrice: "620",
          costPrice: "410",
          taxRate: "5",
          wholesalePrice: "590",
          lowStockThreshold: "10"
        },
        {
          name: "Kaju Katli",
          category: "Premium Sweets",
          sku: "NSS-KAJU-001",
          unit: "KG",
          sellingPrice: "980",
          costPrice: "760",
          taxRate: "5",
          wholesalePrice: "930",
          festivalPrice: "950",
          lowStockThreshold: "5"
        },
        {
          name: "Rasgulla Box",
          category: "Packed Sweets",
          sku: "NSS-RAS-BOX",
          unit: "BOX",
          sellingPrice: "180",
          costPrice: "112",
          taxRate: "5",
          wholesalePrice: "165",
          lowStockThreshold: "20"
        }
      ]
    });
  }

  if ((await prisma.customer.count()) === 0) {
    await prisma.customer.createMany({
      data: [
        { name: "Gurpreet Singh", phone: "+91 98111 11001", address: "Sector Road", openingBalance: "1250" },
        { name: "Aman Caterers", phone: "+91 98111 11002", address: "Wedding Market", openingBalance: "4500" },
        { name: "Simran Kaur", phone: "+91 98111 11003", address: "Model Town", openingBalance: "0" }
      ]
    });
  }

  if ((await prisma.supplier.count()) === 0) {
    await prisma.supplier.createMany({
      data: [
        { name: "Punjab Dairy Inputs", phone: "+91 98222 22001", address: "Industrial Area", gstOrLicense: "GST-SUP-001", openingBalance: "7500" },
        { name: "Golden Packaging Co.", phone: "+91 98222 22002", address: "Packaging Market", openingBalance: "3200" }
      ]
    });
  }

  if ((await prisma.farmer.count()) === 0) {
    await prisma.farmer.createMany({
      data: [
        { name: "Baldev Singh", phone: "+91 98333 33001", villageAddress: "Village Bhaini", openingBalance: "2200" },
        { name: "Jaswinder Kaur", phone: "+91 98333 33002", villageAddress: "Village Kotla", openingBalance: "1400" },
        { name: "Harjit Singh", phone: "+91 98333 33003", villageAddress: "Village Swaich", openingBalance: "0" }
      ]
    });
  }

  if ((await prisma.employee.count()) === 0) {
    await prisma.employee.createMany({
      data: [
        {
          name: "Rohit Kumar",
          phone: "+91 98444 44001",
          address: "Near Bus Stand",
          designation: "Halwai",
          joiningDate: new Date("2024-04-01"),
          salaryType: "MONTHLY",
          salaryRate: "28000"
        },
        {
          name: "Meena Sharma",
          phone: "+91 98444 44002",
          address: "Main Bazar",
          designation: "Counter Staff",
          joiningDate: new Date("2025-01-15"),
          salaryType: "MONTHLY",
          salaryRate: "18000"
        }
      ]
    });
  }
}

async function seedOperationalData() {
  const owner = await prisma.user.findFirst({ where: { email: "owner@nss.local" } });
  const products = await prisma.product.findMany();
  const customers = await prisma.customer.findMany();
  const suppliers = await prisma.supplier.findMany();
  const farmers = await prisma.farmer.findMany();
  const employees = await prisma.employee.findMany();

  if ((await prisma.inventoryItem.count()) === 0) {
    const rawMilk = await prisma.inventoryItem.create({
      data: {
        name: "Raw Milk",
        type: "RAW_MATERIAL",
        unit: "LITRE",
        currentQuantity: "248",
        minimumQuantity: "100",
        costPerUnit: "46",
        supplierId: suppliers[0]?.id,
        notes: "Auto-updated by farmer milk collection entries."
      }
    });

    await prisma.inventoryItem.createMany({
      data: [
        {
          name: "Sugar",
          type: "RAW_MATERIAL",
          unit: "KG",
          currentQuantity: "82",
          minimumQuantity: "50",
          costPerUnit: "45",
          supplierId: suppliers[0]?.id
        },
        {
          name: "Paneer Ready Stock",
          type: "FINISHED_PRODUCT",
          unit: "KG",
          currentQuantity: "18",
          minimumQuantity: "8",
          costPerUnit: "250",
          productId: products.find((product) => product.sku === "NSS-PANEER-001")?.id
        },
        {
          name: "Rasgulla Boxes",
          type: "FINISHED_PRODUCT",
          unit: "BOX",
          currentQuantity: "14",
          minimumQuantity: "20",
          costPerUnit: "112",
          productId: products.find((product) => product.sku === "NSS-RAS-BOX")?.id
        }
      ]
    });

    await prisma.stockMovement.create({
      data: {
        inventoryItemId: rawMilk.id,
        movementType: "IN",
        quantity: "248",
        unitCost: "46",
        totalCost: "11408",
        movementDate: new Date(),
        notes: "Opening raw milk stock",
        createdById: owner?.id
      }
    });
  }

  if ((await prisma.invoice.count()) === 0 && customers[0] && products.length > 1) {
    const paneer = products.find((product) => product.sku === "NSS-PANEER-001") ?? products[0];
    const laddu = products.find((product) => product.sku === "NSS-LADDU-001") ?? products[1];
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: "NSS-2026-0001",
        customerId: customers[0].id,
        subtotal: "1600",
        discountTotal: "50",
        taxTotal: "77.50",
        total: "1627.50",
        paidAmount: "1000",
        dueAmount: "627.50",
        paymentMode: "MIXED",
        status: "PARTIAL",
        cashierId: owner?.id,
        notes: "Demo invoice with customer ledger due",
        items: {
          create: [
            {
              productId: paneer.id,
              productName: paneer.name,
              quantity: "2",
              unit: paneer.unit,
              price: "360",
              discount: "0",
              taxRate: "5",
              taxAmount: "36",
              lineTotal: "756"
            },
            {
              productId: laddu.id,
              productName: laddu.name,
              quantity: "1.4",
              unit: laddu.unit,
              price: "620",
              discount: "50",
              taxRate: "5",
              taxAmount: "41.50",
              lineTotal: "871.50"
            }
          ]
        }
      }
    });

    const payment = await prisma.payment.create({
      data: {
        paymentFor: "INVOICE",
        direction: "IN",
        mode: "UPI",
        amount: "1000",
        paymentDate: new Date(),
        invoiceId: invoice.id,
        customerId: customers[0].id,
        createdById: owner?.id,
        referenceNumber: "UPI-DEMO-1001",
        notes: "Partial invoice payment"
      }
    });

    await prisma.ledgerEntry.createMany({
      data: [
        {
          ownerType: "CUSTOMER",
          entryType: "DEBIT",
          amount: "1627.50",
          description: "Invoice NSS-2026-0001",
          customerId: customers[0].id,
          invoiceId: invoice.id
        },
        {
          ownerType: "CUSTOMER",
          entryType: "CREDIT",
          amount: "1000",
          description: "Payment received for NSS-2026-0001",
          customerId: customers[0].id,
          invoiceId: invoice.id,
          paymentId: payment.id
        }
      ]
    });
  }

  if ((await prisma.milkCollection.count()) === 0 && farmers[0]) {
    const rawMilk = await prisma.inventoryItem.findFirst({ where: { name: "Raw Milk" } });
    const milk = await prisma.milkCollection.create({
      data: {
        farmerId: farmers[0].id,
        collectionDate: new Date(),
        session: "MORNING",
        quantityLitres: "42.5",
        fat: "4.2",
        snf: "8.5",
        ratePerLitre: "47",
        totalAmount: "1997.50",
        paidAmount: "1000",
        dueAmount: "997.50",
        notes: "Morning milk collection"
      }
    });

    await prisma.ledgerEntry.createMany({
      data: [
        {
          ownerType: "FARMER",
          entryType: "CREDIT",
          amount: "1997.50",
          description: "Milk collection payable",
          farmerId: farmers[0].id,
          milkCollectionId: milk.id
        },
        {
          ownerType: "FARMER",
          entryType: "DEBIT",
          amount: "1000",
          description: "Advance paid against milk collection",
          farmerId: farmers[0].id,
          milkCollectionId: milk.id
        }
      ]
    });

    if (rawMilk) {
      await prisma.stockMovement.create({
        data: {
          inventoryItemId: rawMilk.id,
          movementType: "IN",
          quantity: "42.5",
          unitCost: "47",
          totalCost: "1997.50",
          milkCollectionId: milk.id,
          movementDate: new Date(),
          notes: "Auto stock-in from farmer milk collection",
          createdById: owner?.id
        }
      });
    }
  }

  if ((await prisma.expense.count()) === 0) {
    await prisma.expense.createMany({
      data: [
        {
          category: "Electricity",
          amount: "4200",
          paymentMode: "UPI",
          expenseDate: new Date(),
          notes: "Monthly electricity bill"
        },
        {
          category: "Packaging",
          amount: "1850",
          paymentMode: "CASH",
          expenseDate: new Date(),
          notes: "Boxes and labels"
        }
      ]
    });
  }

  if ((await prisma.attendance.count()) === 0 && employees.length > 0) {
    await prisma.attendance.createMany({
      data: employees.map((employee) => ({
        employeeId: employee.id,
        date: new Date(),
        status: "PRESENT",
        hoursWorked: "8",
        notes: "Demo attendance"
      }))
    });
  }

  if ((await prisma.salaryPayment.count()) === 0 && employees[0]) {
    await prisma.salaryPayment.create({
      data: {
        employeeId: employees[0].id,
        salaryMonth: new Date("2026-06-01"),
        baseSalary: "28000",
        advance: "2500",
        bonus: "1000",
        deduction: "0",
        finalPayable: "26500",
        paidAmount: "12000",
        pendingAmount: "14500",
        paymentDate: new Date(),
        notes: "Partial salary payment"
      }
    });
  }

  if ((await prisma.auditLog.count()) === 0) {
    await prisma.auditLog.create({
      data: {
        userId: owner?.id,
        module: "seed",
        action: "create",
        recordTitle: "Demo workspace initialized",
        newValues: { app: "Namdhari Swaich Sweets Suite" }
      }
    });
  }
}

async function main() {
  await seedRolesAndUsers();
  await seedBusinessSettings();
  await seedMasterData();
  await seedOperationalData();

  console.log("Seed complete.");
  console.log("Demo password for all seeded users:", password);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
