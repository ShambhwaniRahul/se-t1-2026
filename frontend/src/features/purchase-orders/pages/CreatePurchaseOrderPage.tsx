import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { PurchaseOrderForm } from "../components/PurchaseOrderForm";

export default function CreatePurchaseOrderPage() {
  return (
    <PageLayout>
      <PageHeader title="Create Purchase Order" description="Add a new supply order for a vendor" />
      <PurchaseOrderForm />
    </PageLayout>
  );
}
