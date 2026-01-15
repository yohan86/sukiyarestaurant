import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const runtime = "nodejs";

export async function GET() {
  const payload = {
    aud: "paypay.ne.jp",
    iss: process.env.PAYPAY_MERCHANT_ID, // server-side only
    exp: Math.floor(Date.now() / 1000) + 300, // 5 min validity
    scope: ["direct_payment"],
    nonce: crypto.randomBytes(16).toString("hex"),
    redirectUrl: process.env.PAYPAY_REDIRECT_URI
  };

  const requestToken = jwt.sign(
    payload,
    process.env.PAYPAY_API_SECRET, // server-side secret
    { algorithm: "HS256" }
  );

  const url =
    `https://stg-www.sandbox.paypay.ne.jp/app/opa/user_authorization` +
    `?apiKey=${process.env.NEXT_PUBLIC_PAYPAY_API_KEY}` +
    `&requestToken=${encodeURIComponent(requestToken)}`;

  return NextResponse.redirect(url);
}
