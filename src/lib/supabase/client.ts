import { createBrowserClient } from '@supabase/ssr'

/**
 * 浏览器端 Supabase 客户端
 * 仅在客户端组件（"use client"）中读取登录态等场景使用。
 * 所有数据读写都应走服务端（Server Components / Server Actions），
 * 浏览器端不直接执行 .from() 查询，以缩小数据暴露面。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
