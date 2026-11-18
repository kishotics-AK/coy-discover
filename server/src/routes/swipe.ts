
import { Router } from "express";
import { prisma, DEMO_USER_ID } from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  const { targetUserId, action } = req.body ?? {};

  // Validate incoming request
  if (
    !Number.isInteger(targetUserId) ||
    targetUserId <= 0 ||
    !["LIKE", "PASS"].includes(action)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid targetUserId or action",
    });
    return;
  }

  if (targetUserId === DEMO_USER_ID) {
    res.status(400).json({
      success: false,
      message: "You cannot swipe on yourself",
    });
    return;
  }

  try {
    // Run the swipe operation atomically.
    const result = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          name: true,
          age: true,
          photo: true,
          city: true,
        },
      });

      if (!target) {
        return { type: "NOT_FOUND" as const };
      }

      const existingSwipe = await tx.swipe.findUnique({
        where: {
          fromUserId_toUserId: {
            fromUserId: DEMO_USER_ID,
            toUserId: targetUserId,
          },
        },
      });

      if (existingSwipe) {
        return { type: "DUPLICATE" as const };
      }

      await tx.swipe.create({
        data: {
          fromUserId: DEMO_USER_ID,
          toUserId: targetUserId,
          action,
        },
      });

      // Only check incoming likes after our user likes.
      if (action === "LIKE") {
        const reciprocalLike = await tx.swipe.findUnique({
          where: {
            fromUserId_toUserId: {
              fromUserId: targetUserId,
              toUserId: DEMO_USER_ID,
            },
          },
          select: { action: true },
        });

        if (reciprocalLike?.action === "LIKE") {
          return {
            type: "SUCCESS" as const,
            isMatch: true,
            matchedProfile: target,
          };
        }
      }

      return {
        type: "SUCCESS" as const,
        isMatch: false,
      };
    });

    if (result.type === "NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Profile not found",
      });
      return;
    }

    if (result.type === "DUPLICATE") {
      res.status(409).json({
        success: false,
        message: "Profile already swiped",
      });
      return;
    }

    res.status(201).json({
      success: true,
      isMatch: result.isMatch,
      ...(result.isMatch
        ? { matchedProfile: result.matchedProfile }
        : {}),
    });
  } catch (error) {
    console.error("Swipe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record swipe",
    });
  }
});

export default router;
