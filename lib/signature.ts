import { createHmac, timingSafeEqual } from "crypto";

function bufferize(payload: string | Buffer) {
  return Buffer.isBuffer(payload) ? payload : Buffer.from(payload, "utf8");
}

export function verifyHmacSignature({
  payload,
  secret,
  signature,
  digest = "sha256"
}: {
  payload: string | Buffer;
  secret: string;
  signature: string | Buffer;
  digest?: "sha1" | "sha256";
}): boolean {
  const expected = createHmac(digest, secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(bufferize(expected), bufferize(signature));
  } catch (error) {
    return false;
  }
}
