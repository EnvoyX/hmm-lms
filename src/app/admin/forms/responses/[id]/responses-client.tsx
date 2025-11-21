"use client";

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";

import type { RouterOutputs } from "~/trpc/react";

type FormWithQuestions = RouterOutputs["form"]["getById"];
type Submission = RouterOutputs["form"]["getSubmissions"]["submissions"][number];

interface ResponsesClientProps {
  form: FormWithQuestions;
  submissions: Submission[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ResponsesClient({ form, submissions }: ResponsesClientProps) {
  const [activeTab, setActiveTab] = useState("summary");

  // --- Summary Tab Logic ---
  const summaryData = useMemo(() => {
    return form.questions.map(question => {
      const answers = submissions.flatMap(s => 
        s.answers.filter(a => a.questionId === question.id)
      );

      let chartData: { name: string; value: number }[] = [];
      let textAnswers: string[] = [];

      if (['MULTIPLE_CHOICE', 'RATING', 'MULTIPLE_SELECT'].includes(question.type)) {
        const counts: Record<string, number> = {};
        answers.forEach(a => {
          let values: string[] = [];
          if (a.jsonValue && Array.isArray(a.jsonValue)) {
            values = a.jsonValue as string[];
          } else if (a.textValue) {
            values = [a.textValue];
          } else if (a.numberValue !== null && a.numberValue !== undefined) {
            values = [String(a.numberValue)];
          }

          values.forEach(v => {
            counts[v] = (counts[v] ?? 0) + 1;
          });
        });

        chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
      } else {
        textAnswers = answers.map(a => {
            if (a.textValue) return a.textValue;
            if (a.dateValue) return format(new Date(a.dateValue), 'PPP');
            if (a.jsonValue) return JSON.stringify(a.jsonValue);
            return "No answer";
        });
      }

      return {
        question,
        chartData,
        textAnswers,
        totalAnswers: answers.length,
      };
    });
  }, [form.questions, submissions]);

  // --- Individual Tab Logic ---
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const currentSubmission = submissions[currentSubmissionIndex];

  const handleNextSubmission = () => {
    if (currentSubmissionIndex < submissions.length - 1) {
      setCurrentSubmissionIndex(prev => prev + 1);
    }
  };

  const handlePrevSubmission = () => {
    if (currentSubmissionIndex > 0) {
      setCurrentSubmissionIndex(prev => prev - 1);
    }
  };

  // --- Question Tab Logic ---
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(form.questions[0]?.id ?? "");
  const selectedQuestion = form.questions.find(q => q.id === selectedQuestionId);
  const selectedQuestionAnswers = useMemo(() => {
    if (!selectedQuestionId) return [];
    return submissions.map(s => {
      const answer = s.answers.find(a => a.questionId === selectedQuestionId);
      return {
        submission: s,
        answer,
      };
    }).filter(item => item.answer); // Only show submissions that have an answer? Or show all? Let's show all for context.
  }, [submissions, selectedQuestionId]);


  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
          <p>Share your form to start collecting responses.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="question">Question</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
        </TabsList>

        {/* SUMMARY TAB */}
        <TabsContent value="summary" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
              </CardContent>
            </Card>
            {/* Add more stats if needed */}
          </div>

          {summaryData.map((item) => (
            <Card key={item.question.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg font-medium">{item.question.title}</CardTitle>
                <CardDescription>{item.totalAnswers} responses</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {item.chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={item.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                          {item.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {item.textAnswers.map((ans, i) => (
                        <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                          {ans}
                        </div>
                      ))}
                      {item.textAnswers.length === 0 && <p className="text-muted-foreground italic">No text answers.</p>}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* QUESTION TAB */}
        <TabsContent value="question" className="space-y-6 mt-6">
          <div className="flex items-center gap-4">
            <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {form.questions.map(q => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {selectedQuestionAnswers.length} responses
            </div>
          </div>

          {selectedQuestion && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedQuestion.title}</CardTitle>
                {selectedQuestion.description && <CardDescription>{selectedQuestion.description}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedQuestionAnswers.map((item, i) => {
                  const val = item.answer 
                    ? (item.answer.textValue ?? (item.answer.numberValue !== null ? String(item.answer.numberValue) : null) ?? (item.answer.dateValue ? format(new Date(item.answer.dateValue), 'PPP') : null) ?? (item.answer.jsonValue ? JSON.stringify(item.answer.jsonValue) : "No answer"))
                    : "Skipped";
                  
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-muted-foreground">
                            {item.submission.submitter?.name ?? "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.submission.submittedAt), "MMM d, p")}
                          </span>
                        </div>
                        <p className="text-foreground">{val}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* INDIVIDUAL TAB */}
        <TabsContent value="individual" className="space-y-6 mt-6">
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevSubmission} disabled={currentSubmissionIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentSubmissionIndex + 1} of {submissions.length}
              </span>
              <Button variant="outline" size="icon" onClick={handleNextSubmission} disabled={currentSubmissionIndex === submissions.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSubmission && format(new Date(currentSubmission.submittedAt), "PPP 'at' p")}
            </div>
          </div>

          {currentSubmission && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{currentSubmission.submitter?.name ?? "Anonymous"}</CardTitle>
                    <CardDescription>{currentSubmission.submitter?.email ?? "No email"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6 space-y-6">
                {form.questions.map(question => {
                  const answer = currentSubmission.answers.find(a => a.questionId === question.id);
                  const val = answer 
                    ? (answer.textValue ?? (answer.numberValue !== null ? String(answer.numberValue) : null) ?? (answer.dateValue ? format(new Date(answer.dateValue), 'PPP') : null) ?? (answer.jsonValue ? (Array.isArray(answer.jsonValue) ? (answer.jsonValue as string[]).join(', ') : JSON.stringify(answer.jsonValue)) : "No answer"))
                    : <span className="text-muted-foreground italic">Skipped</span>;

                  return (
                    <div key={question.id} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">{question.title}</h4>
                      <div className="p-3 bg-muted/30 rounded-md border text-sm">
                        {val}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
