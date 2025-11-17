"use server";

import { NextRequest, NextResponse } from "next/server";
// import { headers } from "next/headers";
// import { authClient } from "./lib/auth-client";

export async function middleware(request: NextRequest) {
  // const { data } = await authClient.getSession({
  //   fetchOptions: { headers: await headers() },
  // });
  // const url = request.nextUrl.clone();
  // const isAuthenticated = !!data;

  // console.log({ data });

  // if (!isAuthenticated && !url.pathname.includes("auth")) {
  //   url.pathname = "/auth";
  //   return NextResponse.redirect(url);
  // }

  // if (isAuthenticated && url.pathname.includes("auth")) {
  //   url.pathname = "/";
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Apply middleware to all routes except API and static files
};
