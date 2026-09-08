import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditProjectForm from '@/components/projects/edit-project-form'

/**
 * 编辑项目页（路由：/projects/[id]/edit）
 *
 * 这是"服务端取数据 + 客户端表单"的标准组合：
 * 1. 这个页面是服务端组件：先查出项目旧数据（RLS 保证只能是自己的）
 * 2. 查到 → 把数据作为 props 传给客户端表单组件（EditProjectForm）预填
 * 3. 查不到 / 不是自己的 → notFound() 显示 404
 */
export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !project) notFound()

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-zinc-900">编辑项目</h1>
      <EditProjectForm
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
        }}
      />
    </div>
  )
}
