import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json({
    ok: true,
    message: "This endpoint will be used for forwarding magnet links to Transmission.",
  });
}
