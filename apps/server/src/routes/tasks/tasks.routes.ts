import {
  selectTasksSchema,
  inserTasksSchema,
  patchTasksSchema,
} from "@better-t-stack-template/db/schema/tasks"
import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "stoker/http-status-codes"
import {
  jsonContent,
  jsonContentRequired,
} from "stoker/openapi/helpers"
import {
  createErrorSchema,
  IdParamsSchema,
} from "stoker/openapi/schemas"

const tags = ["Tasks"]

export const list = createRoute({
  path: "/tasks",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectTasksSchema),
      "The list of tasks",
    ),
  },
})

export const create = createRoute({
  path: "/tasks",
  method: "post",
  request: {
    body: jsonContentRequired(
      inserTasksSchema,
      "The taks to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The created task",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(inserTasksSchema),
      "THe validation error(s)",
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
      "The request task",
    ),
  },
})

export const update = createRoute({
  path: "/tasks/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContent(
      patchTasksSchema,
      "The tasks to update",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The updated task",
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
  },
})

export type ListRoute = typeof list
export type CreateRoute = typeof create
export type UpdateRoute = typeof update
export type GetOneRoute = typeof getOne
export type RemoveRoute = typeof remove
