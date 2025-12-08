import { LandlordCreatePage } from "@/components/dashboard/pages/landlord-create-page"

export default function EditLandlordPage({ params }: { params: { id: string } }) {
  return <LandlordCreatePage landlordId={params.id} />
}
