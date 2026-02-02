import { PropertyCreatePage } from "@/components/dashboard/pages/property-create-page"

export default function AdminEditPropertyRoute({ params }: { params: { id: string } }) {
  return <PropertyCreatePage propertyId={params.id} />
}
