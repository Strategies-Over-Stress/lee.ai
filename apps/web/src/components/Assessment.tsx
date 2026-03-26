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
    id: "deploy",
    question: "How do you deploy changes to production?",
    options: [
      { label: "FTP / manual file uploads", value: "ftp", score: 0 },
      { label: "SSH in and git pull", value: "ssh", score: 1 },
      { label: "CI/CD pipeline with staging", value: "cicd", score: 3 },
      { label: "We don't have a process", value: "none", score: 0 },
    ],
  },
  {
    id: "testing",
    question: "How do you catch bugs before they reach customers?",
    options: [
      { label: "We click around and hope for the best", value: "manual", score: 0 },
      { label: "Manual QA checklist", value: "checklist", score: 1 },
      { label: "Automated test suites", value: "automated", score: 3 },
      { label: "Customers find them for us", value: "customers", score: 0 },
    ],
  },
  {
    id: "speed",
    question: "How long does a typical feature take to ship?",
    options: [
      { label: "Days", value: "days", score: 3 },
      { label: "Weeks", value: "weeks", score: 2 },
      { label: "Months", value: "months", score: 1 },
      { label: "We've stopped counting", value: "never", score: 0 },
    ],
  },
  {
    id: "ai",
    question: "How is AI integrated into your development workflow?",
    options: [
      { label: "Our devs use Copilot / ChatGPT sometimes", value: "basic", score: 1 },
      { label: "We have AI-augmented development processes", value: "augmented", score: 3 },
      { label: "We've been meaning to look into it", value: "planning", score: 0 },
      { label: "What do you mean?", value: "none", score: 0 },
    ],
  },
  {
    id: "team",
    question: "What's your current engineering situation?",
    options: [
      { label: "No technical team — I need one", value: "none", score: 0 },
      { label: "Small team, moving too slow", value: "slow", score: 1 },
      { label: "Outsourced devs, quality is inconsistent", value: "outsourced", score: 0 },
      { label: "Good team, want to 10x with AI", value: "good", score: 2 },
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
      title: "Ground Zero",
      description:
        "Your tech stack needs a complete transformation. The good news? This is exactly where I do my best work. I've taken businesses from zero infrastructure to production-grade systems with CI/CD, automated testing, and AI-augmented workflows.",
      recommendation:
        "A full technical transformation engagement. We'll rebuild your foundation with modern architecture, automated deployments, and AI workflows from day one.",
      color: "text-rose",
    };
  }
  if (score <= 8) {
    return {
      title: "Ready to Level Up",
      description:
        "You have some foundation in place, but you're leaving massive efficiency gains on the table. AI-first workflows could cut your delivery time by 5-10x while improving code quality.",
      recommendation:
        "A focused modernization sprint. We'll identify your biggest bottlenecks and systematically eliminate them with AI-augmented processes.",
      color: "text-amber",
    };
  }
  return {
    title: "Optimization Territory",
    description:
      "You're already ahead of most teams. But there's a difference between using AI tools and having AI-native workflows baked into your entire development lifecycle.",
    recommendation:
      "A strategic AI workflow integration. We'll embed AI collaboration patterns into your architecture, documentation, and deployment processes.",
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
