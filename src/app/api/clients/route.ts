import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createClientSchema } from "@/lib/validation/schemas";
import { listClients, createClient } from "@/services/clients/clientService";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const search = req.nextUrl.searchParams.get("search") ?? undefined;
    const clients = await listClients(search);
    return apiSuccess({ clients });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = createClientSchema.parse(await req.json());
    const client = await createClient(body);
    return apiSuccess({ client }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
