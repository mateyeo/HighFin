import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;
const EXPIRES_IN = "30d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  if (!SECRET) throw new Error("JWT_SECRET is not defined.");
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  if (!SECRET) throw new Error("JWT_SECRET is not defined.");
  return jwt.verify(token, SECRET) as TokenPayload;
}

/** Extract and verify the bearer token from a Request. Throws on failure. */
export function getAuthUser(request: Request): TokenPayload {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Missing authorization token.");
  return verifyToken(token);
}
