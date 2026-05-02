import {
  hashPassword,
  verifyPassword,
  generateVerificationToken,
  validatePassword,
} from "@/backend/lib/auth";
import { retrieveContext } from "@/backend/lib/retrieval";
import { signToken, verifyToken } from "@/backend/lib/jwt";

// ------------------------------------------------------------------
// validatePassword
// ------------------------------------------------------------------
describe("validatePassword", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("abc")).toBe("Password must be at least 8 characters.");
    expect(validatePassword("1234567")).toBe("Password must be at least 8 characters.");
  });

  it("accepts passwords of 8+ characters", () => {
    expect(validatePassword("abcdefgh")).toBeNull();
    expect(validatePassword("a-long-secure-passphrase")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(validatePassword("")).not.toBeNull();
  });
});

// ------------------------------------------------------------------
// hashPassword / verifyPassword
// ------------------------------------------------------------------
describe("hashPassword + verifyPassword", () => {
  it("produces a non-empty hash", async () => {
    const hash = await hashPassword("mysecret1");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies the correct password", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(await verifyPassword("correct-horse-battery", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("two hashes for the same password are not equal (salt randomness)", async () => {
    const h1 = await hashPassword("samepassword");
    const h2 = await hashPassword("samepassword");
    expect(h1).not.toBe(h2);
  });
});

// ------------------------------------------------------------------
// generateVerificationToken
// ------------------------------------------------------------------
describe("generateVerificationToken", () => {
  it("returns a hex string of at least 32 bytes", () => {
    const { token } = generateVerificationToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThanOrEqual(64); // 32 bytes → 64 hex chars
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it("expires in approximately 24 hours", () => {
    const before = Date.now();
    const { expiresAt } = generateVerificationToken();
    const after = Date.now();

    const ms = expiresAt.getTime();
    expect(ms).toBeGreaterThanOrEqual(before + 23 * 60 * 60 * 1000);
    expect(ms).toBeLessThanOrEqual(after  + 25 * 60 * 60 * 1000);
  });

  it("each call produces a unique token", () => {
    const { token: t1 } = generateVerificationToken();
    const { token: t2 } = generateVerificationToken();
    expect(t1).not.toBe(t2);
  });
});

// ------------------------------------------------------------------
// JWT signToken / verifyToken
// ------------------------------------------------------------------
describe("JWT sign / verify", () => {
  const secret = "test-secret-at-least-32-chars-long-!!";

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
  });

  const payload = {
    userId:        "abc123",
    email:         "test@example.com",
    role:          "student",
    emailVerified: true,
  };

  it("signs and then verifies a token", () => {
    const token = signToken(payload);
    const result = verifyToken(token);
    expect(result.userId).toBe(payload.userId);
    expect(result.email).toBe(payload.email);
    expect(result.role).toBe(payload.role);
    expect(result.emailVerified).toBe(true);
  });

  it("throws on a tampered token", () => {
    const token = signToken(payload);
    const tampered = token.slice(0, -3) + "abc";
    expect(() => verifyToken(tampered)).toThrow();
  });

  it("includes emailVerified in the payload", () => {
    const unverified = signToken({ ...payload, emailVerified: false });
    const result = verifyToken(unverified);
    expect(result.emailVerified).toBe(false);
  });
});

// ------------------------------------------------------------------
// retrieveContext (knowledge base)
// ------------------------------------------------------------------
describe("retrieveContext", () => {
  it("returns relevant results for 'index fund'", () => {
    const results = retrieveContext("What is an index fund?");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].topic).toBe("index fund");
  });

  it("returns results for 'bonds'", () => {
    const results = retrieveContext("How safe are bonds?");
    expect(results.some((r) => r.topic === "bonds")).toBe(true);
  });

  it("returns results for 'compound interest'", () => {
    const results = retrieveContext("Tell me about compound interest");
    expect(results.some((r) => r.topic === "compound interest")).toBe(true);
  });

  it("returns empty array for unrelated queries", () => {
    const results = retrieveContext("favorite pizza toppings");
    expect(results).toHaveLength(0);
  });

  it("returns at most 3 results", () => {
    // Query likely to match several topics
    const results = retrieveContext("bonds stocks index fund mutual fund etf");
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("each result has required fields", () => {
    const results = retrieveContext("What is an ETF?");
    for (const r of results) {
      expect(typeof r.topic).toBe("string");
      expect(typeof r.summary).toBe("string");
      expect(typeof r.source).toBe("string");
      expect(typeof r.url).toBe("string");
      expect(r.url).toMatch(/^https?:\/\//);
    }
  });
});

// ------------------------------------------------------------------
// Unverified user gate — unit-level logic
// ------------------------------------------------------------------
describe("email verification gate", () => {
  it("a token with emailVerified:false is detectable", () => {
    process.env.JWT_SECRET = "test-secret-at-least-32-chars-long-!!";
    const token = signToken({
      userId:        "u1",
      email:         "a@b.com",
      role:          "student",
      emailVerified: false,
    });
    const payload = verifyToken(token);
    // Middleware checks this field to redirect unverified users
    expect(payload.emailVerified).toBe(false);
  });

  it("a token with emailVerified:true passes the gate", () => {
    const token = signToken({
      userId:        "u2",
      email:         "c@d.com",
      role:          "student",
      emailVerified: true,
    });
    expect(verifyToken(token).emailVerified).toBe(true);
  });
});
