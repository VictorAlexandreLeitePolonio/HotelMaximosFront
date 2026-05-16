import { Outlet, createFileRoute } from '@tanstack/react-router'
import { GuardedView } from '@/components/guarded-view'

export const Route = createFileRoute('/(authenticated)/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <GuardedView>
      <Outlet />
    </GuardedView>
  )
}
