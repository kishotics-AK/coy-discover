
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./coy-test.db",
    },
  },
});

const app = express();
app.use(express.json());

const DEMO_USER_ID = 1;

// Test API using the same database rules as Coy Discover.
app.get("/feed", async (_req, res) => {
  const swipes = await prisma.swipe.findMany({
    where: { fromUserId: DEMO_USER_ID },
    select: { toUserId: true },
  });

  const excludedIds = [
    DEMO_USER_ID,
    ...swipes.map((swipe) => swipe.toUserId),
  ];

  const users = await prisma.user.findMany({
    where: { id: { notIn: excludedIds } },
    orderBy: { id: "asc" },
  });

  res.json(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      age: user.age,
      photo: user.photo,
      bio: user.bio,
      city: user.city,
      college: user.college,
      interests: JSON.parse(user.interests),
    }))
  );
});

app.post("/swipe", async (req, res) => {
  const { toUserId, action } = req.body;

  if (
    !Number.isInteger(toUserId) ||
    !["LIKE", "PASS"].includes(action) ||
    toUserId === DEMO_USER_ID
  ) {
    return res.status(400).json({ error: "Invalid swipe" });
  }

  const target = await prisma.user.findUnique({
    where: { id: toUserId },
  });

  if (!target) {
    return res.status(404).json({ error: "User not found" });
  }

  const existing = await prisma.swipe.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: DEMO_USER_ID,
        toUserId,
      },
    },
  });

  if (existing) {
    return res.status(409).json({ error: "Already swiped" });
  }

  await prisma.swipe.create({
    data: {
      fromUserId: DEMO_USER_ID,
      toUserId,
      action,
    },
  });

  const reciprocal =
    action === "LIKE"
      ? await prisma.swipe.findFirst({
          where: {
            fromUserId: toUserId,
            toUserId: DEMO_USER_ID,
            action: "LIKE",
          },
        })
      : null;

  return res.json({
    success: true,
    isMatch: Boolean(reciprocal),
  });
});

app.get("/matches", async (_req, res) => {
  const myLikes = await prisma.swipe.findMany({
    where: {
      fromUserId: DEMO_USER_ID,
      action: "LIKE",
    },
  });

  const matches = [];

  for (const like of myLikes) {
    const reciprocal = await prisma.swipe.findFirst({
      where: {
        fromUserId: like.toUserId,
        toUserId: DEMO_USER_ID,
        action: "LIKE",
      },
    });

    if (reciprocal) {
      const user = await prisma.user.findUnique({
        where: { id: like.toUserId },
      });

      if (user) matches.push(user);
    }
  }

  res.json(matches);
});

async function createUser(id: number, name: string) {
  await prisma.user.create({
    data: {
      id,
      name,
      age: 22,
      photo: `https://example.com/${id}.jpg`,
      bio: "Test profile",
      city: "Chennai",
      college: "Test College",
      interests: JSON.stringify(["Music", "Travel"]),
    },
  });
}

beforeEach(async () => {
  await prisma.swipe.deleteMany();
  await prisma.user.deleteMany();

  await createUser(1, "Demo User");
  await createUser(2, "Ananya");
  await createUser(3, "Priya");
  await createUser(4, "Meera");

  // Ananya already likes the demo user.
  await prisma.swipe.create({
    data: {
      fromUserId: 2,
      toUserId: 1,
      action: "LIKE",
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Coy Discover API", () => {
  it("returns available profiles", async () => {
    const response = await request(app).get("/feed");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
  });

  it("does not reveal incoming likes in feed", async () => {
    const response = await request(app).get("/feed");

    expect(response.status).toBe(200);

    for (const profile of response.body) {
      expect(profile).not.toHaveProperty("hasLikedMe");
      expect(profile).not.toHaveProperty("incomingLike");
      expect(profile).not.toHaveProperty("sentSwipes");
      expect(profile).not.toHaveProperty("receivedSwipes");
    }
  });

  it("removes passed profiles from feed", async () => {
    await request(app)
      .post("/swipe")
      .send({ toUserId: 3, action: "PASS" });

    const response = await request(app).get("/feed");

    expect(response.body.some(
      (user: { id: number }) => user.id === 3
    )).toBe(false);
  });

  it("creates a mutual match", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ toUserId: 2, action: "LIKE" });

    expect(response.status).toBe(200);
    expect(response.body.isMatch).toBe(true);
  });

  it("does not create a match for a one-sided like", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ toUserId: 3, action: "LIKE" });

    expect(response.status).toBe(200);
    expect(response.body.isMatch).toBe(false);
  });

  it("rejects duplicate swipes", async () => {
    await request(app)
      .post("/swipe")
      .send({ toUserId: 3, action: "LIKE" });

    const response = await request(app)
      .post("/swipe")
      .send({ toUserId: 3, action: "LIKE" });

    expect(response.status).toBe(409);
  });

  it("rejects invalid actions", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ toUserId: 3, action: "INVALID" });

    expect(response.status).toBe(400);
  });

  it("rejects swiping on yourself", async () => {
    const response = await request(app)
      .post("/swipe")
      .send({ toUserId: 1, action: "LIKE" });

    expect(response.status).toBe(400);
  });

  it("shows only mutual matches", async () => {
    await request(app)
      .post("/swipe")
      .send({ toUserId: 2, action: "LIKE" });

    await request(app)
      .post("/swipe")
      .send({ toUserId: 3, action: "LIKE" });

    const response = await request(app).get("/matches");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(2);
  });

  it("persists swipe records in SQLite", async () => {
    await request(app)
      .post("/swipe")
      .send({ toUserId: 4, action: "PASS" });

    const savedSwipe = await prisma.swipe.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: 1,
          toUserId: 4,
        },
      },
    });

    expect(savedSwipe?.action).toBe("PASS");
  });
});
