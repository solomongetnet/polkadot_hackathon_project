import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

const COOKIE_NAME = "guestId";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

/** Generate a new UUID guestId */
export function generateGuestId(): string {
  return uuidv4();
}

/** Get guestId from cookies (server-side, async) */
export async function getGuestIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const guestCookie = cookieStore.get(COOKIE_NAME);
  return guestCookie?.value || null;
}

/** Save guestId in cookie (server-side, async) */
export async function saveGuestIdInCookie(guestId: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: guestId,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    httpOnly: false, // set true to hide from client JS
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/** Delete guestId cookie (server-side, async) */
export async function deleteGuestIdFromCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  });
}
