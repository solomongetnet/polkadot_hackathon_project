"use server";

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { authClient } from "./lib/auth-client";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const res = await auth.api.getSession({
    headers: await headers(),
  });

  const url = request.nextUrl.clone();
  const isAuthenticated = !!res?.user;

  if (!isAuthenticated && !url.pathname.includes("auth")) {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && url.pathname.includes("auth")) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Apply middleware to all routes except API and static files
  runtime: "nodejs",
};
