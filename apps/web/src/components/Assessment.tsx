"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  options: { label: string; value: string; score: number }[];
}

const questions: Question[] = [
  {
    id: "downtime",
    question: "How often does your website have issues or go down?",
    options: [
      { label: "Regularly — especially during sales or high traffic", value: "often", score: 0 },
      { label: "Sometimes — we've had a few scares", value: "sometimes", score: 1 },
      { label: "Rarely — but we're not confident in our setup", value: "rarely", score: 2 },
      { label: "Never — we have solid systems in place", value: "never", score: 3 },
    ],
  },
  {
    id: "updates",
    question: "How long does it take to make changes to your website?",
    options: [
      { label: "Days or weeks — we depend on a developer's schedule", value: "weeks", score: 0 },
      { label: "A day or two if everything goes right", value: "days", score: 1 },
      { label: "Hours — but we're nervous something will break", value: "hours", score: 2 },
      { label: "Minutes — we have a reliable process", value: "minutes", score: 3 },
    ],
  },
  {
    id: "revenue",
    question: "Have you ever lost a sale because of a technical problem?",
    options: [
      { label: "Yes — checkout broke, site went down, or pages didn't load", value: "yes_major", score: 0 },
      { label: "Probably — we don't have visibility into what's failing", value: "probably", score: 0 },
      { label: "Maybe once or twice, but nothing major", value: "minor", score: 2 },
      { label: "No — our tech stack is solid", value: "no", score: 3 },
    ],
  },
  {
    id: "tools",
    question: "How many people or tools does it take to run your online business?",
    options: [
      { label: "Too many — nothing talks to each other", value: "fragmented", score: 0 },
      { label: "A few freelancers and a handful of tools", value: "some", score: 1 },
      { label: "One developer and a few key platforms", value: "lean", score: 2 },
      { label: "Everything is connected and mostly automated", value: "automated", score: 3 },
    ],
  },
  {
    id: "control",
    question: "Do you feel in control of your tech stack?",
    options: [
      { label: "Not at all — I depend on people I can't evaluate", value: "none", score: 0 },
      { label: "Somewhat — but I wouldn't know if something was wrong", value: "somewhat", score: 1 },
      { label: "Mostly — I understand the basics but not the details", value: "mostly", score: 2 },
      { label: "Completely — I know what's running and why", value: "full", score: 3 },
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
  if (score <= 4) {
    return {
      title: "Your tech is holding you back",
      description:
        "You're losing time, money, and sales to a tech stack that wasn't built to scale. The good news? This is exactly the kind of transformation I specialize in. I've taken businesses from this exact situation to fully automated operations.",
      recommendation:
        "A full technical overhaul. We'll rebuild your foundation so your site stays up, your tools talk to each other, and you stop losing sleep over what might break next.",
      color: "text-rose",
    };
  }
  if (score <= 8) {
    return {
      title: "You're close — but leaving money on the table",
      description:
        "You have some pieces in place, but your business is still doing too much manually. The right automation could free up hours every week and eliminate the technical surprises.",
      recommendation:
        "A focused automation sprint. We'll find your biggest time sinks and bottlenecks, then wire them up so they run themselves.",
      color: "text-amber",
    };
  }
  return {
    title: "You're ahead of the game",
    description:
      "Your tech stack is in solid shape. The next level is making it truly self-running — where AI handles the routine work and you only step in for strategy.",
    recommendation:
      "A strategic automation upgrade. We'll identify the remaining manual touchpoints and build AI-powered workflows to handle them.",
    color: "text-emerald",
  };
}

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, score: number) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0);
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
            Is your business ready?
          </h2>
          <p className="text-text-secondary mt-4 text-lg">
            5 questions. 60 seconds. Find out where you stand.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="h-1 bg-surface-light rounded-full mb-12 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-emerald rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

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
                      onClick={() =>
                        handleAnswer(questions[currentQuestion].id, option.score)
                      }
                      className="w-full text-left p-5 rounded-xl border border-surface-light bg-surface hover:border-accent/50 hover:bg-surface-light transition-all duration-200 group"
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
                {/* Score visualization */}
                <div className="mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-accent glow"
                  >
                    <span className="text-3xl font-bold text-gradient">
                      {totalScore}
                    </span>
                  </motion.div>
                  <div className="text-text-muted text-sm mt-2">/ 15</div>
                </div>

                <h3 className={`text-3xl font-bold ${result.color} mb-4`}>
                  {result.title}
                </h3>
                <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
                  {result.description}
                </p>

                <div className="p-6 rounded-xl border border-accent/20 bg-accent/5 mb-8">
                  <h4 className="font-semibold text-accent-bright mb-2">
                    My recommendation:
                  </h4>
                  <p className="text-text-secondary">{result.recommendation}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#contact"
                    className="px-8 py-4 bg-accent hover:bg-accent-bright rounded-xl font-semibold text-lg transition-all duration-300 glow hover:scale-105"
                  >
                    Let&apos;s talk
                  </a>
                  <button
                    onClick={reset}
                    className="px-8 py-4 border border-surface-light hover:border-accent/50 rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-all duration-300"
                  >
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
