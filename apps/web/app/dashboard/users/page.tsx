"use client"

import { DataTable } from "@/app/dashboard/users/data-table"
import { columns, useUsers, useUsersSSE } from "@/app/dashboard/users/columns"

export default function UserPage() {
  useUsersSSE()
  const { users } = useUsers()

  return <DataTable columns={columns} data={users} />
}
