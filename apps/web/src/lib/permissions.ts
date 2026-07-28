export const TASK_PERMISSIONS = {
  read: "tasks:read",
  create: "tasks:create",
  update: "tasks:update",
  delete: "tasks:delete",
} as const

export const PROJECT_PERMISSIONS = {
  read: "projects:read",
  create: "projects:create",
  update: "projects:update",
  delete: "projects:delete",
} as const

export const TEMPLATE_PERMISSIONS = {
  read: "template:read",
  create: "template:create",
  update: "template:update",
  delete: "template:delete",
} as const

export const USER_PERMISSIONS = {
  read: "users:read",
  create: "users:create",
  update: "users:update",
  delete: "users:delete",
  assign: "users:assign",
} as const

export const ROLE_PERMISSIONS = {
  read: "roles:read",
  create: "roles:create",
  update: "roles:update",
  delete: "roles:delete",
  manage: "roles:manage",
} as const
