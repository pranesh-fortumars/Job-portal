"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowLeft, Clock, CheckCircle2, XCircle, Award, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

// Mock Assessments Data
const ASSESSMENTS = [
  {
    id: "industrial_safety_101",
    title: "Industrial Safety & OSHA 101",
    description: "Prove your knowledge of factory floor safety, emergency protocols, and hazard identification.",
    durationMinutes: 5,
    questions: [
      { q: "What should you do immediately upon hearing a continuous fire alarm?", options: ["Finish your current task", "Evacuate using the nearest exit", "Wait for supervisor instructions", "Hide under machinery"], a: 1 },
      { q: "Which of the following is a core OSHA requirement for machine operation?", options: ["Operating without guards to save time", "Wearing loose clothing", "Using proper Lockout/Tagout (LOTO) procedures", "Listening to music with headphones"], a: 2 },
    ]
  },
  {
    id: "frontend_react_basics",
    title: "React.js Frontend Basics",
    description: "A quick test of your knowledge in React components, state management, and hooks.",
    durationMinutes: 10,
    questions: [
      { q: "What hook is used to handle side effects in React?", options: ["useState", "useEffect", "useMemo", "useReducer"], a: 1 },
      { q: "How do you pass data from a parent component to a child component?", options: ["Using Context API only", "Using Props", "Using Redux", "Using local storage"], a: 1 },
    ]
  }
];

export default function AssessmentsPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const profileRef = auth?.currentUser && db ? doc(db, "Users", auth.currentUser.uid) : null;
  const { data: profile } = useDoc<any>(profileRef);

  const [activeQuiz, setActiveQuiz] = useState<typeof ASSESSMENTS[0] | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const verifiedSkills = profile?.verifiedSkills || [];

  const handleStartQuiz = (assessment: typeof ASSESSMENTS[0]) => {
    setActiveQuiz(assessment);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizResult(null);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !auth?.currentUser || !db) return;
    
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.a) correct++;
    });

    const scorePercentage = (correct / activeQuiz.questions.length) * 100;
    const passed = scorePercentage >= 100; // Require 100% for these short mock tests

    setQuizResult({ passed, score: scorePercentage });

    if (passed) {
      setSaving(true);
      try {
        await updateDoc(doc(db, "Users", auth.currentUser.uid), {
          verifiedSkills: arrayUnion(activeQuiz.title)
        });
        toast({ title: "Badge Earned! 🏆", description: `You have been awarded the ${activeQuiz.title} badge.` });
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Failed to award badge." });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/seeker/dashboard" className="text-sm font-medium text-muted-foreground flex items-center hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        {activeQuiz ? (
          <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-primary/5 border-b border-primary/10 p-6">
              <h2 className="text-2xl font-black text-slate-800">{activeQuiz.title}</h2>
              <p className="text-muted-foreground mt-1">Answer all questions correctly to earn your verified badge.</p>
            </div>
            
            <CardContent className="p-6 md:p-10">
              {quizResult ? (
                <div className="text-center py-10 space-y-6">
                  {quizResult.passed ? (
                    <Award className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
                  ) : (
                    <XCircle className="w-24 h-24 text-red-400 mx-auto" />
                  )}
                  <h3 className="text-3xl font-black">{quizResult.passed ? "Congratulations!" : "Keep Trying!"}</h3>
                  <p className="text-lg text-muted-foreground">You scored {quizResult.score.toFixed(0)}%.</p>
                  
                  <div className="pt-6">
                    <Button onClick={() => setActiveQuiz(null)} className="h-12 px-8 rounded-xl font-bold">Return to Assessments</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Question {currentQuestion + 1} of {activeQuiz.questions.length}</span>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold leading-relaxed">{activeQuiz.questions[currentQuestion].q}</h3>
                    
                    <div className="space-y-3">
                      {activeQuiz.questions[currentQuestion].options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: idx })}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                            selectedAnswers[currentQuestion] === idx 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-slate-200 hover:border-primary/40 hover:bg-slate-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      disabled={currentQuestion === 0}
                      onClick={() => setCurrentQuestion(c => Math.max(0, c - 1))}
                    >
                      Previous
                    </Button>
                    
                    {currentQuestion === activeQuiz.questions.length - 1 ? (
                      <Button 
                        onClick={handleSubmitQuiz} 
                        disabled={selectedAnswers[currentQuestion] === undefined || saving}
                        className="bg-green-600 hover:bg-green-700 font-bold px-8"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />} Submit Answers
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setCurrentQuestion(c => Math.min(activeQuiz.questions.length - 1, c + 1))}
                        disabled={selectedAnswers[currentQuestion] === undefined}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Skill Assessments</h1>
              <p className="text-muted-foreground">Earn verified badges by completing skill tests. Badges make your profile stand out to top employers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ASSESSMENTS.map(assessment => {
                const isEarned = verifiedSkills.includes(assessment.title);
                return (
                  <Card key={assessment.id} className="rounded-2xl border-slate-200 shadow-sm hover:border-primary/30 transition-all flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg leading-tight">{assessment.title}</CardTitle>
                        {isEarned && <Award className="w-6 h-6 text-yellow-500 shrink-0" />}
                      </div>
                      <CardDescription className="pt-2">{assessment.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                      <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest gap-1.5">
                        <Clock className="w-4 h-4" /> {assessment.durationMinutes} Min
                      </div>
                      {isEarned ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 font-bold px-3 py-1">Verified Expert</Badge>
                      ) : (
                        <Button onClick={() => handleStartQuiz(assessment)} variant="secondary" className="font-bold text-primary">
                          Take Assessment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
