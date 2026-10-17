import { OrdersList } from "@/features/account";

/** `/account/orders` — order history + delivery status for the signed-in user. */
export default function AccountOrdersPage() {
  return <OrdersList />;
}
