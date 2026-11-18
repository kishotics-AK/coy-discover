
import { Router } from "express";
import { prisma, DEMO_USER_ID } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const profiles = await prisma.user.findMany({
      where: {
        id: { not: DEMO_USER_ID },
        receivedSwipes: {
          none: {
            fromUserId: DEMO_USER_ID,
          },
        },
      },
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
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      count: profiles.length,
      profiles: profiles.map((profile) => ({
        ...profile,
        interests: JSON.parse(profile.interests),
      })),
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profiles",
    });
  }
});

export default router;
