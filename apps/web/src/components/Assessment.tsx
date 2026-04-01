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
      { label: "No, I\u2019m on top of it", value: "no", score: 3, wasteFactor: 0 },
      { label: "Once or twice", value: "once", score: 2, wasteFactor: 100 },
      { label: "Yes, more than I\u2019d like to admit", value: "yes", score: 1, wasteFactor: 300 },
      { label: "I don\u2019t track this closely enough to know", value: "unknown", score: 0, wasteFactor: 400 },
    ],
  },
  {
    id: "ai",
    question: "Have you or your team tried using AI to build or automate something?",
    options: [
      { label: "Yes and it went well", value: "success", score: 3, wasteFactor: 0 },
      { label: "Yes but it didn\u2019t work out", value: "failed", score: 1, wasteFactor: 200 },
      { label: "No but I\u2019m curious", value: "curious", score: 2, wasteFactor: 100 },
      { label: "No and I\u2019m skeptical", value: "skeptical", score: 1, wasteFactor: 50 },
    ],
  },
  {
    id: "lockin",
    question: "If a vendor you rely on doubled their price tomorrow, what would you do?",
    options: [
      { label: "We\u2019d be fine \u2014 we own our critical systems", value: "fine", score: 3, wasteFactor: 0 },
      { label: "We\u2019d find alternatives quickly", value: "scramble", score: 2, wasteFactor: 100 },
      { label: "We\u2019d manage but it would hurt", value: "manage", score: 1, wasteFactor: 200 },
      { label: "Panic \u2014 we\u2019re completely locked in", value: "panic", score: 0, wasteFactor: 400 },
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
  if (score <= 5) {
    return {
      title: "Your business is on a subscription treadmill",
      description: "You\u2019re spending thousands per year on tools that don\u2019t fully serve you, and you\u2019re locked into vendors who know it. The good news: this is exactly the situation where my guarantee kicks in.",
      recommendation: "A full software review. Let\u2019s map where your money goes and what we can own instead.",
      color: "text-rose",
    };
  }
  if (score <= 10) {
    return {
      title: "You\u2019re overpaying \u2014 but you\u2019re close to breaking free",
      description: "You\u2019ve got some pieces in place, but you\u2019re still bleeding money on software that doesn\u2019t fully serve your needs. A focused engagement could eliminate most of that waste permanently.",
      recommendation: "A targeted build. We replace your most expensive, least useful subscriptions first.",
      color: "text-amber",
    };
  }
  return {
    title: "You\u2019re ahead of the game",
    description: "Your stack is in decent shape, but there\u2019s still room to own more and rent less. The next level is full ownership.",
    recommendation: "A strategic upgrade. We identify the remaining subscriptions worth replacing.",
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
          <span className="font-mono text-accent text-sm tracking-widest uppercase">
            Interactive Assessment
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-4">
            Is your software stack costing you?
          </h2>
          <p className="text-text-secondary mt-4 text-lg">
            5 questions. 60 seconds. Find out where you stand.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="h-1 bg-surface-light rounded-full mb-8 overflow-hidden">
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
                      className="w-full text-left p-5 rounded-xl border border-surface-light bg-surface hover:border-accent/50 hover:bg-surface-light transition-all duration-200 group cursor-pointer"
                    >
                      <span className="text-text-secondary group-hover:text-text-primary transition-colors">
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
