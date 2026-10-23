import "server-only";

export type Mode = "read" | "listen";

export type Problem = {
  id: string;
  text: string;
  answer: number;
  /** Shown after a correct answer, e.g. "20 minutes". "$" formats the answer as money, e.g. "$7.20". */
  unit?: string;
};

/** What the client is allowed to see: never the answer. */
export type PublicProblem = Pick<Problem, "id" | "text">;

const READ: Problem[] = [
  { id: "r-lap-pace", text: "A runner completes 3 laps in 12 minutes. How long will 5 laps take at the same pace?", answer: 20, unit: "minutes" },
  { id: "r-cyclist-avg", text: "A cyclist rides 84 kilometers in 3 hours. What is her average speed in kilometers per hour?", answer: 28, unit: "km/h" },
  { id: "r-swim-lengths", text: "A pool is 25 meters long. How many lengths does a swimmer need to cover 1,500 meters?", answer: 60, unit: "lengths" },
  { id: "r-free-throw-pct", text: "A player makes 18 of 24 free throws. What percentage did she make?", answer: 75, unit: "%" },
  { id: "r-marathon-pace", text: "A runner holds 5 minutes per kilometer over a 42 kilometer marathon. How many minutes will the race take?", answer: 210, unit: "minutes" },
  { id: "r-points-avg", text: "A basketball player scores 23, 17, 31 and 25 points in four games. What is her average points per game?", answer: 24, unit: "points" },
  { id: "r-jump-rope", text: "Maya skips rope 120 times a minute. How many skips does she make in 2 minutes and 30 seconds?", answer: 300, unit: "skips" },
  { id: "r-relay-split", text: "A 4 × 100 meter relay team finishes in 52 seconds. What is the average time per leg in seconds?", answer: 13, unit: "seconds" },
  { id: "r-training-week", text: "A rower trains 40 minutes a day, 6 days a week. How many hours is that per week?", answer: 4, unit: "hours" },
  { id: "r-hike-climb", text: "A trail climbs 600 meters over 4 kilometers. On average, how many meters does it climb per kilometer?", answer: 150, unit: "meters" },
  { id: "r-sprint-speed", text: "A sprinter runs 200 meters in 25 seconds. What is her average speed in meters per second?", answer: 8, unit: "m/s" },
  { id: "r-long-jump-avg", text: "A long jumper's three jumps are 642, 687 and 651 centimeters. What is her average jump in centimeters?", answer: 660, unit: "cm" },
  { id: "r-hit-rate", text: "A batter gets 27 hits in 90 at-bats. What percentage of his at-bats were hits?", answer: 30, unit: "%" },
  { id: "r-goal-pct", text: "A soccer team takes 25 shots and scores 6 goals. What percentage of its shots were goals?", answer: 24, unit: "%" },
  { id: "r-10k-pace", text: "A runner finishes 10 kilometers in 50 minutes. What is her average pace in minutes per kilometer?", answer: 5, unit: "minutes" },
  { id: "r-swim-total", text: "A swimmer's four laps take 31, 32, 30 and 33 seconds. What is her total time in seconds?", answer: 126, unit: "seconds" },
  { id: "r-first-serves", text: "A tennis player lands 42 of 60 first serves. What percentage is that?", answer: 70, unit: "%" },
  { id: "r-bike-distance", text: "A cyclist rides at 24 kilometers per hour for 2 hours and 30 minutes. How many kilometers does he ride?", answer: 60, unit: "km" },
  { id: "r-high-jump", text: "A high jumper clears 185 centimeters. The bar goes up 4 centimeters each round. What height in centimeters is the bar after 3 more rounds?", answer: 197, unit: "cm" },
  { id: "r-gym-score", text: "A gymnast's four routines score 13, 14, 12 and 13 points. What is her average score?", answer: 13, unit: "points" },
  { id: "r-step-week", text: "Ella walks 8,400 steps a day for a week. How many steps is that in total?", answer: 58_800, unit: "steps" },
  { id: "r-rowing-speed", text: "A rowing crew covers 2,000 meters in 6 minutes and 40 seconds. What is its average speed in meters per second?", answer: 5, unit: "m/s" },
  { id: "r-season-wins", text: "A team wins 15 of its 25 games. What percentage of its games did it win?", answer: 60, unit: "%" },
  { id: "r-climb-rate", text: "A climber scales a 15 meter wall in 1 minute and 15 seconds. On average, how many seconds does each meter take?", answer: 5, unit: "seconds" },
  { id: "r-ski-runs", text: "A skier drops 1,260 meters over 9 runs of equal height. How many meters is each run?", answer: 140, unit: "meters" },
  { id: "r-swim-calories", text: "A swimmer burns 9 calories a minute. How many calories does a 40 minute swim burn?", answer: 360, unit: "calories" },
  { id: "r-race-gap", text: "The winner of a 1,500 meter race finishes in 3 minutes and 38 seconds, and the runner-up in 3 minutes and 45 seconds. How many seconds behind was the runner-up?", answer: 7, unit: "seconds" },
  { id: "r-golf-avg", text: "A golfer shoots 72, 69, 74 and 73 over four rounds. What is her average score per round?", answer: 72, unit: "strokes" },
  { id: "r-triathlon", text: "A triathlete swims 1,500 meters, bikes 40 kilometers and runs 10 kilometers. What is the total distance in meters?", answer: 51_500, unit: "meters" },
  { id: "r-field-lengths", text: "A soccer field is 105 meters long. A player runs its length 6 times. How many meters is that?", answer: 630, unit: "meters" },
];

