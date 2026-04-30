export type Column = {
  id: string
  name: string
  color?: string
}

export type Lead = {
  id: string
  name: string
  email: string
  phone: string
  columnId: string | null
  status: string
  createdAt: string
}
