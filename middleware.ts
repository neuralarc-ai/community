import { createServerClient } from './app/lib/supabaseServerClient'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = await createServerClient()

  // This will refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/posts', '/workshops', '/meetings']
  const authRoutes = ['/login', '/signup']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname === route)

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // If user is logged in and on auth pages, redirect based on role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'admin' ? '/dashboard' : '/posts'
    return NextResponse.redirect(url)
  }

  // If user is authenticated and accessing protected routes, check if they have a profile
  if (user && isProtectedRoute) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

      // PGRST116 = no rows returned (profile doesn't exist)
      if (error && error.code === 'PGRST116') {
        // If no profile exists, redirect to complete profile
        const url = request.nextUrl.clone()
        url.pathname = '/complete-profile'
        return NextResponse.redirect(url)
      } else if (error) {
        // For other errors (connection, permissions, etc.), log and allow access
        console.error("Error checking profile in middleware:", error);
      }

      // If profile exists, check dashboard access
      if (profile && request.nextUrl.pathname.startsWith('/dashboard') && profile.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/posts' // Redirect non-admins to posts
        return NextResponse.redirect(url)
      }
      // If profile exists, continue normally
    } catch (error) {
      console.error("Unexpected error checking profile in middleware:", error);
      // For unexpected errors, allow access rather than blocking the user
    }
  }

  // If user has a profile and tries to access complete-profile page, redirect to their main page
  if (user && request.nextUrl.pathname === '/complete-profile') {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single()

      // If profile exists, redirect based on role
      if (profile && !error) {
        const url = request.nextUrl.clone()
        url.pathname = profile.role === 'admin' ? '/dashboard' : '/posts'
        return NextResponse.redirect(url)
      }
      // If no profile or error, allow access to complete-profile page
    } catch (error) {
      console.error("Error checking profile in middleware:", error);
      // If there's an error, allow access to complete-profile page
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (Supabase auth routes often get proxied through /api/auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
