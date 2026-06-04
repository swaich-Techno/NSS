export type FieldType = "text" | "email" | "tel" | "number" | "date" | "select" | "textarea";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type TableColumn = {
  key: string;
  label: string;
  type?: "text" | "money" | "number" | "date" | "status";
};

export type ModuleRow = Record<string, string | number | boolean | null | undefined>;

export type ModuleDefinition = {
  key: string;
  title: string;
  navTitle: string;
  description: string;
  category: "Core" | "Sales" | "Operations" | "People" | "Finance" | "System";
  href: string;
  icon: string;
  createLabel?: string;
  exportKey: string;
  columns: TableColumn[];
  fields: FormField[];
  demoRows: ModuleRow[];
};

const paymentModes = ["CASH", "UPI", "CARD", "BANK", "CREDIT", "MIXED", "OTHER"];
const units = ["KG", "GRAM", "PIECE", "BOX", "LITRE", "PACKET"];
const activeOptions = ["Active", "Inactive"];

export const moduleDefinitions: ModuleDefinition[] = [
  {
    key: "business-settings",
    title: "Business Settings",
    navTitle: "Settings",
    description: "Owner-editable business profile, invoice identity, tax defaults, branch details, and brand color.",
    category: "Core",
    href: "/business-settings",
    icon: "settings",
    createLabel: "Update Settings",
    exportKey: "business-settings",
    columns: [
      { key: "businessName", label: "Business" },
      { key: "phone", label: "Phone" },
      { key: "invoicePrefix", label: "Invoice Prefix" },
      { key: "currency", label: "Currency" },
      { key: "themeColor", label: "Theme" }
    ],
    fields: [
      { name: "businessName", label: "Business name", type: "text", required: true },
      { name: "logoUrl", label: "Logo URL", type: "text" },
      { name: "address", label: "Address", type: "textarea", required: true },
      { name: "phone", label: "Phone number", type: "tel", required: true },
      { name: "email", label: "Email", type: "email" },
      { name: "gstin", label: "GSTIN", type: "text" },
      { name: "fssaiLicense", label: "FSSAI/license number", type: "text" },
      { name: "invoicePrefix", label: "Invoice prefix", type: "text", required: true },
      { name: "invoiceFooterTerms", label: "Invoice footer terms", type: "textarea" },
      { name: "upiPaymentDetails", label: "UPI/payment details text", type: "textarea" },
      { name: "currency", label: "Currency", type: "text", required: true },
      { name: "defaultTaxRate", label: "Default tax rate", type: "number" },
      { name: "themeColor", label: "Theme color", type: "text" },
      { name: "branchName", label: "Branch name", type: "text" },
      { name: "branchCode", label: "Branch code", type: "text" }
    ],
    demoRows: [
      {
        businessName: "Namdhari Swaich Sweets",
        phone: "+91 98765 43210",
        invoicePrefix: "NSS",
        currency: "INR",
        themeColor: "#1c5a3e"
      }
    ]
  },
  {
    key: "users",
    title: "Users and Roles",
    navTitle: "Users",
    description: "Create, edit, deactivate, and assign role-based access for agency, owner, and staff users.",
    category: "Core",
    href: "/users",
    icon: "users",
    createLabel: "Add User",
    exportKey: "users",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "role", label: "Role", type: "status" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      {
        name: "role",
        label: "Role",
        type: "select",
        required: true,
        options: ["SUPER_ADMIN", "OWNER", "MANAGER", "CASHIER", "INVENTORY_STAFF", "ACCOUNTANT", "READ_ONLY_STAFF"]
      },
      { name: "password", label: "Temporary password", type: "text", required: true },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    demoRows: [
      { name: "Agency Admin", email: "agency@nss.local", phone: "+91 98765 43210", role: "Super Admin", active: "Active" },
      { name: "Namdhari Owner", email: "owner@nss.local", phone: "+91 98765 43210", role: "Owner", active: "Active" },
      { name: "Billing Counter", email: "cashier@nss.local", phone: "+91 98765 43210", role: "Cashier", active: "Active" }
    ]
  },
  {
    key: "products",
    title: "Product Catalogue",
    navTitle: "Products",
    description: "Sweet shop and dairy catalogue with SKU, category, units, tax, margin, wholesale pricing, and low-stock links.",
    category: "Sales",
    href: "/products",
    icon: "package",
    createLabel: "Add Product",
    exportKey: "products",
    columns: [
      { key: "name", label: "Product" },
      { key: "category", label: "Category" },
      { key: "sku", label: "SKU" },
      { key: "sellingPrice", label: "Selling", type: "money" },
      { key: "costPrice", label: "Cost", type: "money" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Product name", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "sku", label: "SKU/code", type: "text", required: true },
      { name: "unit", label: "Unit", type: "select", required: true, options: units },
      { name: "sellingPrice", label: "Selling price", type: "number", required: true },
      { name: "costPrice", label: "Cost price", type: "number", required: true },
      { name: "taxRate", label: "Tax rate", type: "number" },
      { name: "wholesalePrice", label: "Wholesale price", type: "number" },
      { name: "festivalPrice", label: "Manual festival price", type: "number" },
      { name: "lowStockThreshold", label: "Low-stock threshold", type: "number" },
      { name: "imageUrl", label: "Product image URL", type: "text" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    demoRows: [
      { name: "Fresh Paneer", category: "Dairy", sku: "NSS-PANEER-001", sellingPrice: 360, costPrice: 250, active: "Active" },
      { name: "Desi Ghee Laddu", category: "Sweets", sku: "NSS-LADDU-001", sellingPrice: 620, costPrice: 410, active: "Active" },
      { name: "Kaju Katli", category: "Premium Sweets", sku: "NSS-KAJU-001", sellingPrice: 980, costPrice: 760, active: "Active" }
    ]
  },
  {
    key: "invoices",
    title: "Invoices",
    navTitle: "Invoices",
    description: "Fast mobile-friendly billing with customer dues, payment status, PDF invoice, print view, and audit trail.",
    category: "Sales",
    href: "/invoices",
    icon: "receipt",
    createLabel: "Create Invoice",
    exportKey: "invoice-report",
    columns: [
      { key: "invoiceNumber", label: "Invoice" },
      { key: "customer", label: "Customer" },
      { key: "issueDate", label: "Date", type: "date" },
      { key: "total", label: "Total", type: "money" },
      { key: "paidAmount", label: "Paid", type: "money" },
      { key: "dueAmount", label: "Due", type: "money" },
      { key: "status", label: "Status", type: "status" }
    ],
    fields: [
      { name: "customerName", label: "Customer name", type: "text", required: true },
      { name: "customerPhone", label: "Customer phone", type: "tel" },
      { name: "issueDate", label: "Invoice date", type: "date", required: true },
      { name: "itemSummary", label: "Product summary", type: "textarea", required: true },
      { name: "subtotal", label: "Subtotal", type: "number", required: true },
      { name: "discountTotal", label: "Discount", type: "number" },
      { name: "taxTotal", label: "Tax", type: "number" },
      { name: "paidAmount", label: "Paid amount", type: "number" },
      { name: "paymentMode", label: "Payment mode", type: "select", options: paymentModes },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    demoRows: [
      { invoiceNumber: "NSS-2026-0001", customer: "Gurpreet Singh", issueDate: "2026-06-04", total: 1627.5, paidAmount: 1000, dueAmount: 627.5, status: "Partial" },
      { invoiceNumber: "NSS-2026-0002", customer: "Aman Caterers", issueDate: "2026-06-04", total: 9200, paidAmount: 9200, dueAmount: 0, status: "Paid" }
    ]
  },
  {
    key: "customers",
    title: "Customers",
    navTitle: "Customers",
    description: "Customer profiles, purchase history, opening balances, payment received entries, and due statements.",
    category: "Sales",
    href: "/customers",
    icon: "contact",
    createLabel: "Add Customer",
    exportKey: "customer-due-report",
    columns: [
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "openingBalance", label: "Opening", type: "money" },
      { key: "balance", label: "Balance", type: "money" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "address", label: "Address", type: "textarea" },
      { name: "email", label: "Email", type: "email" },
      { name: "openingBalance", label: "Opening balance", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    demoRows: [
      { name: "Gurpreet Singh", phone: "+91 98111 11001", openingBalance: 1250, balance: 1877.5, active: "Active" },
      { name: "Aman Caterers", phone: "+91 98111 11002", openingBalance: 4500, balance: 4500, active: "Active" }
    ]
  },
  {
    key: "ledgers",
    title: "Credit-Debit Ledgers",
    navTitle: "Ledgers",
    description: "Unified customer, farmer, and supplier debit-credit entries with date-wise statements and exports.",
    category: "Finance",
    href: "/ledgers",
    icon: "book",
    createLabel: "Add Ledger Entry",
    exportKey: "customer-ledger-report",
    columns: [
      { key: "ownerType", label: "Owner Type", type: "status" },
      { key: "owner", label: "Owner" },
      { key: "entryDate", label: "Date", type: "date" },
      { key: "entryType", label: "Type", type: "status" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "description", label: "Description" }
    ],
    fields: [
      { name: "ownerType", label: "Owner type", type: "select", required: true, options: ["CUSTOMER", "FARMER", "SUPPLIER"] },
      { name: "ownerName", label: "Owner name", type: "text", required: true },
      { name: "entryDate", label: "Date", type: "date", required: true },
      { name: "entryType", label: "Entry type", type: "select", required: true, options: ["CREDIT", "DEBIT"] },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "description", label: "Description", type: "textarea", required: true }
    ],
    demoRows: [
      { ownerType: "Customer", owner: "Gurpreet Singh", entryDate: "2026-06-04", entryType: "Debit", amount: 1627.5, description: "Invoice NSS-2026-0001" },
      { ownerType: "Farmer", owner: "Baldev Singh", entryDate: "2026-06-04", entryType: "Credit", amount: 1997.5, description: "Milk collection payable" }
    ]
  },
  {
    key: "inventory",
    title: "Inventory",
    navTitle: "Inventory",
    description: "Raw material and finished product stock, stock in/out, wastage, batches, expiry, and valuation.",
    category: "Operations",
    href: "/inventory",
    icon: "warehouse",
    createLabel: "Add Stock Item",
    exportKey: "inventory-report",
    columns: [
      { key: "name", label: "Item" },
      { key: "type", label: "Type", type: "status" },
      { key: "currentQuantity", label: "Qty", type: "number" },
      { key: "unit", label: "Unit" },
      { key: "minimumQuantity", label: "Minimum", type: "number" },
      { key: "valuation", label: "Valuation", type: "money" }
    ],
    fields: [
      { name: "name", label: "Item name", type: "text", required: true },
      { name: "type", label: "Type", type: "select", required: true, options: ["RAW_MATERIAL", "FINISHED_PRODUCT"] },
      { name: "unit", label: "Unit", type: "select", required: true, options: units },
      { name: "currentQuantity", label: "Current quantity", type: "number", required: true },
      { name: "minimumQuantity", label: "Minimum quantity", type: "number" },
      { name: "costPerUnit", label: "Cost per unit", type: "number" },
      { name: "supplierName", label: "Supplier", type: "text" },
      { name: "batchNumber", label: "Batch number", type: "text" },
      { name: "expiryDate", label: "Expiry date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    demoRows: [
      { name: "Raw Milk", type: "Raw Material", currentQuantity: 248, unit: "LITRE", minimumQuantity: 100, valuation: 11408 },
      { name: "Rasgulla Boxes", type: "Finished Product", currentQuantity: 14, unit: "BOX", minimumQuantity: 20, valuation: 1568 }
    ]
  },
  {
    key: "farmers",
    title: "Farmer Milk Collection",
    navTitle: "Farmers",
    description: "Farmer profiles, morning/evening milk entries, payable ledgers, monthly statements, and raw milk stock-in.",
    category: "Operations",
    href: "/farmers",
    icon: "milk",
    createLabel: "Add Milk Entry",
    exportKey: "farmer-milk-collection-report",
    columns: [
      { key: "farmer", label: "Farmer" },
      { key: "collectionDate", label: "Date", type: "date" },
      { key: "session", label: "Session", type: "status" },
      { key: "quantityLitres", label: "Litres", type: "number" },
      { key: "totalAmount", label: "Payable", type: "money" },
      { key: "dueAmount", label: "Due", type: "money" }
    ],
    fields: [
      { name: "farmerName", label: "Farmer name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "villageAddress", label: "Village/address", type: "textarea" },
      { name: "collectionDate", label: "Collection date", type: "date", required: true },
      { name: "session", label: "Session", type: "select", required: true, options: ["MORNING", "EVENING"] },
      { name: "quantityLitres", label: "Quantity litres", type: "number", required: true },
      { name: "fat", label: "Fat", type: "number" },
      { name: "snf", label: "SNF", type: "number" },
      { name: "ratePerLitre", label: "Rate per litre", type: "number", required: true },
      { name: "paidAmount", label: "Advance paid", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    demoRows: [
      { farmer: "Baldev Singh", collectionDate: "2026-06-04", session: "Morning", quantityLitres: 42.5, totalAmount: 1997.5, dueAmount: 997.5 },
      { farmer: "Jaswinder Kaur", collectionDate: "2026-06-04", session: "Evening", quantityLitres: 36, totalAmount: 1692, dueAmount: 1692 }
    ]
  },
  {
    key: "suppliers",
    title: "Suppliers",
    navTitle: "Suppliers",
    description: "Supplier profiles, purchase records, payments, payable ledger, and date-wise statements.",
    category: "Operations",
    href: "/suppliers",
    icon: "truck",
    createLabel: "Add Supplier",
    exportKey: "supplier-payable-report",
    columns: [
      { key: "name", label: "Supplier" },
      { key: "phone", label: "Phone" },
      { key: "gstOrLicense", label: "GST/License" },
      { key: "openingBalance", label: "Opening", type: "money" },
      { key: "payable", label: "Payable", type: "money" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Supplier name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "address", label: "Address", type: "textarea" },
      { name: "email", label: "Email", type: "email" },
      { name: "gstOrLicense", label: "GST/license", type: "text" },
      { name: "openingBalance", label: "Opening balance", type: "number" },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    demoRows: [
      { name: "Punjab Dairy Inputs", phone: "+91 98222 22001", gstOrLicense: "GST-SUP-001", openingBalance: 7500, payable: 7500, active: "Active" },
      { name: "Golden Packaging Co.", phone: "+91 98222 22002", gstOrLicense: "-", openingBalance: 3200, payable: 3200, active: "Active" }
    ]
  },
  {
    key: "employees",
    title: "Employees and Salaries",
    navTitle: "Employees",
    description: "Employee profiles, attendance, advances, salary calculation, payment history, and monthly statements.",
    category: "People",
    href: "/employees",
    icon: "id-card",
    createLabel: "Add Employee",
    exportKey: "employee-salary-report",
    columns: [
      { key: "name", label: "Employee" },
      { key: "phone", label: "Phone" },
      { key: "designation", label: "Designation" },
      { key: "salaryType", label: "Type", type: "status" },
      { key: "salaryRate", label: "Rate", type: "money" },
      { key: "active", label: "Status", type: "status" }
    ],
    fields: [
      { name: "name", label: "Employee name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "address", label: "Address", type: "textarea" },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "joiningDate", label: "Joining date", type: "date", required: true },
      { name: "salaryType", label: "Salary type", type: "select", required: true, options: ["MONTHLY", "DAILY", "HOURLY"] },
      { name: "salaryRate", label: "Salary amount/rate", type: "number", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "active", label: "Status", type: "select", options: activeOptions }
    ],
    demoRows: [
      { name: "Rohit Kumar", phone: "+91 98444 44001", designation: "Halwai", salaryType: "Monthly", salaryRate: 28000, active: "Active" },
      { name: "Meena Sharma", phone: "+91 98444 44002", designation: "Counter Staff", salaryType: "Monthly", salaryRate: 18000, active: "Active" }
    ]
  },
  {
    key: "expenses",
    title: "Expenses and Profit",
    navTitle: "Expenses",
    description: "Daily expenses, categories, receipt references, cash closing, and profit/loss calculations.",
    category: "Finance",
    href: "/expenses",
    icon: "wallet",
    createLabel: "Add Expense",
    exportKey: "expense-report",
    columns: [
      { key: "category", label: "Category" },
      { key: "expenseDate", label: "Date", type: "date" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "paymentMode", label: "Mode", type: "status" },
      { key: "notes", label: "Notes" }
    ],
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: ["Milk purchase", "Sugar", "Ghee", "Dry fruits", "Raw material", "Packaging", "Staff salary", "Rent", "Electricity", "Gas/fuel", "Delivery", "Maintenance", "Marketing", "Miscellaneous"]
      },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "paymentMode", label: "Payment mode", type: "select", required: true, options: paymentModes },
      { name: "expenseDate", label: "Date", type: "date", required: true },
      { name: "receiptUrl", label: "Receipt attachment URL", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    demoRows: [
      { category: "Electricity", expenseDate: "2026-06-04", amount: 4200, paymentMode: "UPI", notes: "Monthly electricity bill" },
      { category: "Packaging", expenseDate: "2026-06-04", amount: 1850, paymentMode: "Cash", notes: "Boxes and labels" }
    ]
  },
  {
    key: "payments",
    title: "Payments",
    navTitle: "Payments",
    description: "Unified inward and outward payments for invoices, customers, farmers, suppliers, employees, and expenses.",
    category: "Finance",
    href: "/payments",
    icon: "credit-card",
    createLabel: "Record Payment",
    exportKey: "payment-report",
    columns: [
      { key: "paymentFor", label: "For", type: "status" },
      { key: "party", label: "Party" },
      { key: "paymentDate", label: "Date", type: "date" },
      { key: "direction", label: "Direction", type: "status" },
      { key: "mode", label: "Mode", type: "status" },
      { key: "amount", label: "Amount", type: "money" }
    ],
    fields: [
      { name: "paymentFor", label: "Payment for", type: "select", required: true, options: ["CUSTOMER", "FARMER", "SUPPLIER", "EMPLOYEE", "EXPENSE", "INVOICE"] },
      { name: "party", label: "Party/name", type: "text", required: true },
      { name: "direction", label: "Direction", type: "select", required: true, options: ["IN", "OUT"] },
      { name: "mode", label: "Mode", type: "select", required: true, options: paymentModes },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "paymentDate", label: "Date", type: "date", required: true },
      { name: "referenceNumber", label: "Reference number", type: "text" },
      { name: "notes", label: "Notes", type: "textarea" }
    ],
    demoRows: [
      { paymentFor: "Invoice", party: "Gurpreet Singh", paymentDate: "2026-06-04", direction: "In", mode: "UPI", amount: 1000 },
      { paymentFor: "Farmer", party: "Baldev Singh", paymentDate: "2026-06-04", direction: "Out", mode: "Cash", amount: 1000 }
    ]
  },
  {
    key: "reports",
    title: "Reports",
    navTitle: "Reports",
    description: "Sales, ledgers, stock, suppliers, milk, salaries, attendance, expenses, profit/loss, cash closing, and payments.",
    category: "Finance",
    href: "/reports",
    icon: "chart",
    exportKey: "reports",
    columns: [
      { key: "report", label: "Report" },
      { key: "module", label: "Module" },
      { key: "exports", label: "Exports" },
      { key: "filters", label: "Filters" }
    ],
    fields: [],
    demoRows: [
      { report: "Daily sales report", module: "Sales", exports: "PDF / CSV", filters: "Date range, payment status" },
      { report: "Farmer milk collection report", module: "Farmers", exports: "PDF / CSV", filters: "Date range, farmer, session" }
    ]
  },
  {
    key: "audit-logs",
    title: "Audit Logs",
    navTitle: "Audit",
    description: "Traceable logs for settings, invoices, payments, ledgers, stock, salaries, users, and destructive actions.",
    category: "System",
    href: "/audit-logs",
    icon: "shield",
    exportKey: "audit-logs",
    columns: [
      { key: "module", label: "Module" },
      { key: "action", label: "Action", type: "status" },
      { key: "recordTitle", label: "Record" },
      { key: "user", label: "User" },
      { key: "createdAt", label: "Time", type: "date" }
    ],
    fields: [],
    demoRows: [
      { module: "Invoice", action: "Create", recordTitle: "NSS-2026-0001", user: "Namdhari Owner", createdAt: "2026-06-04" },
      { module: "Seed", action: "Create", recordTitle: "Demo workspace initialized", user: "System", createdAt: "2026-06-04" }
    ]
  },
  {
    key: "backup",
    title: "Backup and Export",
    navTitle: "Backup",
    description: "Central data export hub plus Neon/Supabase backup and restore instructions for operations teams.",
    category: "System",
    href: "/backup",
    icon: "database",
    exportKey: "backup",
    columns: [
      { key: "item", label: "Backup Item" },
      { key: "format", label: "Format" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Status", type: "status" }
    ],
    fields: [],
    demoRows: [
      { item: "Business data export", format: "CSV bundle", owner: "Owner / Agency", status: "Available" },
      { item: "Database restore", format: "Provider backup", owner: "Agency", status: "Documented placeholder" }
    ]
  }
];

export function getModuleDefinition(key: string) {
  return moduleDefinitions.find((module) => module.key === key);
}

export const navigationModules = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    category: "Core"
  },
  ...moduleDefinitions.map((module) => ({
    key: module.key,
    title: module.navTitle,
    href: module.href,
    icon: module.icon,
    category: module.category
  }))
];
