import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const PAYPAY_BASE_URL = "https://stg-api.sandbox.paypay.ne.jp";
const JSON_CONTENT_TYPE = "application/json;charset=UTF-8";

const API_KEY = process.env.PAYPAY_API_KEY;         // server API key
const API_SECRET = process.env.PAYPAY_API_SECRET;   // server secret
const MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;

/**
 * SAME HMAC SIGNATURE (WORKING)
 */
function buildHmacAuthHeader({ apiKey, apiSecret, method, path, body }) {
  const httpMethod = method.toUpperCase();
  const epoch = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  let contentType = "empty";
  let hash = "empty";
  let bodyString = "";

  if (body) {
    bodyString = JSON.stringify(body);
    contentType = JSON_CONTENT_TYPE;

    const md5 = crypto.createHash("md5");
    md5.update(contentType, "utf8");
    md5.update(bodyString, "utf8");
    hash = md5.digest("base64");
  }

  const dataToSign = [
    path,
    httpMethod,
    nonce,
    epoch,
    contentType,
    hash
  ].join("\n");

  const mac = crypto
    .createHmac("sha256", apiSecret)
    .update(dataToSign, "utf8")
    .digest("base64");

  return `hmac OPA-Auth:${apiKey}:${mac}:${nonce}:${epoch}:${hash}`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const responseToken = searchParams.get("responseToken");

  if (!responseToken) {
    return NextResponse.json({ error: "Missing responseToken" }, { status: 400 });
  }

  /**
   * 1️⃣ Decode responseToken
   */
  const decoded = jwt.decode(responseToken);

  if (!decoded?.userAuthorizationId) {
    return NextResponse.json(
      { error: "userAuthorizationId not found", decoded },
      { status: 400 }
    );
  }

  const userAuthorizationId = decoded.userAuthorizationId;

  /**
   * 2️⃣ Charge user (DIRECT PAY)
   */
  const path = "/v2/payments";

  const payload = {
    merchantPaymentId: `mp_${Date.now()}`,
    amount: {
      amount: 100, // 🔴 replace with cart total
      currency: "JPY"
    },
    orderDescription: "Direct PayPay Payment",
    userAuthorizationId,
    requestedAt: Math.floor(Date.now() / 1000)
  };

  const authHeader = buildHmacAuthHeader({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    method: "POST",
    path,
    body: payload
  });

  const response = await fetch(`${PAYPAY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": JSON_CONTENT_TYPE,
      "X-ASSUME-MERCHANT": MERCHANT_ID,
      Authorization: authHeader
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  /**
   * 3️⃣ Redirect user
   */
  if (response.ok) {
    return NextResponse.redirect(
      "https://endoscopic-burma-pretelephonic.ngrok-free.dev/payment-success"
    );
  }

  return NextResponse.redirect(
    "https://endoscopic-burma-pretelephonic.ngrok-free.dev/payment-failed"
  );
}
