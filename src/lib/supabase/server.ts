import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 服务端 Supabase 客户端
 * 供 Server Components / Server Actions 读写数据库使用。
 * 通过请求 Cookie 携带用户会话，配合数据库 RLS 实现数据隔离。
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在 Server Component 中调用 setAll 会抛错，
            // 会话刷新由 middleware（src/middleware.ts）负责，这里静默忽略。
          }
        },
      },
    }
  )
}
