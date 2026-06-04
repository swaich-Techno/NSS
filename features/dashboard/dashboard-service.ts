import { withDatabase } from "@/lib/db/client";

export type DashboardMetric = {
  title: string;
  value: number;
  kind: "money" | "number";
  subtitle: string;
  icon: string;
  tone?: "default" | "success" | "warning" | "danger";
};

export type DashboardSummary = {
  metrics: DashboardMetric[];
  recentInvoices: { invoiceNumber: string; customer: string; total: number; status: string }[];
  recentExpenses: { category: string; amount: number; date: string }[];
  recentMilkEntries: { farmer: string; litres: number; session: string; payable: number }[];
  revenueSeries: { label: string; amount: number }[];
  expenseBreakdown: { category: string; amount: number }[];
  quickActions: { label: string; href: string; icon: string }[];
};

function decimal(value: unknown) {
  if (value && typeof value === "object" && "toString" in value) return Number(value.toString());
  return Number(value ?? 0);
}

const fallbackSummary: DashboardSummary = {
  metrics: [
    { title: "Today's sales", value: 10827.5, kind: "money", subtitle: "Invoices raised today", icon: "receipt", tone: "success" },
    { title: "Today's expenses", value: 6050, kind: "money", subtitle: "Operational spend", icon: "wallet", tone: "warning" },
    { title: "Today's profit", value: 4777.5, kind: "money", subtitle: "Estimated after expenses", icon: "chart", tone: "success" },
    { title: "Monthly sales", value: 184250, kind: "money", subtitle: "Current month revenue", icon: "receipt" },
    { title: "Pending customer dues", value: 6377.5, kind: "money", subtitle: "Open customer ledger", icon: "contact", tone: "warning" },
    { title: "Pending farmer payments", value: 4089.5, kind: "money", subtitle: "Milk payable balance", icon: "milk", tone: "warning" },
    { title: "Milk collected today", value: 78.5, kind: "number", subtitle: "Litres from farmers", icon: "milk", tone: "success" },
    { title: "Low stock alerts", value: 1, kind: "number", subtitle: "Items below threshold", icon: "warehouse", tone: "danger" }
  ],
  recentInvoices: [
    { invoiceNumber: "NSS-2026-0001", customer: "Gurpreet Singh", total: 1627.5, status: "Partial" },
    { invoiceNumber: "NSS-2026-0002", customer: "Aman Caterers", total: 9200, status: "Paid" }
  ],
  recentExpenses: [
    { category: "Electricity", amount: 4200, date: "Today" },
    { category: "Packaging", amount: 1850, date: "Today" }
  ],
  recentMilkEntries: [
    { farmer: "Baldev Singh", litres: 42.5, session: "Morning", payable: 1997.5 },
    { farmer: "Jaswinder Kaur", litres: 36, session: "Evening", payable: 1692 }
  ],
  revenueSeries: [
    { label: "Jan", amount: 128000 },
    { label: "Feb", amount: 142000 },
    { label: "Mar", amount: 156000 },
    { label: "Apr", amount: 171000 },
    { label: "May", amount: 182000 },
    { label: "Jun", amount: 184250 }
  ],
  expenseBreakdown: [
    { category: "Raw material", amount: 68000 },
    { category: "Staff salary", amount: 46000 },
    { category: "Utilities", amount: 14200 },
    { category: "Packaging", amount: 9800 }
  ],
  quickActions: [
    { label: "Create Invoice", href: "/invoices/new", icon: "receipt" },
    { label: "Add Milk Entry", href: "/farmers/new", icon: "milk" },
    { label: "Add Expense", href: "/expenses/new", icon: "wallet" },
    { label: "Stock Entry", href: "/inventory/new", icon: "warehouse" }
  ]
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return withDatabase(async (client) => {
    const [
      todaySales,
      monthSales,
      todayExpenses,
      monthExpenses,
      invoiceDues,
      farmerDues,
      supplierDues,
      milkToday,
      salaryDues,
      recentInvoices,
      recentExpenses,
      recentMilkEntries,
      inventoryItems
    ] = await Promise.all([
      client.invoice.aggregate({ where: { issueDate: { gte: startOfDay }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      client.invoice.aggregate({ where: { issueDate: { gte: startOfMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      client.expense.aggregate({ where: { expenseDate: { gte: startOfDay }, deletedAt: null }, _sum: { amount: true } }),
      client.expense.aggregate({ where: { expenseDate: { gte: startOfMonth }, deletedAt: null }, _sum: { amount: true } }),
      client.invoice.aggregate({ where: { status: { in: ["PARTIAL", "UNPAID"] } }, _sum: { dueAmount: true } }),
      client.milkCollection.aggregate({ _sum: { dueAmount: true } }),
      client.supplier.aggregate({ _sum: { openingBalance: true } }),
      client.milkCollection.aggregate({ where: { collectionDate: { gte: startOfDay } }, _sum: { quantityLitres: true } }),
      client.salaryPayment.aggregate({ _sum: { pendingAmount: true } }),
      client.invoice.findMany({ take: 5, include: { customer: true }, orderBy: { issueDate: "desc" } }),
      client.expense.findMany({ take: 5, orderBy: { expenseDate: "desc" } }),
      client.milkCollection.findMany({ take: 5, include: { farmer: true }, orderBy: { collectionDate: "desc" } }),
      client.inventoryItem.findMany({ take: 20, where: { active: true } })
    ]);

    const todaySalesAmount = decimal(todaySales._sum.total);
    const todayExpenseAmount = decimal(todayExpenses._sum.amount);
    const monthSalesAmount = decimal(monthSales._sum.total);
    const monthExpenseAmount = decimal(monthExpenses._sum.amount);
    const lowStockCount = inventoryItems.filter((item) => decimal(item.currentQuantity) <= decimal(item.minimumQuantity)).length;

    return {
      metrics: [
        { title: "Today's sales", value: todaySalesAmount, kind: "money", subtitle: "Invoices raised today", icon: "receipt", tone: "success" },
        { title: "Today's expenses", value: todayExpenseAmount, kind: "money", subtitle: "Operational spend", icon: "wallet", tone: "warning" },
        { title: "Today's profit", value: todaySalesAmount - todayExpenseAmount, kind: "money", subtitle: "Sales minus expenses", icon: "chart", tone: todaySalesAmount >= todayExpenseAmount ? "success" : "danger" },
        { title: "Monthly sales", value: monthSalesAmount, kind: "money", subtitle: "Current month revenue", icon: "receipt" },
        { title: "Monthly expenses", value: monthExpenseAmount, kind: "money", subtitle: "Current month spend", icon: "wallet" },
        { title: "Monthly profit", value: monthSalesAmount - monthExpenseAmount, kind: "money", subtitle: "Estimated current month", icon: "chart", tone: monthSalesAmount >= monthExpenseAmount ? "success" : "danger" },
        { title: "Pending customer dues", value: decimal(invoiceDues._sum.dueAmount), kind: "money", subtitle: "Open invoice dues", icon: "contact", tone: "warning" },
        { title: "Pending farmer payments", value: decimal(farmerDues._sum.dueAmount), kind: "money", subtitle: "Milk payable balance", icon: "milk", tone: "warning" },
        { title: "Pending supplier payments", value: decimal(supplierDues._sum.openingBalance), kind: "money", subtitle: "Supplier opening payable", icon: "truck", tone: "warning" },
        { title: "Milk collected today", value: decimal(milkToday._sum.quantityLitres), kind: "number", subtitle: "Litres from farmers", icon: "milk", tone: "success" },
        { title: "Low stock alerts", value: lowStockCount, kind: "number", subtitle: "Items below threshold", icon: "warehouse", tone: lowStockCount > 0 ? "danger" : "success" },
        { title: "Salary dues", value: decimal(salaryDues._sum.pendingAmount), kind: "money", subtitle: "Pending salary payments", icon: "id-card", tone: "warning" }
      ],
      recentInvoices: recentInvoices.map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer?.name ?? "Walk-in",
        total: decimal(invoice.total),
        status: invoice.status
      })),
      recentExpenses: recentExpenses.map((expense) => ({
        category: expense.category,
        amount: decimal(expense.amount),
        date: expense.expenseDate.toISOString()
      })),
      recentMilkEntries: recentMilkEntries.map((entry) => ({
        farmer: entry.farmer.name,
        litres: decimal(entry.quantityLitres),
        session: entry.session,
        payable: decimal(entry.totalAmount)
      })),
      revenueSeries: fallbackSummary.revenueSeries.slice(-6),
      expenseBreakdown: fallbackSummary.expenseBreakdown,
      quickActions: fallbackSummary.quickActions
    };
  }, fallbackSummary);
}
