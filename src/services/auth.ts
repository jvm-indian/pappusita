import type { User, UserRole } from '../lib/schemas'

export function getCurrentUser(): User | null {
  const str = localStorage.getItem('currentUser')
  if (!str) return null
  try {
    return JSON.parse(str) as User
  } catch {
    return null
  }
}

export function getCurrentUserRole(): UserRole | null {
  const user = getCurrentUser()
  return user ? user.role : null
}

export function logout(): void {
  localStorage.removeItem('currentUser')
}
