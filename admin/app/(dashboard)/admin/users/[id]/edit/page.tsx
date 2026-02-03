import { UserCreatePage } from "@/components/dashboard/pages/user-create-page"

export default function AdminEditUserPage({ params }: { params: { id: string } }) {
  return <UserCreatePage userId={params.id} />
}
