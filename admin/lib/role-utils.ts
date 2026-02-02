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
  
  // Both ADMIN and SUPER_ADMIN use admin routes
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return '/admin/dashboard'
  } else if (role === 'AGENT') {
    return '/agent-login'
  }
  
  return '/'
}

export const canAccessRoute = (userRole: string | undefined, route: string): boolean => {
  if (!userRole) return false
  const role = userRole.toUpperCase()
  
  // Super admin can access all admin routes
  if (role === 'SUPER_ADMIN') {
    return route.startsWith('/admin/')
  }
  
  // Admin can only access specific routes
  if (role === 'ADMIN') {
    const adminRoutes = [
      '/admin/dashboard',
      '/admin/properties',
      '/admin/landlords',
      '/admin/users',
      '/admin/field-agents',
      '/admin/tenants'
    ]
    return adminRoutes.some(adminRoute => route.startsWith(adminRoute))
  }
  
  return false
}
