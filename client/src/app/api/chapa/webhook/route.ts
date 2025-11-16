import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/config/prisma";
import { ITransactionWebhookResponse } from "@/interface/chapa.interface";
import crypto from "crypto";
import { createUserPlanHelper } from "@/server/helper/plan.helpers";

const CHAPA_WEBHOOK_SECRET = process.env.CHAPA_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body: ITransactionWebhookResponse = await req.json();

    const hashedSignature = crypto
      .createHmac("sha256", CHAPA_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    const incomingSignature =
      req.headers.get("x-chapa-signature") ||
      req.headers.get("Chapa-Signature");

    // ✅ Validate webhook signature
    if (hashedSignature !== incomingSignature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    const { tx_ref, status, reference: transaction_id, amount, mobile } = body;

    // ✅ Validate transaction data
    if (!tx_ref || !status) {
      return NextResponse.json(
        { message: "Invalid data received" },
        { status: 400 }
      );
    }

    // ✅ Find payment record
    const payment = await prisma.payment.findFirst({
      where: { transactionRef: tx_ref },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    // ✅ Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status.toUpperCase() as any,
        transactionId: transaction_id,
        amount: Number(amount),
        phoneNumber: mobile,
      },
    });

    // ✅ If payment is successful, create or queue user plan
    if (status.toLowerCase() === "success") {
      try {
        await createUserPlanHelper({
          userId: payment.userId,
          planId: payment.planIdToUpgrade,
          paymentId: updatedPayment.id,
        });
      } catch (planError) {
        return NextResponse.json(
          { message: "Payment updated but plan creation failed." },
          { status: 500 }
        );
      }
    }

    // ✅ Return success response
    return NextResponse.json(
      { message: "Payment processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Some error occurred. Please try again." },
      { status: 500 }
    );
  }
}
