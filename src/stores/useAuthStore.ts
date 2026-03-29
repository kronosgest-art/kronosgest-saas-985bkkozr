import { useState, useEffect } from 'react'

export type Role = 'admin' | 'clinic' | 'patient' | null

let globalRole: Role = null
const listeners = new Set<() => void>()

export default function useAuthStore() {
  const [role, setRole] = useState<Role>(globalRole)

  useEffect(() => {
    const listener = () => setRole(globalRole)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    role,
    login: (newRole: Role) => {
      globalRole = newRole
      listeners.forEach((l) => l())
    },
    logout: () => {
      globalRole = null
      listeners.forEach((l) => l())
    },
  }
}
