
import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
} from "vitest";
import request from "supertest";
import type { PrismaClient } from "@prisma/client";
import type { Express } from "express";

let app: Express;
let prisma: PrismaClient;

const DEMO_USER_ID = 1;

async function createUser(id: number, name: string) {
  await prisma.user.create({
    data: {
      id,
      name,
      age: 22,
      photo: `/profiles/${name.toLowerCase()}.jpg`,
      bio: "Test profile",
      city: "Chennai",
      college: "Test College",
      interests: JSON.stringify(["Music", "Travel"]),
    },
  });
}

beforeAll(async () => {
  // Import AFTER the test database has been configured.
  const appModule = await import("../src/app");
  const prismaModule = await import("../src/lib/prisma");

  app = appModule.default;
  prisma = prismaModule.prisma;

  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.swipe.deleteMany();
  await prisma.user.deleteMany();

  await createUser(1, "Demo User");
  await createUser(2, "Ananya");
  await createUser(3, "Priya");
  await createUser(4, "Meera");

  // Ananya has already liked the demo user.
  await prisma.swipe.create({
    data: {
      fromUserId: 2,
      toUserId: DEMO_USER_ID,
      action: "LIKE",
    },
  });
});

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

describe("Coy Discover Real API Integration Tests", () => {
  it("returns backend health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("returns available profiles", async () => {
    const response = await request(app).get("/feed");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(3);
    expect(response.body.profiles).toHaveLength(3);
  });

  it("does not expose incoming likes in feed", async () => {
    const response = await request(app).get("/feed");

    expect(response.status).toBe(200);

    for (const profile of response.body.profiles) {
      expect(profile).not.toHaveProperty("hasLikedMe");
      expect(profile).not.toHaveProperty("incomingLike");
      expect(profile).not.toHaveProperty("sentSwipes");
      expect(profile).not.toHaveProperty("receivedSwipes");
    }
  });

  it("returns interests as arrays", async () => {
    const response = await request(app).get("/feed");

    expect(
      Array.isArray(response.body.profiles[0].interests)
    ).toBe(true);
  });

  it("removes passed profiles from feed", async () => {
    await request(app)
      .post("/swipe")
      .send({ targetUserId: 3, action: "PASS" });

    const response = await request(app).get("/feed");

    expect(
      response.body.profiles.some(
        (user: { id: number }) => user.id === 3
      )
    ).toBe(false);
  });

  it("creates a mutual match", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ targetUserId: 2, action: "LIKE" });

    expect(response.status).toBe(201);
    expect(response.body.isMatch).toBe(true);
    expect(response.body.matchedProfile.id).toBe(2);
  });

  it("does not match a one-sided like", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ targetUserId: 3, action: "LIKE" });

    expect(response.status).toBe(201);
    expect(response.body.isMatch).toBe(false);
  });

  it("rejects duplicate swipes", async () => {
    await request(app)
      .post("/swipe")
      .send({ targetUserId: 3, action: "LIKE" });

    const response = await request(app)
      .post("/swipe")
      .send({ targetUserId: 3, action: "LIKE" });

    expect(response.status).toBe(409);
  });

  it("rejects invalid actions", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ targetUserId: 3, action: "INVALID" });

    expect(response.status).toBe(400);
  });

  it("rejects swiping on yourself", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ targetUserId: 1, action: "LIKE" });

    expect(response.status).toBe(400);
  });

  it("rejects nonexistent profiles", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ targetUserId: 9999, action: "LIKE" });

    expect(response.status).toBe(404);
  });

  it("returns only mutual matches", async () => {
    await request(app)
      .post("/swipe")
      .send({ targetUserId: 2, action: "LIKE" });

    await request(app)
      .post("/swipe")
      .send({ targetUserId: 3, action: "LIKE" });

    const response = await request(app).get("/matches");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.matches[0].id).toBe(2);
  });

  it("PASS on an incoming like does not create a match", async () => {
    await request(app)
      .post("/swipe")
      .send({ targetUserId: 2, action: "PASS" });

    const response = await request(app).get("/matches");

    expect(response.body.count).toBe(0);
  });

  it("persists swipe records in SQLite", async () => {
    await request(app)
      .post("/swipe")
      .send({ targetUserId: 4, action: "PASS" });

    const savedSwipe = await prisma.swipe.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: DEMO_USER_ID,
          toUserId: 4,
        },
      },
    });

    expect(savedSwipe?.action).toBe("PASS");
  });
});
