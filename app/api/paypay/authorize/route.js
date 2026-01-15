export const runtime = "nodejs";

import { NextResponse } from "next/server";

const PAYPAY_CLIENT_ID = process.env.PAYPAY_CLIENT_ID;
const REDIRECT_URI = process.env.PAYPAY_REDIRECT_URI;

export async function GET() {
  if (!PAYPAY_CLIENT_ID || !REDIRECT_URI) {
    return NextResponse.json({ error: "Missing client ID or redirect URI" }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const url = `https://stg-www.sandbox.paypay.ne.jp/web/v1/oauth2/authorize?client_id=${PAYPAY_CLIENT_ID}&response_type=code&scope=direct_payment&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;

  return NextResponse.json({ url });
}
