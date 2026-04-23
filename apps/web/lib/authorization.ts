import { redirect } from "next/navigation";
import { getSafeRedirectPath, getSession, type AppRole } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export const OPERATIONAL_ROLES = [
  "super_admin",
  "content_manager",
  "order_operator",
  "support_operator",
  "editor"
] as const;

export const ORDER_ADMIN_VIEWER_ROLES = [
  "super_admin",
  "order_operator",
  "support_operator"
] as const;

export const ORDER_ADMIN_EDITOR_ROLES = ["super_admin", "order_operator"] as const;
export const SUPPORT_LOOKUP_ROLES = ["super_admin", "support_operator"] as const;
export const CMS_ACCESS_ROLES = ["super_admin", "content_manager", "editor"] as const;

export type OperationalRole = (typeof OPERATIONAL_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  customer: "مشتری",
  super_admin: "مدیر کل",
  content_manager: "مدیر محتوا",
  order_operator: "اپراتور سفارش",
  support_operator: "اپراتور پشتیبانی",
  editor: "ویرایشگر"
};

export const ROLE_ACCESS_MATRIX: Array<{
  role: AppRole;
  label: string;
  summary: string;
  access: string[];
}> = [
  {
    role: "super_admin",
    label: ROLE_LABELS.super_admin,
    summary: "دسترسی کامل به ابزارهای داخلی عملیاتی و مسیر CMS",
    access: ["داشبورد داخلی", "سفارش‌ها", "تغییر وضعیت سفارش", "جست‌وجوی کاربر", "ورود به Contentful"]
  },
  {
    role: "content_manager",
    label: ROLE_LABELS.content_manager,
    summary: "فقط برای مدیریت محتوا و هماهنگی CMS",
    access: ["داشبورد داخلی", "ورود به Contentful"]
  },
  {
    role: "order_operator",
    label: ROLE_LABELS.order_operator,
    summary: "رسیدگی به سفارش‌ها و تغییر وضعیت آن‌ها",
    access: ["داشبورد داخلی", "فهرست سفارش‌ها", "جزئیات سفارش", "تغییر وضعیت سفارش"]
  },
  {
    role: "support_operator",
    label: ROLE_LABELS.support_operator,
    summary: "پیگیری کاربران و مشاهده سفارش برای پشتیبانی",
    access: ["داشبورد داخلی", "فهرست سفارش‌ها", "جزئیات سفارش", "جست‌وجوی کاربر"]
  },
  {
    role: "editor",
    label: ROLE_LABELS.editor,
    summary: "دسترسی سبک برای هماهنگی و ورود به CMS",
    access: ["داشبورد داخلی", "ورود به Contentful"]
  },
  {
    role: "customer",
    label: ROLE_LABELS.customer,
    summary: "فقط مسیرهای عمومی فروشگاه و حساب کاربری",
    access: ["بدون دسترسی به ناحیه ادمین"]
  }
];

export const ADMIN_SECTIONS = [
  {
    href: "/admin",
    label: "نمای کلی",
    description: "ورود به ابزارهای داخلی و مرزبندی نقش‌ها",
    roles: OPERATIONAL_ROLES
  },
  {
    href: "/admin/orders",
    label: "سفارش‌ها",
    description: "فهرست و پیگیری سفارش‌های فروشگاه",
    roles: ORDER_ADMIN_VIEWER_ROLES
  },
  {
    href: "/admin/users",
    label: "جست‌وجوی کاربران",
    description: "یافتن کاربر برای پشتیبانی و بررسی سابقه پایه",
    roles: SUPPORT_LOOKUP_ROLES
  }
] as const;

export function hasRequiredRole(
  role: AppRole | null | undefined,
  allowedRoles: readonly AppRole[]
): role is AppRole {
  return Boolean(role && allowedRoles.includes(role));
}

export function isOperationalRole(role: AppRole | null | undefined): role is OperationalRole {
  return hasRequiredRole(role, OPERATIONAL_ROLES);
}

export function canAccessCmsOperations(role: AppRole | null | undefined) {
  return hasRequiredRole(role, CMS_ACCESS_ROLES);
}

export function canViewOrders(role: AppRole | null | undefined) {
  return hasRequiredRole(role, ORDER_ADMIN_VIEWER_ROLES);
}

export function canUpdateOrderStatus(role: AppRole | null | undefined) {
  return hasRequiredRole(role, ORDER_ADMIN_EDITOR_ROLES);
}

export function canLookupUsers(role: AppRole | null | undefined) {
  return hasRequiredRole(role, SUPPORT_LOOKUP_ROLES);
}

export function getAdminSectionsForRole(role: AppRole) {
  return ADMIN_SECTIONS.filter((section) => hasRequiredRole(role, section.roles));
}

function buildLoginRedirect(nextPath: string) {
  return `/login?next=${encodeURIComponent(getSafeRedirectPath(nextPath, "/admin"))}`;
}

export async function getAuthorizedSession(allowedRoles: readonly AppRole[]) {
  const session = await getSession();

  if (!session || !hasRequiredRole(session.role, allowedRoles)) {
    return null;
  }

  return session;
}

export async function requireAuthorizedSession(params: {
  allowedRoles: readonly AppRole[];
  nextPath: string;
  fallbackPath?: string;
}) {
  const session = await getSession();

  if (!session) {
    redirect(buildLoginRedirect(params.nextPath));
  }

  if (!hasRequiredRole(session.role, params.allowedRoles)) {
    redirect(params.fallbackPath || "/account?adminDenied=1");
  }

  return session;
}

export async function requireOperationalSession(nextPath = "/admin") {
  return requireAuthorizedSession({
    allowedRoles: OPERATIONAL_ROLES,
    nextPath
  });
}

export function getCmsDashboardHref() {
  return siteConfig.cmsDashboardUrl || null;
}
