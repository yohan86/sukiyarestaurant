import crypto from "crypto";

const PAYPAY_BASE_URL = "https://stg-api.sandbox.paypay.ne.jp";
const JSON_CONTENT_TYPE = "application/json;charset=UTF-8";

const API_KEY = process.env.PAYPAY_API_KEY;
const API_SECRET = process.env.PAYPAY_API_SECRET;
const MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;

// SAME SIGNATURE FUNCTION (reuse yours)
function buildHmacAuthHeader({ apiKey, apiSecret, method, path, body }) {
  const httpMethod = method.toUpperCase();
  const epoch = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const bodyString = JSON.stringify(body);
  const md5 = crypto.createHash("md5");
  md5.update(JSON_CONTENT_TYPE, "utf8");
  md5.update(bodyString, "utf8");
  const hash = md5.digest("base64");

  const dataToSign = [
    path,
    httpMethod,
    nonce,
    epoch,
    JSON_CONTENT_TYPE,
    hash
  ].join("\n");

  const macData = crypto
    .createHmac("sha256", apiSecret)
    .update(dataToSign, "utf8")
    .digest("base64");

  return `hmac OPA-Auth:${apiKey}:${macData}:${nonce}:${epoch}:${hash}`;
}

export async function POST(req) {
  const body = await req.json();
  const amount = Number(body.amount ?? 10);
  const description = body.description ?? "Direct PayPay Payment";

  if (!Number.isInteger(amount) || amount < 1) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  const path = "/v2/payments";

  const payload = {
    merchantPaymentId: `mp_${Date.now()}`,
    amount: {
      amount,
      currency: "JPY"
    },
    orderDescription: description,
    redirectUrl: "https://endoscopic-burma-pretelephonic.ngrok-free.dev/payment-result",
    redirectType: "WEB_LINK",
    requestedAt: Math.floor(Date.now() / 1000),
    userAgent: "Mozilla/5.0"
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

  return Response.json({ raw: data }, { status: response.status });
}
