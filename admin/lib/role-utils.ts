export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'AGENT' | 'USER' | 'PROPERTY_OWNER' | 'LANDLORD'

export const hasAccess = (userRole: string | undefined, requiredRoles: UserRole[]): boolean => {
  if (!userRole) return false
  const role = userRole.toUpperCase() as UserRole
  return requiredRoles.includes(role)
}

export const isAdmin = (userRole: string | undefined): boolean => {
  return hasAccess(userRole, ['ADMIN', 'SUPER_ADMIN'])
}

export const isSuperAdmin = (userRole: string | undefined): boolean => {
  return hasAccess(userRole, ['SUPER_ADMIN'])
}

export const getDashboardPath = (userRole: string | undefined): string => {
  if (!userRole) return '/'
  const role = userRole.toUpperCase()
  
  // SUPER_ADMIN uses /dashboard, ADMIN uses /admin/dashboard
  if (role === 'SUPER_ADMIN') {
    return '/dashboard'
  } else if (role === 'ADMIN') {
    return '/admin/dashboard'
  } else if (role === 'AGENT') {
    return '/agent-login'
  }
  
  return '/'
}

export const canAccessRoute = (userRole: string | undefined, route: string): boolean => {
  if (!userRole) return false
  const role = userRole.toUpperCase()
  
  // Super admin can access all routes (dashboard and all other routes)
  if (role === 'SUPER_ADMIN') {
    // Allow access to /dashboard and all routes within the dashboard layout
    return true
  }
  
  // Admin can only access specific routes
  if (role === 'ADMIN') {
    const adminRoutes = [
      '/admin/dashboard',
      '/admin/properties',
      '/admin/tasks',
      '/admin/landlords',
      '/admin/users',
      '/admin/field-agents',
      '/admin/tenants'
    ]
    return adminRoutes.some(adminRoute => route.startsWith(adminRoute))
  }
  
  return false
}
