// app/actions.ts
"use server"; // This directive marks the file (or function) as a Server Action

import prisma from "../config/prisma";
import { createUserPlanHelper } from "../helper/plan.helpers";

export const paidNow = async () => {
  // ✅ Find payment record
  const tx_ref = "";
  const userId = "3DMpnv3iDoa1t09BgVjEZtnn33mOiSRA";
  const planId = "cmdqnhxok0001upl4bu7lgp49";

  // const payment = await prisma.payment.findFirst({
  //   where: { transactionRef: tx_ref },
  // });

  // const transaction_id = "";

  // if (!payment) return;
  // // ✅ Update payment status
  // const updatedPayment = await prisma.payment.update({
  //   where: { id: payment.id },
  //   data: {
  //     status: status.toUpperCase() as any,
  //     transactionId: transaction_id,
  //     amount: Number(400),
  //     phoneNumber: "0911981122",
  //   },
  // });

  // ✅ If payment is successful, create or queue user plan
  try {
    await createUserPlanHelper({
      userId: userId,

      planId: planId,
      // paymentId: updatedPayment.id,
    });
    console.log("done");
  } catch (planError) {
    console.log({ planError });
    console.log("error happend");
  }
};
