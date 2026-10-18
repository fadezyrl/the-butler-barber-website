import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type RevalidateBody = {
  tags?: string[];
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    body = {};
  }

  const tags =
    Array.isArray(body.tags) && body.tags.length > 0
      ? body.tags
      : ["cms", "cms-home"];

  for (const tag of tags) {
    if (typeof tag === "string" && tag.trim()) {
      revalidateTag(tag, "max");
    }
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    now: Date.now(),
  });
};
