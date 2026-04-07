"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  disclaimer?: string;
  options: { label: string; value: string; score: number; potentialPct: number }[];
}

const revenueMap: Record<string, number> = {
  "under10k": 7500,
  "10k-50k": 30000,
  "50k-200k": 125000,
  "200k+": 300000,
};

const questions: Question[] = [
  {
    id: "revenue",
    question: "What’s your business’s approximate monthly revenue?",
    disclaimer: "This helps us estimate your potential — your answers stay private and are never stored.",
    options: [
      { label: "Under $10K", value: "under10k", score: 2, potentialPct: 0 },
      { label: "$10K – $50K", value: "10k-50k", score: 2, potentialPct: 0 },
      { label: "$50K – $200K", value: "50k-200k", score: 2, potentialPct: 0 },
      { label: "$200K+", value: "200k+", score: 2, potentialPct: 0 },
    ],
  },
  {
    id: "manual",
    question: "How much time does your team spend on repetitive tasks — data entry, updating spreadsheets, moving info between tools?",
    options: [
      { label: "Rarely — most things are automated", value: "rare", score: 3, potentialPct: 0 },
      { label: "A few hours a week", value: "some", score: 2, potentialPct: 2 },
      { label: "Hours every day", value: "daily", score: 1, potentialPct: 5 },
      { label: "It’s basically someone’s whole job", value: "fulltime", score: 0, potentialPct: 8 },
    ],
  },
  {
    id: "systems",
    question: "Do your tools and systems talk to each other automatically?",
    options: [
      { label: "Yes, everything’s connected", value: "connected", score: 3, potentialPct: 0 },
      { label: "Mostly, a few gaps", value: "mostly", score: 2, potentialPct: 2 },
      { label: "We copy-paste between tools a lot", value: "manual", score: 1, potentialPct: 4 },
      { label: "What do you mean?", value: "none", score: 0, potentialPct: 7 },
    ],
  },
  {
    id: "missed",
    question: "Have you ever lost a sale or missed an opportunity because something fell through the cracks?",
    options: [
      { label: "Never", value: "never", score: 3, potentialPct: 0 },
      { label: "Once or twice", value: "once", score: 2, potentialPct: 3 },
      { label: "It happens regularly", value: "regular", score: 1, potentialPct: 6 },
      { label: "Probably more than I know", value: "unknown", score: 0, potentialPct: 10 },
    ],
  },
  {
    id: "ai",
    question: "Have you tried using AI in your business?",
    options: [
      { label: "Yes, it’s working great", value: "success", score: 3, potentialPct: 0 },
      { label: "Tried it, didn’t stick", value: "failed", score: 1, potentialPct: 4 },
      { label: "Curious but haven’t started", value: "curious", score: 2, potentialPct: 3 },
      { label: "Skeptical", value: "skeptical", score: 1, potentialPct: 2 },
    ],
  },
  {
    id: "subs",
    question: "How many software subscriptions do you pay for that you’re not sure you need?",
    options: [
      { label: "None — every tool earns its keep", value: "none", score: 3, potentialPct: 0 },
      { label: "A couple", value: "couple", score: 2, potentialPct: 1 },
      { label: "More than I’d like", value: "several", score: 1, potentialPct: 3 },
      { label: "I’ve lost count", value: "many", score: 0, potentialPct: 5 },
    ],
  },
  {
    id: "opportunity",
    question: "What’s the single biggest thing you wish AI could do for your business?",
    options: [
      { label: "Automate repetitive tasks so I can focus on growth", value: "automate", score: 1, potentialPct: 5 },
      { label: "Bring in more customers without hiring", value: "customers", score: 1, potentialPct: 7 },
      { label: "Replace tools that aren’t worth what I pay", value: "replace", score: 1, potentialPct: 4 },
      { label: "Honestly, I don’t know yet — that’s what I need help with", value: "unsure", score: 0, potentialPct: 6 },
    ],
  },
];

interface ResultProfile {
  title: string;
  description: string;
  recommendation: string;
  color: string;
}

