import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  handleApiError,
} from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export async function PATCH() {
  try {
    const user = await assertAuthenticated();

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