const LISTEN: Problem[] = [
  { id: "l-bread-save", text: "A loaf of bread costs 4 dollars and 60 cents. It is 25 percent off. How many dollars do you save?", answer: 1.15, unit: "$" },
  { id: "l-shirt-price", text: "A shirt costs 24 dollars and 50 cents and is 10 percent off. What is the sale price in dollars?", answer: 22.05, unit: "$" },
  { id: "l-apples-kilo", text: "Apples cost 2 dollars and 40 cents a kilo. How many dollars do 3 kilos cost?", answer: 7.2, unit: "$" },
  { id: "l-change-twenty", text: "You buy milk for 2 dollars and 75 cents and eggs for 4 dollars and 50 cents. You pay with a 20 dollar bill. How many dollars of change do you get?", answer: 12.75, unit: "$" },
  { id: "l-jacket-half", text: "A jacket costs 49 dollars and 90 cents. Today it is half price. How many dollars does it cost?", answer: 24.95, unit: "$" },
  { id: "l-lunch-tip", text: "Your lunch costs 32 dollars and 50 cents. You leave a 20 percent tip. How many dollars is the tip?", answer: 6.5, unit: "$" },
  { id: "l-yogurt-each", text: "A pack of 6 yogurts costs 3 dollars and 90 cents. How many cents does one yogurt cost?", answer: 65, unit: "cents" },
  { id: "l-oranges-deal", text: "A bag of oranges costs 6 dollars and 40 cents. You buy 2 bags and get 25 percent off the total. How many dollars do you pay?", answer: 9.6, unit: "$" },
  { id: "l-shoes-save", text: "A pair of shoes costs 58 dollars and is 15 percent off. How many dollars do you save?", answer: 8.7, unit: "$" },
  { id: "l-budget", text: "Your grocery budget is 48 dollars and you spend 12 dollars. What percent of your budget did you spend?", answer: 25, unit: "%" },
  { id: "l-coffee-four", text: "A coffee costs 3 dollars and 25 cents. How many dollars do 4 coffees cost?", answer: 13, unit: "$" },
  { id: "l-pizza-split", text: "A pizza costs 18 dollars and 60 cents. Three friends split it evenly. How many dollars does each pay?", answer: 6.2, unit: "$" },
  { id: "l-book-sale", text: "A book costs 15 dollars and is 20 percent off. What is the sale price in dollars?", answer: 12, unit: "$" },
  { id: "l-sandwich-change", text: "A sandwich costs 7 dollars and 35 cents. You pay with a 10 dollar bill. How many dollars of change do you get?", answer: 2.65, unit: "$" },
  { id: "l-movie-tickets", text: "Movie tickets cost 12 dollars and 50 cents each. How many dollars do 4 tickets cost?", answer: 50, unit: "$" },
  { id: "l-bananas", text: "Bananas cost 60 cents each. How many dollars do 7 bananas cost?", answer: 4.2, unit: "$" },
  { id: "l-lamp-tax", text: "A lamp costs 40 dollars. Sales tax is 5 percent. How many dollars is the tax?", answer: 2, unit: "$" },
  { id: "l-hat-half", text: "A hat costs 23 dollars and is 50 percent off. How many dollars does it cost?", answer: 11.5, unit: "$" },
  { id: "l-juice-box", text: "A pack of 4 juice boxes costs 5 dollars. How many dollars does one juice box cost?", answer: 1.25, unit: "$" },
  { id: "l-ticket-rise", text: "A ticket cost 20 dollars last year. The price went up 15 percent. How many dollars does it cost now?", answer: 23, unit: "$" },
  { id: "l-cheese-half", text: "Cheese costs 9 dollars a kilo. How many dollars does half a kilo cost?", answer: 4.5, unit: "$" },
  { id: "l-grocery-total", text: "You buy bread for 2 dollars and 50 cents, cheese for 4 dollars and 25 cents, and grapes for 3 dollars. How many dollars do you spend?", answer: 9.75, unit: "$" },
  { id: "l-game-save", text: "A game costs 50 dollars. You save 12 dollars. What percent did you save?", answer: 24, unit: "%" },
  { id: "l-pen-pack", text: "Pens cost 1 dollar and 20 cents each, or 10 dollars for a pack of 10. How many dollars do you save by buying the pack?", answer: 2, unit: "$" },
  { id: "l-dinner-tip", text: "Dinner costs 45 dollars. You leave a 10 percent tip. How many dollars is the tip?", answer: 4.5, unit: "$" },
  { id: "l-paint-cans", text: "A can of paint costs 14 dollars and 99 cents. How many dollars do 2 cans cost?", answer: 29.98, unit: "$" },
  { id: "l-split-bill", text: "A bill of 54 dollars is split evenly between 4 friends. How many dollars does each pay?", answer: 13.5, unit: "$" },
  { id: "l-shampoo-coupon", text: "Shampoo costs 6 dollars and 80 cents. You have a coupon for 1 dollar and 30 cents off. How many dollars do you pay?", answer: 5.5, unit: "$" },
  { id: "l-toy-drop", text: "A toy cost 25 dollars. Now it costs 20 dollars. By what percent did the price drop?", answer: 20, unit: "%" },
  { id: "l-gas-fill", text: "Gas costs 3 dollars and 50 cents a gallon. How many dollars do 10 gallons cost?", answer: 35, unit: "$" },
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

/** The bare answer as a user would type it; money always shows cents, e.g. "7.20". */
export function formatNumber(problem: Problem): string {
  return problem.unit === "$" ? problem.answer.toFixed(2) : String(problem.answer);
}

/** The answer with its unit, e.g. "20 minutes", "75%" or "$7.20". Only for users who have solved the problem. */
export function formatAnswer(problem: Problem): string {
  const number = formatNumber(problem);
  if (problem.unit === "$") return `$${number}`;
  const unit = problem.unit ? (problem.unit === "%" ? "%" : ` ${problem.unit}`) : "";
  return `${number}${unit}`;
}

/** Feedback for a problem the user solved earlier today. */
export function solvedMessage(problem: Problem): string {
  return `Solved! ${formatAnswer(problem)}. Come back tomorrow for a new one.`;
}

/** What the answer form shows for a problem already solved today. `answer` is the bare number, as a user would type it. */
export type SolvedProblem = { answer: string; message: string };

/** The solved state for one of today's problems, or undefined if it isn't solved. */
export function getSolvedState(id: string, solvedIds: Set<string>): SolvedProblem | undefined {
  const problem = findProblem(id);
  if (!problem || !solvedIds.has(id)) return undefined;
  return { answer: formatNumber(problem), message: solvedMessage(problem) };
}
