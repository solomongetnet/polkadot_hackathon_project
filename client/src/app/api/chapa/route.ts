import { NextResponse } from "next/server";

const CHAPA_API_URL = "https://api.chapa.co/v1";

export async function POST(req: Request) {
  const body = await req.json();

  console.log('body--------', body)

  try {
    const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Chapa Error:", data); // <-- log it here
      return NextResponse.json(
        { error: data.message || "Payment Failed", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Payment Failed. Please try again" },
      { status: 500 }
    );
  }
}
