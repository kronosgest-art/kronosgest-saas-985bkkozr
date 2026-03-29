import { useState, useEffect } from 'react'

export type Role = 'admin' | 'clinic' | 'patient' | null

// Basic global state implementation since Zustand is not available
let globalRole: Role = null
const listeners = new Set<() => void>()

const useAuthStore = () => {
  const [role, setRole] = useState<Role>(globalRole)

  useEffect(() => {
    const listener = () => setRole(globalRole)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const login = (newRole: Role) => {
    globalRole = newRole
    listeners.forEach((l) => l())
  }

  const logout = () => {
    globalRole = null
    listeners.forEach((l) => l())
  }

  return { role, login, logout }
}

export default useAuthStore
