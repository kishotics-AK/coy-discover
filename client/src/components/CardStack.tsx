
import ProfileCard, {
  type SwipeAction,
  type SwipeResult,
} from "./ProfileCard";

import type { Profile } from "../services/api";

interface Props {
  profiles: Profile[];
  disabled: boolean;
  onSwipe: (action: SwipeAction) => Promise<SwipeResult | null>;
  onSwipeComplete: (result: SwipeResult) => void;
  onEffect: (action: SwipeAction) => void;
}

export default function CardStack({
  profiles,
  disabled,
  onSwipe,
  onSwipeComplete,
  onEffect,
}: Props) {
  const currentProfile = profiles[0];

  if (!currentProfile) return null;

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* Decorative layers only — no extra profile photos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-7 top-3 bottom-10 rounded-[34px] bg-[#f8dce6] shadow-[0_15px_35px_rgba(180,70,110,0.1)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-1.5 bottom-8 rounded-[34px] bg-[#fff0f4] shadow-sm"
      />

      <div className="relative z-10">
        <ProfileCard
          key={currentProfile.id}
          profile={currentProfile}
          disabled={disabled}
          onSwipe={onSwipe}
          onSwipeComplete={onSwipeComplete}
          onEffect={onEffect}
        />
      </div>
    </div>
  );
}
