import { NextResponse } from "next/server";
import { fetchUnifiedNewsFeed } from "@/lib/news";

export async function GET() {
  try {
    const { items, errors } = await fetchUnifiedNewsFeed();
    return NextResponse.json({ items, errors });
  } catch {
    return NextResponse.json(
      { message: "Could not load news feed." },
      { status: 500 },
    );
  }
}
