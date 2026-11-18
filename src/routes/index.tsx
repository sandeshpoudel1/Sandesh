import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { invitation as inv } from "@/config/invitation";
import { LangProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Closing } from "@/components/invite/Closing";
import { PrefsBar } from "@/components/invite/Controls";
import { Countdown } from "@/components/invite/Countdown";
import { Cover } from "@/components/invite/Cover";
import { DateReveal } from "@/components/invite/DateReveal";
import { Families } from "@/components/invite/Families";
import { Hero } from "@/components/invite/Hero";
import { Letter } from "@/components/invite/Letter";
import { Schedule } from "@/components/invite/Schedule";
import { Venue } from "@/components/invite/Venue";

const title = "Sandesh & Sahana · शुभ विवाह";
const description =
  "You are warmly invited to the wedding of Sandesh Paudel and Sahana Dhungel, 5 December 2026, Lalitpur.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      // WhatsApp and Messenger only show the preview card for an absolute image URL
      ...(__SITE_URL__
        ? [
            { property: "og:image", content: `${__SITE_URL__}/og.jpg` },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:image:alt", content: "Sandesh & Sahana wedding invitation" },
            { property: "og:url", content: `${__SITE_URL__}/` },
            { name: "twitter:image", content: `${__SITE_URL__}/og.jpg` },
          ]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#fbf4ec" },
    ],
  }),
  component: Index,
});

function Index() {
  const [opened, setOpened] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => setHydrated(true), []);

  // Start inside the opening tap so mobile browsers permit audio.
  const play = () => {
    if (!audio.current) return;
    audio.current.volume = 0.3;
    void audio.current.play().catch(() => {
      // A later page interaction can retry if the browser temporarily blocks playback.
    });
  };

  useEffect(() => {
    if (!opened) return;
    const resume = () => {
      if (document.visibilityState === "visible" && audio.current?.paused) play();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") audio.current?.pause();
      else resume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("pointerdown", resume);
    document.addEventListener("keydown", resume);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
    };
  }, [opened]);

  return (
    <ThemeProvider initial={inv.defaultTheme}>
      <LangProvider initial={inv.defaultLang}>
        <Cover
          onOpen={() => {
            setOpened(true);
            play();
          }}
        />
        <PrefsBar />
        {/* inert only after hydration, so without JavaScript the content stays usable */}
        <main className={opened ? "is-open" : undefined} inert={hydrated && !opened}>
          <Hero opened={opened} />
          <Letter />
          <DateReveal />
          <Countdown />
          <Families />
          <Schedule />
          <Venue />
      
          <Closing />
        </main>
        {inv.music && <audio ref={audio} src={inv.music.src} loop preload="auto" />}
      </LangProvider>
    </ThemeProvider>
  );
}
