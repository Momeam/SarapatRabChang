import { redirect } from "next/navigation";

export default function BookingPaymentRedirect() {
  redirect("/booking/checkout");
}
