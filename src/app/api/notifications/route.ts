import { prisma } from "@/lib/db";
import {
  assertAuthenticated,
  handleApiError,
} from "@/lib/auth/permissions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await assertAuthenticated();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}
