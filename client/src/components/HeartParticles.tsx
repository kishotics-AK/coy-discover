
import { motion } from "motion/react";
import { Heart, HeartCrack } from "lucide-react";

type Props = {
  type: "LIKE" | "PASS";
};

const particles = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  left: 8 + ((index * 37) % 84),
  delay: (index % 5) * 0.055,
  size: 18 + ((index * 11) % 25),
  drift: ((index * 29) % 160) - 80,
  rotation: ((index * 47) % 100) - 50,
}));

export default function HeartParticles({ type }: Props) {
  const isLike = type === "LIKE";

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {particles.map((particle) => {
        const Icon = isLike ? Heart : HeartCrack;

        return (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.left}%`,
              bottom: "25%",
              color: isLike ? "#f9a8d4" : "#ef4444",
            }}
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: isLike ? -420 : -260,
              x: particle.drift,
              scale: [0.3, 1.25, 1],
              rotate: particle.rotation,
            }}
            transition={{
              duration: 0.95,
              delay: particle.delay,
              ease: "easeOut",
            }}
          >
            <Icon
              size={particle.size}
              fill={isLike ? "#fbcfe8" : "none"}
              strokeWidth={2.5}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
