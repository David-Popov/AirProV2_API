/**
 * Avatar helpers shared by the dashboard sidebar and the employees views.
 * Previously duplicated inline in DashboardLayout and EmployeesPage.
 */

/** Two-letter initials from a full name (first + last initial, else first 2 chars). */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-violet-500/20 text-violet-500',
  'bg-blue-500/20 text-blue-500',
  'bg-green-500/20 text-green-500',
  'bg-amber-500/20 text-amber-500',
  'bg-pink-500/20 text-pink-500',
  'bg-cyan-500/20 text-cyan-500',
  'bg-orange-500/20 text-orange-500',
  'bg-indigo-500/20 text-indigo-500',
]

/** Deterministic avatar color class from a name (stable across renders). */
export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
