
import { useRef, useState } from "react";
import {
  Heart,
  MapPin,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";

import type { Profile } from "../services/api";

export type SwipeAction = "LIKE" | "PASS";

export type SwipeResult = {
  success: boolean;
  isMatch: boolean;
  matchedProfile?: Profile;
};

interface Props {
  profile: Profile;
  onSwipe: (action: SwipeAction) => Promise<SwipeResult | null>;
  onSwipeComplete: (result: SwipeResult) => void;
  onEffect: (action: SwipeAction) => void;
  disabled?: boolean;
}

export default function ProfileCard({
  profile,
  onSwipe,
  onSwipeComplete,
  onEffect,
  disabled = false,
}: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-300, 0, 300], [-17, 0, 17]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  const imageScale = useTransform(x, [-300, 0, 300], [1.06, 1, 1.06]);

  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  function snapBack() {
    animate(x, 0, {
      type: "spring",
      stiffness: 380,
      damping: 28,
    });
    animate(y, 0, {
      type: "spring",
      stiffness: 380,
      damping: 28,
    });
  }

  async function performSwipe(action: SwipeAction) {
    if (busyRef.current || disabled) return;

    busyRef.current = true;
    setBusy(true);

    let result: SwipeResult | null = null;

    try {
      result = await onSwipe(action);
    } catch (error) {
      console.error("Swipe failed:", error);
    }

    if (!result?.success) {
      busyRef.current = false;
      setBusy(false);
      snapBack();
      return;
    }

    onEffect(action);

    const direction = action === "LIKE" ? 1 : -1;

    await Promise.all([
      animate(x, direction * 750, {
        duration: 0.48,
        ease: "easeIn",
      }),
      animate(y, -70, {
        duration: 0.48,
        ease: "easeIn",
      }),
    ]);

    onSwipeComplete(result);
  }

  function handleDragEnd(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    if (busyRef.current || disabled) return;

    if (info.offset.x > 110 || info.velocity.x > 700) {
      void performSwipe("LIKE");
    } else if (
      info.offset.x < -110 ||
      info.velocity.x < -700
    ) {
      void performSwipe("PASS");
    } else {
      snapBack();
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[420px] pb-9">
      <motion.article
        style={{
          x,
          y,
          rotate,
          touchAction: "pan-y",
        }}
        drag={!disabled && !busy ? "x" : false}
        dragMomentum={false}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        className="relative h-[clamp(420px,69dvh,640px)] cursor-grab select-none overflow-hidden rounded-[34px] border-[5px] border-white bg-[#f9e9ee] shadow-[0_24px_65px_rgba(111,49,77,0.18)] active:cursor-grabbing"
      >
        {/* Full-height profile photo */}
        <motion.img
          style={{ scale: imageScale }}
          src={profile.photo}
          alt={`${profile.name}'s profile`}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Soft cinematic overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#130b14]/95 via-[#251522]/30 to-black/10" />

        {/* Top pill */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur-xl">
          <Sparkles size={14} />
          A little spark starts here
        </div>

        {/* Swipe indicators */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="pointer-events-none absolute left-5 top-20 -rotate-12 rounded-xl border-4 border-[#ff8cae] bg-[#f43f76]/30 px-5 py-2 text-2xl font-black tracking-widest text-white"
        >
          LIKE
        </motion.div>

        <motion.div
          style={{ opacity: passOpacity }}
          className="pointer-events-none absolute right-5 top-20 rotate-12 rounded-xl border-4 border-white/80 bg-black/30 px-5 py-2 text-2xl font-black tracking-widest text-white"
        >
          NOPE
        </motion.div>

        {/* All profile information overlays the photo */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pb-16 text-white sm:p-7 sm:pb-16">
          <h2 className="text-[32px] font-bold leading-tight tracking-tight sm:text-[38px]">
            {profile.name}
            <span className="ml-2 font-normal text-white/90">
              {profile.age}
            </span>
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {profile.city}
            </span>

            {profile.college && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <GraduationCap size={15} />
                <span className="max-w-[180px] truncate">
                  {profile.college}
                </span>
              </span>
            )}
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/90">
            {profile.bio}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {profile.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </motion.article>

      {/* Floating action buttons */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-7">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Pass on profile"
          disabled={busy || disabled}
          onClick={() => void performSwipe("PASS")}
          className="pointer-events-auto flex h-[68px] w-[68px] items-center justify-center rounded-full border border-[#f7d7df] bg-white text-[#f05b78] shadow-[0_12px_35px_rgba(100,35,65,0.16)] disabled:opacity-50"
        >
          <X size={30} strokeWidth={2.7} />
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Like profile"
          disabled={busy || disabled}
          onClick={() => void performSwipe("LIKE")}
          className="pointer-events-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-[#ff7b9d] to-[#f43f76] text-white shadow-[0_12px_35px_rgba(244,63,118,0.32)] disabled:opacity-50"
        >
          <Heart size={28} fill="currentColor" />
        </motion.button>
      </div>
    </div>
  );
}
