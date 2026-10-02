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
  { id: "l-bread-discount", text: "A loaf of bread costs 4 dollars. It is 25 percent off. How many dollars do you save?", answer: 1, unit: "dollar" },
  { id: "l-shirt-sale", text: "A shirt costs 40 dollars and is 10 percent off. What is the sale price in dollars?", answer: 36, unit: "dollars" },
  { id: "l-apples", text: "Apples cost 2 dollars a kilo. How much do 3 kilos cost in dollars?", answer: 6, unit: "dollars" },
  { id: "l-change", text: "You buy milk for 3 dollars and eggs for 5 dollars. You pay with a 20 dollar bill. How much change do you get?", answer: 12, unit: "dollars" },
  { id: "l-half-price", text: "A jacket costs 50 dollars. Today it is half price. How many dollars does it cost?", answer: 25, unit: "dollars" },
  { id: "l-tip", text: "Your lunch costs 30 dollars. You leave a 20 percent tip. How many dollars is the tip?", answer: 6, unit: "dollars" },
  { id: "l-yogurt", text: "A pack of 6 yogurts costs 3 dollars. How many cents does one yogurt cost?", answer: 50, unit: "cents" },
  { id: "l-oranges", text: "A bag of oranges costs 8 dollars. You buy 2 bags and get 25 percent off the total. How many dollars do you pay?", answer: 12, unit: "dollars" },
  { id: "l-shoes", text: "A pair of shoes costs 60 dollars and is 15 percent off. How many dollars do you save?", answer: 9, unit: "dollars" },
  { id: "l-budget", text: "Your grocery budget is 48 dollars and you spend 12 dollars. What percent of your budget did you spend?", answer: 25, unit: "%" },
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

/** The mode whose problem today is `id`, or null if it isn't one of today's problems. */
export function getDailyMode(id: string, date = new Date()): Mode | null {
  return (Object.keys(BANKS) as Mode[]).find((mode) => getDailyProblem(mode, date).id === id) ?? null;
}
