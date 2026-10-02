"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { HeadphonesIcon } from "@/components/ui/icons";
import { PlayButton } from "@/components/ui/play-button";
import type { PublicProblem } from "@/lib/problems";
import { AnswerForm } from "./answer-form";

export function ListenCard({ problem }: { problem: PublicProblem }) {
  const [playing, setPlaying] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  // Stop speech if the card unmounts mid-utterance.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggle() {
    const synth = window.speechSynthesis;
    if (!synth) {
      setUnsupported(true);
      return;
    }
    synth.cancel();
    if (playing) {
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(problem.text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onend = utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    synth.speak(utterance);
  }

  return (
    <Card>
      <CardHeader icon={HeadphonesIcon} title="Listen & solve" />
      <div className="mt-8 flex flex-col items-center gap-4 md:mt-[50px]">
        <PlayButton
          playing={playing}
          label={playing ? "Stop playback" : "Play today’s problem"}
          onClick={toggle}
        />
        <p className="text-base text-muted md:text-caption" aria-hidden="true">
          {playing ? "Playing…" : "Play today’s problem"}
        </p>
        {unsupported && (
          <p role="status" className="text-center text-base md:text-caption">
            Audio isn’t available in this browser. {problem.text}
          </p>
        )}
      </div>
      <AnswerForm problemId={problem.id} label="Answer to the listening problem" />
    </Card>
  );
}
