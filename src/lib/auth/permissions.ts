import { auth } from "@/auth";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
  }
}

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function assertAuthenticated() {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError("Não autenticado", 401);
  }
  return user;
}

export function assertOwner(userId: string, ownerId: string) {
  if (userId !== ownerId) {
    throw new ApiError("Acesso negado", 403);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
}
