import {
  selectTasksSchema,
  insertTasksSchema,
  patchTasksSchema,
} from "@better-t-stack-template/db/schema/tasks"
import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import { z } from "zod"
import {
  createErrorSchema,
  IdParamsSchema,
} from "stoker/openapi/schemas"

import {
  bodyContent,
  bodyContentRequired,
  jsonContent,
  paginatedSchema,
  paginationQuerySchema,
} from "~/lib/response-helpers"

const tags = ["Tasks"]

export const list = createRoute({
  path: "/tasks",
  method: "get",
  request: {
    query: paginationQuerySchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      paginatedSchema(selectTasksSchema),
      "The paginated list of tasks",
    ),
  },
})

export const create = createRoute({
  path: "/tasks",
  method: "post",
  request: {
    body: bodyContentRequired(
      insertTasksSchema,
      "The task to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The created task",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertTasksSchema),
      "The validation error(s)",
    ),
  },
})

export const getOne = createRoute({
  path: "/tasks/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The requested task",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.null(),
      "Task not found",
    ),
  },
})

export const update = createRoute({
  path: "/tasks/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: bodyContent(
      patchTasksSchema,
      "The task to update",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The updated task",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.null(),
      "Task not found",
    ),
  },
})

export const remove = createRoute({
  path: "/tasks/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Task deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.null(),
      "Task not found",
    ),
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type UpdateRoute = typeof update
export type GetOneRoute = typeof getOne
export type RemoveRoute = typeof remove
