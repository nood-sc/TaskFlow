import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 中间件专用的会话刷新 helper
 * 只做两件事：
 * 1. 刷新 Supabase 会话 Cookie（防止 access token 过期后失效）
 * 2. 基础路由守卫（未登录访问业务页跳 /login；已登录访问登录页跳 /projects）
 * 不在此处放置任何业务逻辑。
 */
export async function updateSession(request: NextRequest) {
  // 环境变量未配置时跳过会话处理（本地占位阶段），填好 .env.local 后自动生效
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 刷新会话（官方推荐做法：调用 getUser 以确认/刷新登录态）
  // 兜底：Supabase 环境变量未配置或网络异常时，视为未登录，避免页面 500
  let user = null
  try {
    const {
      data: { user: u },
    } = await supabase.auth.getUser()
    user = u
  } catch {
    user = null
  }

  // 受保护路由：未登录 → 跳转登录页
  const isProtected = request.nextUrl.pathname.startsWith('/projects')
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 已登录用户访问登录/注册页 → 跳回项目列表
  if (
    user &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/projects'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
