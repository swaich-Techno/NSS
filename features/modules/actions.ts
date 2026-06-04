"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type PaymentMode, type Unit, type UserRoleKey } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/security/password";
import { activeFromValue, formDataToRecord, optionalDate, optionalNumber } from "@/lib/validations/module-record";
import { requireUser } from "@/features/auth/session";

async function audit(module: string, action: string, recordTitle: string, userId: string, newValues?: Record<string, unknown>) {
  if (!prisma) return;
  await prisma.auditLog.create({
    data: {
      module,
      action,
      recordTitle,
      userId,
      newValues: newValues ? (newValues as Prisma.InputJsonObject) : undefined
    }
  });
}

export async function createModuleRecordAction(formData: FormData) {
  const user = await requireUser();
  const { moduleKey, values } = formDataToRecord(formData);

  if (prisma) {
    switch (moduleKey) {
      case "business-settings": {
        const existing = await prisma.businessSettings.findFirst();
        const data = {
          businessName: values.businessName || "Namdhari Swaich Sweets",
          logoUrl: values.logoUrl || null,
          address: values.address || "",
          phone: values.phone || "",
          email: values.email || null,
          gstin: values.gstin || null,
          fssaiLicense: values.fssaiLicense || null,
          invoicePrefix: values.invoicePrefix || "NSS",
          invoiceFooterTerms: values.invoiceFooterTerms || "",
          upiPaymentDetails: values.upiPaymentDetails || null,
          currency: values.currency || "INR",
          defaultTaxRate: optionalNumber(values.defaultTaxRate),
          themeColor: values.themeColor || "#1c5a3e",
          branchName: values.branchName || null,
          branchCode: values.branchCode || null
        };
        if (existing) {
          await prisma.businessSettings.update({ where: { id: existing.id }, data });
        } else {
          await prisma.businessSettings.create({ data });
        }
        await audit(moduleKey, "update", data.businessName, user.id, data);
        break;
      }
      case "users": {
        const role = await prisma.role.findUnique({ where: { key: String(values.role ?? "READ_ONLY_STAFF") as UserRoleKey } });
        if (!role) throw new Error("Selected role does not exist. Run npm run db:seed first.");
        const data = {
          name: values.name || "New User",
          email: String(values.email || "").toLowerCase(),
          phone: values.phone || null,
          passwordHash: await hashPassword(values.password || "Namdhari@123"),
          roleId: role.id,
          active: activeFromValue(values.active)
        };
        await prisma.user.upsert({
          where: { email: data.email },
          update: { name: data.name, phone: data.phone, roleId: data.roleId, active: data.active },
          create: data
        });
        await audit(moduleKey, "upsert", data.email, user.id, { ...data, passwordHash: "[redacted]" });
        break;
      }
      case "products": {
        const data = {
          name: values.name || "New Product",
          category: values.category || "Sweets",
          sku: values.sku || `NSS-${Date.now()}`,
          unit: (values.unit || "KG") as Unit,
          sellingPrice: optionalNumber(values.sellingPrice),
          costPrice: optionalNumber(values.costPrice),
          taxRate: optionalNumber(values.taxRate),
          imageUrl: values.imageUrl || null,
          wholesalePrice: values.wholesalePrice ? optionalNumber(values.wholesalePrice) : null,
          festivalPrice: values.festivalPrice ? optionalNumber(values.festivalPrice) : null,
          lowStockThreshold: values.lowStockThreshold ? optionalNumber(values.lowStockThreshold) : null,
          active: activeFromValue(values.active)
        };
        await prisma.product.upsert({ where: { sku: data.sku }, update: data, create: data });
        await audit(moduleKey, "upsert", data.name, user.id, data);
        break;
      }
      case "customers":
        await prisma.customer.create({
          data: {
            name: values.name || "New Customer",
            phone: values.phone || "",
            address: values.address || null,
            email: values.email || null,
            openingBalance: optionalNumber(values.openingBalance),
            notes: values.notes || null,
            active: activeFromValue(values.active)
          }
        });
        await audit(moduleKey, "create", values.name || "New Customer", user.id, values);
        break;
      case "suppliers":
        await prisma.supplier.create({
          data: {
            name: values.name || "New Supplier",
            phone: values.phone || "",
            address: values.address || null,
            email: values.email || null,
            gstOrLicense: values.gstOrLicense || null,
            openingBalance: optionalNumber(values.openingBalance),
            notes: values.notes || null,
            active: activeFromValue(values.active)
          }
        });
        await audit(moduleKey, "create", values.name || "New Supplier", user.id, values);
        break;
      case "employees":
        await prisma.employee.create({
          data: {
            name: values.name || "New Employee",
            phone: values.phone || "",
            address: values.address || null,
            designation: values.designation || "Staff",
            joiningDate: optionalDate(values.joiningDate),
            salaryType: (values.salaryType || "MONTHLY") as never,
            salaryRate: optionalNumber(values.salaryRate),
            notes: values.notes || null,
            active: activeFromValue(values.active)
          }
        });
        await audit(moduleKey, "create", values.name || "New Employee", user.id, values);
        break;
      case "inventory":
        await prisma.inventoryItem.create({
          data: {
            name: values.name || "New Stock Item",
            type: (values.type || "RAW_MATERIAL") as never,
            unit: (values.unit || "KG") as Unit,
            currentQuantity: optionalNumber(values.currentQuantity),
            minimumQuantity: optionalNumber(values.minimumQuantity),
            costPerUnit: optionalNumber(values.costPerUnit),
            batchNumber: values.batchNumber || null,
            expiryDate: values.expiryDate ? optionalDate(values.expiryDate) : null,
            notes: values.notes || null
          }
        });
        await audit(moduleKey, "create", values.name || "New Stock Item", user.id, values);
        break;
      case "expenses":
        await prisma.expense.create({
          data: {
            category: values.category || "Miscellaneous",
            amount: optionalNumber(values.amount),
            paymentMode: (values.paymentMode || "CASH") as PaymentMode,
            expenseDate: optionalDate(values.expenseDate),
            receiptUrl: values.receiptUrl || null,
            notes: values.notes || null
          }
        });
        await audit(moduleKey, "create", values.category || "Expense", user.id, values);
        break;
      case "farmers": {
        const farmerId = `manual-${String(values.farmerName || Date.now()).replace(/\W+/g, "-").toLowerCase()}`;
        const farmer = await prisma.farmer.upsert({
          where: { id: farmerId },
          update: {},
          create: {
            id: farmerId,
            name: values.farmerName || "New Farmer",
            phone: values.phone || "",
            villageAddress: values.villageAddress || null
          }
        });
        const total = Number(optionalNumber(values.quantityLitres)) * Number(optionalNumber(values.ratePerLitre));
        const paid = Number(optionalNumber(values.paidAmount));
        const collection = await prisma.milkCollection.create({
          data: {
            farmerId: farmer.id,
            collectionDate: optionalDate(values.collectionDate),
            session: (values.session || "MORNING") as never,
            quantityLitres: optionalNumber(values.quantityLitres),
            fat: values.fat ? optionalNumber(values.fat) : null,
            snf: values.snf ? optionalNumber(values.snf) : null,
            ratePerLitre: optionalNumber(values.ratePerLitre),
            totalAmount: total.toFixed(2),
            paidAmount: paid.toFixed(2),
            dueAmount: Math.max(total - paid, 0).toFixed(2),
            notes: values.notes || null
          }
        });
        const rawMilk = await prisma.inventoryItem.findFirst({ where: { name: "Raw Milk" } });
        if (rawMilk) {
          await prisma.stockMovement.create({
            data: {
              inventoryItemId: rawMilk.id,
              movementType: "IN",
              quantity: optionalNumber(values.quantityLitres),
              unitCost: optionalNumber(values.ratePerLitre),
              totalCost: total.toFixed(2),
              milkCollectionId: collection.id,
              notes: "Auto stock-in from farmer milk collection",
              createdById: user.id
            }
          });
        }
        await audit(moduleKey, "create", farmer.name, user.id, values);
        break;
      }
      case "invoices": {
        const settings = await prisma.businessSettings.findFirst();
        const invoiceCount = await prisma.invoice.count();
        const prefix = settings?.invoicePrefix ?? "NSS";
        const subtotal = Number(optionalNumber(values.subtotal));
        const discount = Number(optionalNumber(values.discountTotal));
        const tax = Number(optionalNumber(values.taxTotal));
        const total = Math.max(subtotal - discount + tax, 0);
        const paid = Number(optionalNumber(values.paidAmount));
        const due = Math.max(total - paid, 0);
        const customerId = `invoice-${String(values.customerPhone || values.customerName || Date.now()).replace(/\W+/g, "-").toLowerCase()}`;
        const customer = await prisma.customer.upsert({
          where: { id: customerId },
          update: {},
          create: {
            id: customerId,
            name: values.customerName || "Walk-in Customer",
            phone: values.customerPhone || "N/A"
          }
        });
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: `${prefix}-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, "0")}`,
            customerId: customer.id,
            issueDate: optionalDate(values.issueDate),
            subtotal: subtotal.toFixed(2),
            discountTotal: discount.toFixed(2),
            taxTotal: tax.toFixed(2),
            total: total.toFixed(2),
            paidAmount: paid.toFixed(2),
            dueAmount: due.toFixed(2),
            paymentMode: (values.paymentMode || "CASH") as PaymentMode,
            status: due === 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID",
            notes: values.notes || null,
            cashierId: user.id,
            items: {
              create: {
                productName: values.itemSummary || "Manual invoice item",
                quantity: "1",
                unit: "PIECE",
                price: subtotal.toFixed(2),
                discount: discount.toFixed(2),
                taxRate: "0",
                taxAmount: tax.toFixed(2),
                lineTotal: total.toFixed(2)
              }
            }
          }
        });
        if (due > 0) {
          await prisma.ledgerEntry.create({
            data: {
              ownerType: "CUSTOMER",
              entryType: "DEBIT",
              amount: due.toFixed(2),
              description: `Due amount for invoice ${invoice.invoiceNumber}`,
              customerId: customer.id,
              invoiceId: invoice.id
            }
          });
        }
        await audit(moduleKey, "create", invoice.invoiceNumber, user.id, values);
        break;
      }
      case "ledgers":
      case "payments":
      default:
        await audit(moduleKey, "create-request", `${moduleKey} manual entry`, user.id, values);
        break;
    }
  }

  revalidatePath(`/${moduleKey}`);
  revalidatePath("/dashboard");
  redirect(`/${moduleKey}?saved=1`);
}
