import type { UserRoleKey } from "@prisma/client";

export type AppRole = UserRoleKey;

const allActions = ["view", "create", "update", "delete", "export"] as const;
type PermissionAction = (typeof allActions)[number];

const readonlyModules = [
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
];

const roleRules: Record<AppRole, Record<string, PermissionAction[]>> = {
  SUPER_ADMIN: Object.fromEntries(readonlyModules.map((module) => [module, [...allActions]])),
  OWNER: Object.fromEntries(readonlyModules.map((module) => [module, [...allActions]])),
  MANAGER: {
    dashboard: ["view"],
    products: ["view", "create", "update", "export"],
    invoices: ["view", "create", "update", "export"],
    customers: ["view", "create", "update", "export"],
    inventory: ["view", "create", "update", "export"],
    farmers: ["view", "create", "update", "export"],
    suppliers: ["view", "create", "update", "export"],
    employees: ["view", "create", "update", "export"],
    reports: ["view", "export"],
    payments: ["view", "create"]
  },
  CASHIER: {
    dashboard: ["view"],
    invoices: ["view", "create"],
    customers: ["view", "create"],
    payments: ["view", "create"],
    reports: ["view"]
  },
  INVENTORY_STAFF: {
    dashboard: ["view"],
    products: ["view"],
    inventory: ["view", "create", "update", "export"],
    suppliers: ["view"],
    reports: ["view", "export"]
  },
  ACCOUNTANT: {
    dashboard: ["view"],
    customers: ["view", "export"],
    ledgers: ["view", "create", "update", "export"],
    farmers: ["view", "export"],
    suppliers: ["view", "export"],
    employees: ["view", "export"],
    expenses: ["view", "create", "update", "export"],
    payments: ["view", "create", "update", "export"],
    reports: ["view", "export"]
  },
  READ_ONLY_STAFF: Object.fromEntries(readonlyModules.map((module) => [module, ["view"]]))
};

export function can(role: AppRole | string | undefined, module: string, action: PermissionAction) {
  if (!role) return false;
  const appRole = role as AppRole;
  return roleRules[appRole]?.[module]?.includes(action) ?? false;
}

export function roleLabel(role: AppRole | string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