function getResult(score: number): ResultProfile {
  if (score <= 6) {
    return {
      title: "There’s massive untapped revenue hiding in your operations",
      description: "Between manual workflows, disconnected tools, and missed opportunities — AI could transform how your business operates and unlock serious growth. This is exactly where a focused engagement creates the most value.",
      recommendation: "A discovery call. Let’s map your highest-impact opportunities and show you what’s possible.",
      color: "text-rose",
    };
  }
  if (score <= 12) {
    return {
      title: "You’re closer than you think — a few integrations could change everything",
      description: "You’ve got the foundation, but there’s significant revenue and time being left on the table. The right automations and integrations could free up your team and capture opportunities you’re currently missing.",
      recommendation: "A targeted build. We identify your biggest bottlenecks and start automating.",
      color: "text-amber",
    };
  }
  return {
    title: "You’re ahead of the game — let’s find the next level",
    description: "Your operations are solid. The next step is using AI to build custom tools that give you an edge your competitors can’t buy off the shelf.",
    recommendation: "A strategic session. Let’s find where AI creates your next competitive advantage.",
    color: "text-emerald",
  };
}

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; score: number; potentialPct: number }>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, value: string, score: number, potentialPct: number) => {
    const newAnswers = { ...answers, [questionId]: { value, score, potentialPct } };
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
  const monthlyRevenue = answers.revenue ? revenueMap[answers.revenue.value] || 30000 : 30000;
  const totalPotentialPct = Object.entries(answers)
    .filter(([key]) => key !== "revenue")
    .reduce((sum, [, a]) => sum + a.potentialPct, 0);
  const totalPotential = Math.round(monthlyRevenue * (totalPotentialPct / 100));
  const result = getResult(totalScore);
  const progress = ((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100;

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <section id="assess" className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Assessment icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="#6366f1" strokeWidth="2"/>
              <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <br />
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Interactive Assessment
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4 text-gray-900">
            Ready to see what AI can actually do for your business?
          </h2>
          <p className="text-gray-500 mt-4 text-lg">
            7 questions. 60 seconds. Find out how much revenue you&apos;re leaving on the table.
          </p>
        </motion.div>

        {/* Question card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8 sm:p-10">
          {/* Progress bar + counter row */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-emerald rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-gray-400 font-mono text-sm shrink-0">
              {showResult ? questions.length : currentQuestion + 1} / {questions.length}
            </span>
          </div>

          {/* Potential counter */}
          {Object.keys(answers).length > 0 && !showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-right mb-4"
            >
              <span className="text-xs text-gray-400">Potential monthly value: </span>
              <span className="text-sm font-mono font-bold text-emerald">${totalPotential.toLocaleString()}/mo</span>
            </motion.div>
          )}

          {/* Question area */}
          <div className="min-h-[320px] relative">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {questions[currentQuestion].question}
                    </h3>
                    {questions[currentQuestion].disclaimer && (
                      <p className="text-sm text-gray-400 mt-2 italic">
                        {questions[currentQuestion].disclaimer}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, idx) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswer(questions[currentQuestion].id, option.value, option.score, option.potentialPct)}
                        className="w-full text-left p-4 sm:p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-accent hover:bg-accent/5 hover:shadow-md transition-all duration-200 group cursor-pointer flex items-center gap-4"
                      >
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-accent/10 flex items-center justify-center text-sm font-mono font-semibold text-gray-400 group-hover:text-accent transition-colors">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium transition-colors">
                          {option.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex flex-col items-center"
                  >
                    <span className="text-4xl font-bold text-emerald">${totalPotential.toLocaleString()}/mo</span>
                    <span className="text-gray-500 text-sm mt-1">estimated revenue you could unlock</span>
                    <span className="text-gray-400 text-xs mt-1 block italic">Based on your inputs — actual results vary by business</span>
                  </motion.div>
                </div>

                <h3 className={"text-3xl font-bold mb-4 " + result.color}>{result.title}</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">{result.description}</p>

                <div className="p-6 rounded-xl border border-accent/20 bg-accent/5 mb-8">
                  <h4 className="font-semibold text-accent mb-2">My recommendation:</h4>
                  <p className="text-gray-600">{result.recommendation}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="#contact" className="px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg text-white transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-105">
                    Let&apos;s talk
                  </a>
                  <button onClick={reset} className="px-8 py-4 border border-gray-300 hover:border-accent rounded-xl font-semibold text-gray-600 hover:text-accent transition-all duration-300 cursor-pointer">
                    Retake assessment
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
