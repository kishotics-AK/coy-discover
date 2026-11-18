
import { Router } from "express";
import { prisma, DEMO_USER_ID } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const myLikes = await prisma.swipe.findMany({
      where: {
        fromUserId: DEMO_USER_ID,
        action: "LIKE",
        toUser: {
          sentSwipes: {
            some: {
              toUserId: DEMO_USER_ID,
              action: "LIKE",
            },
          },
        },
      },
      select: {
        toUser: {
          select: {
            id: true,
            name: true,
            age: true,
            photo: true,
            bio: true,
            city: true,
            college: true,
            interests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: myLikes.length,
      matches: myLikes.map(({ toUser }) => ({
        ...toUser,
        interests: JSON.parse(toUser.interests),
      })),
    });
  } catch (error) {
    console.error("Matches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch matches",
    });
  }
});

export default router;
