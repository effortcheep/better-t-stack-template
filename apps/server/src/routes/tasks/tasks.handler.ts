import {
  count,
  db,
  desc as drizzleDesc,
  asc as drizzleAsc,
  eq,
} from "@better-t-stack-template/db"
import { tasks } from "@better-t-stack-template/db/schema/tasks"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import { noContent, ok, err } from "~/lib/response-helpers"
import type { AppRouteHandler } from "~/lib/type"

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  RemoveRoute,
  UpdateRoute,
} from "./tasks.routes"

export const list: AppRouteHandler<ListRoute> = async (
  c,
) => {
  const { page, pageSize, sort, order } =
    c.req.valid("query")

  const orderFn = order === "asc" ? drizzleAsc : drizzleDesc

  const sortColumn =
    sort === "createdAt" ? tasks.createdAt : tasks.updatedAt

  const items = await db.query.tasks.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: orderFn(sortColumn),
  })
  const [totalRow] = await db
    .select({ total: count() })
    .from(tasks)

  return ok(c, {
    items,
    total: totalRow?.total ?? 0,
    page,
    pageSize,
  })
}

export const create: AppRouteHandler<CreateRoute> = async (
  c,
) => {
  const task = c.req.valid("json")
  const [inserted] = await db
    .insert(tasks)
    .values(task)
    .returning()
  return ok(c, inserted ?? null)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (
  c,
) => {
  const { id } = c.req.valid("param")
  const task = await db.query.tasks.findFirst({
    where: (fields, { eq }) => eq(fields.id, id),
  })
  if (!task) {
    return err(c, HttpStatusPhrases.NOT_FOUND, HttpStatusCodes.NOT_FOUND)
  }
  return ok(c, task)
}

export const update: AppRouteHandler<UpdateRoute> = async (
  c,
) => {
  const { id } = c.req.valid("param")
  const updates = c.req.valid("json")

  const [task] = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, id))
    .returning()
  if (!task) {
    return err(c, HttpStatusPhrases.NOT_FOUND, HttpStatusCodes.NOT_FOUND)
  }
  return ok(c, task)
}

export const remove: AppRouteHandler<RemoveRoute> = async (
  c,
) => {
  const { id } = c.req.valid("param")

  const result = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
  if (result.rowCount === 0) {
    return err(c, HttpStatusPhrases.NOT_FOUND, HttpStatusCodes.NOT_FOUND)
  }

  return noContent(c)
}
