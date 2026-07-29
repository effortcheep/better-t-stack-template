import { useForm } from "@tanstack/react-form"
import { useCallback } from "react"

import {
  useCreateUser,
  useChangePassword,
} from "@/features/admin/api"
import type { CreateUserBody } from "@/features/admin/types"

/** 创建用户表单逻辑与 UI 解耦 (#64) */
export function useCreateUserForm(onSuccess?: () => void) {
  const createUser = useCreateUser()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      username: "",
    } satisfies CreateUserBody,
    onSubmit: async ({ value }) => {
      await createUser.mutateAsync(value)
      onSuccess?.()
    },
  })

  return { form, isPending: createUser.isPending }
}

export function useChangePasswordForm(
  userId: string,
  onSuccess?: () => void,
) {
  const changePassword = useChangePassword(userId)

  const form = useForm({
    defaultValues: { password: "" },
    onSubmit: async ({ value }) => {
      await changePassword.mutateAsync(value)
      onSuccess?.()
    },
  })

  const reset = useCallback(() => {
    form.reset()
  }, [form])

  return { form, isPending: changePassword.isPending, reset }
}
