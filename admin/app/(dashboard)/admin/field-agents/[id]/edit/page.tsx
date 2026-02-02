import { FieldAgentCreatePage } from "@/components/dashboard/pages/field-agent-create-page"

export default function AdminEditFieldAgentPage({ params }: { params: { id: string } }) {
  return <FieldAgentCreatePage agentId={params.id} />
}
