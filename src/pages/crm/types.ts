export type Tag = {
  id: string
  name: string
  color: string
}

export type Tab = {
  id: string
  name: string
  tagId: string | null
}

export type Lead = {
  id: string
  name: string
  email: string
  phone: string
  tagId: string | null
  status: string
  createdAt: string
}
