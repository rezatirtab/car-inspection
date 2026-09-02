import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE.name);
    return apiSuccess({ loggedOut: true });
  } catch (err) {
    return handleApiError(err);
  }
}
