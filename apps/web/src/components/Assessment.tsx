"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  options: { label: string; value: string; score: number; wasteFactor: number }[];
}

const questions: Question[] = [
  {
    id: "subs",
    question: "How many software subscriptions does your business pay for monthly?",
    options: [
      { label: "1-3", value: "few", score: 3, wasteFactor: 100 },
      { label: "4-8", value: "some", score: 2, wasteFactor: 400 },
      { label: "9-15", value: "many", score: 1, wasteFactor: 900 },
      { label: "16+", value: "lots", score: 0, wasteFactor: 1500 },
    ],
  },
  {
    id: "usage",
    question: "How many of those do you actually use every week?",
    options: [
      { label: "All of them", value: "all", score: 3, wasteFactor: 0 },
      { label: "Most", value: "most", score: 2, wasteFactor: 200 },
      { label: "About half", value: "half", score: 1, wasteFactor: 400 },
      { label: "Honestly, a few", value: "few", score: 0, wasteFactor: 600 },
    ],
  },
  {
    id: "trapped",
    question: "Have you ever kept paying for a subscription because canceling felt too risky or too much hassle?",
    options: [
      { label: "No, I’m on top of it", value: "no", score: 3, wasteFactor: 0 },
      { label: "Once or twice", value: "once", score: 2, wasteFactor: 100 },
      { label: "Yes, more than I’d like to admit", value: "yes", score: 1, wasteFactor: 300 },
      { label: "I don’t track this closely enough to know", value: "unknown", score: 0, wasteFactor: 400 },
    ],
  },
  {
    id: "headcount",
    question: "How many people manage your software tools?",
    options: [
      { label: "Just me", value: "one", score: 3, wasteFactor: 0 },
      { label: "2-3 people", value: "few", score: 2, wasteFactor: 200 },
      { label: "4-6 people", value: "several", score: 1, wasteFactor: 500 },
      { label: "7+ people (or I'm not sure)", value: "many", score: 0, wasteFactor: 800 },
    ],
  },
  {
    id: "ai",
    question: "Have you or your team tried using AI to build or automate something?",
    options: [
      { label: "Yes and it went well", value: "success", score: 3, wasteFactor: 0 },
      { label: "Yes but it didn’t work out", value: "failed", score: 1, wasteFactor: 200 },
      { label: "No but I’m curious", value: "curious", score: 2, wasteFactor: 100 },
      { label: "No and I’m skeptical", value: "skeptical", score: 1, wasteFactor: 50 },
    ],
  },
  {
    id: "lockin",
    question: "If a vendor you rely on doubled their price tomorrow, what would you do?",
    options: [
      { label: "We’d be fine — we own our critical systems", value: "fine", score: 3, wasteFactor: 0 },
      { label: "We’d find alternatives quickly", value: "scramble", score: 2, wasteFactor: 100 },
      { label: "We’d manage but it would hurt", value: "manage", score: 1, wasteFactor: 200 },
      { label: "Panic — we’re completely locked in", value: "panic", score: 0, wasteFactor: 400 },
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
      title: "There’s massive untapped potential here",
      description: "You’re spending thousands on tools that don’t fully serve you — but more importantly, AI could transform the way your business operates. This is exactly the situation where a focused engagement creates the most value.",
      recommendation: "A full discovery call. Let’s map what AI can automate, streamline, and build for your business.",
      color: "text-rose",
    };
  }
  if (score <= 12) {
    return {
      title: "You’re close — AI can take you the rest of the way",
      description: "You’ve got some pieces in place, but there’s significant room to harness AI for faster workflows, better tools, and real competitive advantage. A focused engagement could unlock that potential.",
      recommendation: "A targeted build. We identify your highest-impact opportunities and start building.",
      color: "text-amber",
    };
  }
  return {
    title: "You’re ahead of the game",
    description: "Your stack is in solid shape. The next level is leveraging AI to build custom tools that give you an edge your competitors can’t buy off the shelf.",
    recommendation: "A strategic session. Let’s find where AI can create your next competitive advantage.",
    color: "text-emerald",
  };
}

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { score: number; waste: number }>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, score: number, wasteFactor: number) => {
    const newAnswers = { ...answers, [questionId]: { score, waste: wasteFactor } };
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
  const totalWaste = Object.values(answers).reduce((sum, a) => sum + a.waste, 0);
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
          <p className="text-gray-600 mt-4 text-lg">
            6 questions. 60 seconds. Find out how much potential you&apos;re leaving on the table.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-emerald rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Waste counter */}
        {Object.keys(answers).length > 0 && !showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-right mb-4"
          >
            <span className="text-xs text-text-muted">Estimated monthly waste: </span>
            <span className="text-sm font-mono font-bold text-rose">${totalWaste.toLocaleString()}/mo</span>
          </motion.div>
        )}

        {/* Question area */}
        <div className="min-h-[400px] relative">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <span className="text-text-muted font-mono text-sm">
                    {currentQuestion + 1} / {questions.length}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold mt-2">
                    {questions[currentQuestion].question}
                  </h3>
                </div>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02, x: 8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(questions[currentQuestion].id, option.score, option.wasteFactor)}
                      className="w-full text-left p-5 rounded-xl border border-gray-200 bg-gray-50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group cursor-pointer"
                    >
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
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
                    <span className="text-4xl font-bold text-rose">${totalWaste.toLocaleString()}/mo</span>
                    <span className="text-text-muted text-sm mt-1">estimated waste</span>
                  </motion.div>
                </div>

                <h3 className={"text-3xl font-bold mb-4 " + result.color}>{result.title}</h3>
                <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">{result.description}</p>

                <div className="p-6 rounded-xl border border-accent/20 bg-accent/5 mb-8">
                  <h4 className="font-semibold text-accent-bright mb-2">My recommendation:</h4>
                  <p className="text-text-secondary">{result.recommendation}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="#contact" className="px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105">
                    Let&apos;s talk
                  </a>
                  <button onClick={reset} className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-all duration-300 cursor-pointer">
                    Retake assessment
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
