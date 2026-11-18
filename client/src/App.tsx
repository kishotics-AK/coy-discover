
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Compass,
  Heart,
  Home,
  MapPin,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import CardStack from "./components/CardStack";
import HeartParticles from "./components/HeartParticles";

import type {
  SwipeAction,
  SwipeResult,
} from "./components/ProfileCard";

import {
  getFeed,
  getMatches,
  submitSwipe,
  type Profile,
} from "./services/api";

type Tab = "home" | "discover" | "matches";

type ParticleEffect = {
  id: number;
  action: SwipeAction;
};

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "matches", label: "Matches", icon: Heart },
] as const;

export default function App() {
  const [tab, setTab] = useState<Tab>("discover");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState("");
  const [newMatch, setNewMatch] = useState<Profile | null>(null);
  const [effect, setEffect] = useState<ParticleEffect | null>(null);
  const [totalProfiles, setTotalProfiles] = useState(0);

  const swipeLock = useRef(false);
  const loadRequest = useRef(0);

  async function loadData() {
    const requestId = ++loadRequest.current;

    setLoading(true);
    setError("");

    try {
      const [feed, matchData] = await Promise.all([
        getFeed(),
        getMatches(),
      ]);

      if (requestId !== loadRequest.current) return;

      setProfiles(feed);
      setMatches(matchData);
      setTotalProfiles(feed.length);
    } catch (err) {
      console.error(err);

      if (requestId === loadRequest.current) {
        setError("We couldn't load your profiles. Please try again.");
      }
    } finally {
      if (requestId === loadRequest.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadData();

    return () => {
      loadRequest.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!effect) return;

    const timeout = window.setTimeout(() => {
      setEffect((current) =>
        current?.id === effect.id ? null : current
      );
    }, 1300);

    return () => window.clearTimeout(timeout);
  }, [effect]);

  async function handleSwipe(
    action: SwipeAction
  ): Promise<SwipeResult | null> {
    if (
      swipeLock.current ||
      loading ||
      profiles.length === 0
    ) {
      return null;
    }

    swipeLock.current = true;
    setSwiping(true);
    setError("");

    try {
      const result = await submitSwipe(
        profiles[0].id,
        action
      );

      if (!result.success) {
        swipeLock.current = false;
        setSwiping(false);
        setError("Couldn't save your swipe. Please try again.");
        return null;
      }

      return result;
    } catch (err) {
      console.error(err);
      setError("Couldn't save your swipe. Please try again.");
      swipeLock.current = false;
      setSwiping(false);
      return null;
    }
  }

  function handleSwipeComplete(result: SwipeResult) {
    setProfiles((previous) => previous.slice(1));

    if (result.isMatch && result.matchedProfile) {
      const matched = result.matchedProfile;

      setMatches((previous) => [
        matched,
        ...previous.filter(
          (item) => item.id !== matched.id
        ),
      ]);

      setNewMatch(matched);
    }

    swipeLock.current = false;
    setSwiping(false);
  }

  function triggerEffect(action: SwipeAction) {
    setEffect({
      id: Date.now(),
      action,
    });
  }

  const explored = Math.max(
    0,
    totalProfiles - profiles.length
  );

  const progress =
    totalProfiles > 0
      ? (explored / totalProfiles) * 100
      : 0;

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#fff9f7] text-[#30242d]">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-[#ffe4ec]/65 blur-[95px]" />
        <div className="absolute -right-28 top-[38%] h-80 w-80 rounded-full bg-[#fce4ea]/55 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-[#fff0df]/60 blur-[90px]" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1100px] flex-col">
        {/* Header */}
        <header className="relative z-20 flex items-center justify-between px-5 pb-3 pt-5 sm:px-9 sm:pt-7">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f43f76] text-white shadow-[0_7px_20px_rgba(244,63,118,0.2)]">
              <Heart
                size={20}
                fill="currentColor"
                strokeWidth={1.8}
              />
            </div>

            <span className="text-[27px] font-black tracking-[-0.07em]">
              coy
              <span className="text-[#f43f76]">.</span>
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#f7e4e9] bg-white/85 px-3 py-2 text-[11px] font-semibold text-[#a65d78] shadow-sm backdrop-blur-xl sm:px-4 sm:text-xs">
            <Sparkles size={14} />
            <span>
              {tab === "discover"
                ? "Your kind of connection"
                : tab === "matches"
                ? "Made to connect"
                : "Welcome to Coy"}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex w-full flex-1 flex-col px-4 pb-32 pt-3 sm:px-8 sm:pt-5">
          {error && (
            <div
              role="alert"
              className="mx-auto mb-5 flex w-full max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-red-600 shadow-sm"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() => void loadData()}
                className="inline-flex items-center gap-1.5 font-bold underline underline-offset-4"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {tab === "home" && (
              <motion.section
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1"
                aria-label="Home"
              />
            )}

            {tab === "discover" && (
              <motion.section
                key="discover"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mx-auto flex w-full max-w-[880px] flex-col"
              >
                {/* Editorial heading */}
                <div className="mx-auto mb-5 w-full max-w-[560px] text-center sm:mb-7">
                  <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.23em] text-[#df7294] sm:text-xs">
                    <span className="h-px w-5 bg-[#df7294]" />
                    THE DISCOVER EDIT
                    <span className="h-px w-5 bg-[#df7294]" />
                  </div>

                  <h1 className="text-[30px] font-bold leading-tight tracking-[-0.055em] text-[#33222c] sm:text-[43px]">
                    Find your kind of
                    <span className="italic text-[#ee5b89]">
                      {" "}spark.
                    </span>
                  </h1>

                  <p className="mt-2 text-xs leading-relaxed text-[#99858f] sm:text-sm">
                    A little curiosity can lead to something lovely.
                  </p>
                </div>

                {/* Progress */}
                {!loading &&
                  profiles.length > 0 && (
                    <div className="mx-auto mb-5 w-full max-w-[420px]">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
                        <span className="flex items-center gap-1.5 text-[#a06d80]">
                          <Sparkles size={13} />
                          Your discovery journey
                        </span>

                        <span className="tabular-nums text-[#c76b89]">
                          {profiles.length} remaining
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-[#f7e5eb]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#ff9ab6] to-[#f43f76]"
                          initial={false}
                          animate={{
                            width: `${progress}%`,
                          }}
                          transition={{
                            duration: 0.35,
                          }}
                        />
                      </div>
                    </div>
                  )}

                {/* Profile area */}
                {loading ? (
                  <div className="mx-auto w-full max-w-[420px] animate-pulse">
                    <div className="h-[min(60dvh,520px)] min-h-[350px] rounded-[34px] bg-[#f8e5ea]" />
                    <div className="mx-auto mt-5 h-4 w-48 rounded-full bg-[#f8e5ea]" />
                  </div>
                ) : error && profiles.length === 0 ? (
                  <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-[#f38bab] shadow-sm">
                      <RefreshCw size={32} />
                    </div>

                    <h2 className="text-xl font-bold">
                      Connection interrupted
                    </h2>

                    <p className="mt-2 text-sm text-[#99858f]">
                      We couldn't load your profiles.
                    </p>

                    <button
                      type="button"
                      onClick={() => void loadData()}
                      className="mt-6 rounded-full bg-[#f43f76] px-6 py-3 text-sm font-bold text-white"
                    >
                      Try again
                    </button>
                  </div>
                ) : profiles.length > 0 ? (
                  <div className="w-full">
                    <CardStack
                      profiles={profiles}
                      disabled={swiping}
                      onSwipe={handleSwipe}
                      onSwipeComplete={handleSwipeComplete}
                      onEffect={triggerEffect}
                    />

                    <div className="mt-3 flex items-center justify-center gap-3 text-[11px] font-medium text-[#ae98a3]">
                      <span className="flex items-center gap-1">
                        <X size={13} />
                        Pass
                      </span>

                      <span className="h-1 w-1 rounded-full bg-[#d8c5ce]" />

                      <span>Swipe to discover</span>

                      <span className="h-1 w-1 rounded-full bg-[#d8c5ce]" />

                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        Like
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-16 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#ffe8ef] text-[#f43f76]">
                      <Heart
                        size={43}
                        fill="currentColor"
                      />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">
                      All caught up, lovely.
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-[#99858f]">
                      You've explored every profile for now.
                      Great connections are worth the wait.
                    </p>

                    <button
                      type="button"
                      onClick={() => setTab("matches")}
                      className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f43f76] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_25px_rgba(244,63,118,0.22)]"
                    >
                      View your matches
                      <ArrowRight size={17} />
                    </button>
                  </div>
                )}
              </motion.section>
            )}

            {tab === "matches" && (
              <motion.section
                key="matches"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mx-auto w-full max-w-[850px]"
              >
                <div className="mb-7">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#df7294]">
                    <Sparkles size={14} />
                    SOMETHING SPECIAL
                  </div>

                  <h1 className="text-[34px] font-bold tracking-[-0.055em] sm:text-[46px]">
                    Your <span className="italic text-[#f43f76]">matches.</span>
                  </h1>

                  <p className="mt-2 text-sm text-[#99858f]">
                    The best connections go both ways.
                  </p>
                </div>

                {!loading && matches.length > 0 && (
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5dce4] bg-white px-4 py-2 text-xs font-semibold text-[#ca5d82] shadow-sm">
                    <Heart
                      size={14}
                      fill="currentColor"
                    />
                    {matches.length} mutual{" "}
                    {matches.length === 1
                      ? "connection"
                      : "connections"}
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="aspect-[3/4] animate-pulse rounded-[26px] bg-[#f8e5ea]"
                      />
                    ))}
                  </div>
                ) : matches.length === 0 ? (
                  <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
                    <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[32px] bg-[#ffe8ef] text-[#f43f76]">
                      <Heart size={42} />
                    </div>

                    <h2 className="text-2xl font-bold">
                      Your story starts here.
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-[#99858f]">
                      No mutual matches yet. Keep discovering
                      people who share your spark.
                    </p>

                    <button
                      type="button"
                      onClick={() => setTab("discover")}
                      className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f43f76] px-6 py-3 text-sm font-bold text-white"
                    >
                      Start discovering
                      <ArrowRight size={17} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
                    {matches.map((profile, index) => (
                      <motion.article
                        key={profile.id}
                        initial={{
                          opacity: 0,
                          y: 20,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        transition={{
                          delay: Math.min(index * 0.06, 0.3),
                          duration: 0.3,
                        }}
                        className="group relative aspect-[3/4] overflow-hidden rounded-[24px] bg-[#f8e5ea] shadow-[0_12px_35px_rgba(110,45,70,0.09)] sm:rounded-[30px]"
                      >
                        <img
                          src={profile.photo}
                          alt={profile.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#20121c]/90 via-transparent to-black/10" />

                        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md">
                          <Heart
                            size={17}
                            fill="currentColor"
                          />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-5">
                          <h3 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                            {profile.name}, {profile.age}
                          </h3>

                          <p className="mt-1 flex items-center gap-1 text-xs text-white/85">
                            <MapPin
                              size={12}
                              className="shrink-0"
                            />
                            <span className="truncate">
                              {profile.city}
                            </span>
                          </p>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating navigation dock */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="flex w-full max-w-[390px] items-center justify-around rounded-[28px] border border-white/90 bg-white/95 p-2 shadow-[0_12px_45px_rgba(97,42,66,0.15)] backdrop-blur-xl">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-[21px] text-[11px] font-semibold transition-colors ${
                  active
                    ? "text-[#f43f76]"
                    : "text-[#aa9aa2] hover:text-[#e66b91]"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-navigation"
                    className="absolute inset-0 rounded-[21px] bg-[#fff0f4]"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                <Icon
                  size={21}
                  fill={
                    active && id === "matches"
                      ? "currentColor"
                      : "none"
                  }
                  className="relative z-10"
                />

                <span className="relative z-10">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Swipe particles */}
      <AnimatePresence>
        {effect && (
          <motion.div
            key={effect.id}
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeartParticles type={effect.action} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match celebration */}
      <AnimatePresence>
        {newMatch && (
          <motion.div
            key={newMatch.id}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#261420]/75 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="match-title"
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 40,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 20,
              }}
              className="relative w-full max-w-[390px] overflow-hidden rounded-[36px] bg-[#fffaf8] px-6 pb-8 pt-10 text-center shadow-2xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-[#ffe0e9] blur-[55px]"
              />

              <button
                type="button"
                aria-label="Close match celebration"
                onClick={() => setNewMatch(null)}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#9c8390] shadow-sm"
              >
                <X size={18} />
              </button>

              <div className="relative z-10">
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                  }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#ffe4ed] text-[#f43f76]"
                >
                  <Heart
                    size={34}
                    fill="currentColor"
                  />
                </motion.div>

                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d57796]">
                  A LITTLE MAGIC HAPPENED
                </p>

                <h2
                  id="match-title"
                  className="mt-2 text-[38px] font-bold leading-tight tracking-[-0.06em] text-[#f43f76]"
                >
                  It's a Match!
                </h2>

                <div className="relative mx-auto mt-7 flex w-fit items-center justify-center">
                  <div className="absolute h-36 w-36 rounded-full border border-[#f8c8d7]" />

                  <img
                    src={newMatch.photo}
                    alt={newMatch.name}
                    className="relative h-28 w-28 rounded-full border-[5px] border-white object-cover shadow-[0_10px_30px_rgba(130,45,75,0.18)]"
                  />

                  <div className="absolute -bottom-2 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#fffaf8] bg-[#f43f76] text-white">
                    <Heart
                      size={18}
                      fill="currentColor"
                    />
                  </div>
                </div>

                <p className="mt-8 text-sm leading-relaxed text-[#887580]">
                  You and{" "}
                  <strong className="text-[#382832]">
                    {newMatch.name}
                  </strong>{" "}
                  liked each other.
                  <span className="mt-1 block">
                    Looks like the feeling is mutual!
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setNewMatch(null);
                    setTab("matches");
                  }}
                  className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7299] to-[#f43f76] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(244,63,118,0.24)]"
                >
                  See your matches
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setNewMatch(null)}
                  className="mt-4 min-h-10 text-sm font-semibold text-[#ae8797]"
                >
                  Keep discovering
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
