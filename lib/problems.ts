import "server-only";

export type Mode = "read" | "listen";

export type Problem = {
  id: string;
  text: string;
  answer: number;
  /** Shown after a correct answer, e.g. "20 minutes". */
  unit?: string;
};

/** What the client is allowed to see: never the answer. */
export type PublicProblem = Pick<Problem, "id" | "text">;

const READ: Problem[] = [
  { id: "r-runner-laps", text: "A runner completes 3 laps in 12 minutes. How long will 5 laps take at the same pace?", answer: 20, unit: "minutes" },
  { id: "r-cyclist-speed", text: "A cyclist rides 45 kilometers in 1.5 hours. What is her average speed in kilometers per hour?", answer: 30, unit: "km/h" },
  { id: "r-swim-lengths", text: "A pool is 25 meters long. How many lengths does a swimmer need to cover 1.5 kilometers?", answer: 60, unit: "lengths" },
  { id: "r-free-throws", text: "A player makes 18 of 24 free throws. What percentage did she make?", answer: 75, unit: "%" },
  { id: "r-marathon-split", text: "A marathon is about 42 kilometers. If a runner holds 5 minutes per kilometer, how many minutes will the race take?", answer: 210, unit: "minutes" },
  { id: "r-team-points", text: "A team scores 96 points over 4 quarters. On average, how many points per quarter is that?", answer: 24, unit: "points" },
  { id: "r-jump-rope", text: "Maya skips rope 120 times a minute. How many skips does she make in 2 minutes and 30 seconds?", answer: 300, unit: "skips" },
  { id: "r-relay", text: "A 400 meter relay is split evenly between 4 runners. The team finishes in 52 seconds. What is the average time per leg in seconds?", answer: 13, unit: "seconds" },
  { id: "r-training-week", text: "A rower trains 45 minutes a day, 6 days a week. How many hours is that per week?", answer: 4.5, unit: "hours" },
  { id: "r-hike-climb", text: "A trail climbs 600 meters over 4 kilometers. On average, how many meters does it climb per kilometer?", answer: 150, unit: "meters" },
];

const LISTEN: Problem[] = [
  { id: "l-goals", text: "A striker scores 2 goals every 3 games. How many goals will she score in 12 games?", answer: 8, unit: "goals" },
  { id: "l-steps", text: "You walk 800 steps every 10 minutes. How many steps do you take in half an hour?", answer: 2400, unit: "steps" },
  { id: "l-pushups", text: "Sam does 15 push-ups a day for one week. How many push-ups is that in total?", answer: 105, unit: "push-ups" },
  { id: "l-bottles", text: "A team of 11 players each drink 2 bottles of water at practice. How many bottles is that?", answer: 22, unit: "bottles" },
  { id: "l-laps-left", text: "A race is 16 laps. You have finished 3 quarters of it. How many laps are left?", answer: 4, unit: "laps" },
  { id: "l-court", text: "A tennis court is 24 meters long. How far do you run going down and back 5 times?", answer: 240, unit: "meters" },
  { id: "l-score", text: "A basketball team makes 9 two-point shots and 4 three-point shots. How many points do they score?", answer: 30, unit: "points" },
  { id: "l-bike-time", text: "You cycle at 20 kilometers per hour. How many minutes does a 5 kilometer ride take?", answer: 15, unit: "minutes" },
  { id: "l-medals", text: "A country wins 36 medals. One third of them are gold. How many gold medals did it win?", answer: 12, unit: "medals" },
  { id: "l-warmup", text: "A warm-up has 4 drills of 90 seconds each. How many minutes long is the warm-up?", answer: 6, unit: "minutes" },
];

const BANKS: Record<Mode, Problem[]> = { read: READ, listen: LISTEN };

/** Days since the Unix epoch for a UTC date; the daily rotation index. */
function dayNumber(date: Date) {
  return Math.floor(date.getTime() / 86_400_000);
}

/** Today's problem for a mode. Rotates once per UTC day. */
export function getDailyProblem(mode: Mode, date = new Date()): PublicProblem {
  const bank = BANKS[mode];
  const { id, text } = bank[dayNumber(date) % bank.length];
  return { id, text };
}

export function findProblem(id: string): Problem | undefined {
  return READ.find((p) => p.id === id) ?? LISTEN.find((p) => p.id === id);
}
