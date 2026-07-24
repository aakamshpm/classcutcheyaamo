import { SignJWT, jwtVerify } from "jose";

// the mobile app authenticates with a bearer token instead of the cookie
// session the web app uses. we sign a small JWT with the same AUTH_SECRET
// the rest of the app already relies on, so there's no new secret to manage.
// stateless: no db table, the token itself carries the user id.

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me",
);

const ISSUER = "classcutcheyaamo";
const AUDIENCE = "classcutcheyaamo-mobile";
// long-lived so the app doesn't log people out constantly — this is a
// low-stakes personal tracker, not a bank. 90 days.
const EXPIRY = "90d";

export type TokenPayload = { userId: string; username: string };

export async function signApiToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret);
}

// returns the payload if valid, or null if missing/expired/tampered
export async function verifyApiToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.sub !== "string") return null;
    return {
      userId: payload.sub,
      username: String(payload.username ?? ""),
    };
  } catch {
    return null;
  }
}
