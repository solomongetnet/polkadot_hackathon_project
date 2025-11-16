"use client";

import { initializePayment } from "@/server/actions/chapa.actions";
import { useMutation } from "@tanstack/react-query";

export default function PaymentButton() {
  const mutation = useMutation({
    mutationFn: async (payload: any) => initializePayment(payload),
  });

  const handleClick = async () => {
    const txRef = `TX-${Math.random().toString(36).slice(2)}`;
    const response = await mutation.mutateAsync({
      first_name: "Solomon",
      last_name: "getnet",
      email: "sola@gmail.com",
      phone_number: "0911867911",
      currency: "ETB",
      amount: "300",
      tx_ref: txRef,
      callback_url: `${window.location.origin}/callback`,
      return_url: `${window.location.origin}/return`,
    });

    console.log(response);
    if (response.data.checkout_url) {
      window.location.href =response.data.checkout_url;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={mutation.isPending}
      className="px-4 py-2 bg-green-600 text-white rounded-md"
    >
      {mutation.isPending ? "Processing..." : "Pay with Chapa"}
    </button>
  );
}
