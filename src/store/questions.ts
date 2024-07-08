import { create } from "zustand";
import { Question } from "../types";
import confetti from "canvas-confetti";
import { devtools, persist } from "zustand/middleware";
import { getAllQuestions } from "../services/questions";

interface State {
  questions: Question[];
  currentQuestion: number;
  fetchQuestions: (limit: number) => Promise<void>;
  selectAnswer: (questionId: number, answerIndex: number) => void;
  goNextQuestion: () => void;
  goPreviosQuestion: () => void;
  reset: () => void;
}

/**
 * This is a logger middleware created in zustand
 */
/* const logger = (config) => (set, get, api) => {
  return config(
    (...args) => {
      console.log("applying", args);
      set(...args);
      console.log("new state", get());
    },
    get,
    api
  );
}; */

export const useQuestionsStore = create<State>()(
  devtools(
    persist(
      (set, get) => {
        return {
          questions: [],
          currentQuestion: 0,
          fetchQuestions: async (limit) => {
            const json = await getAllQuestions();

            const questions = json
              .sort(() => Math.random() - 0.5)
              .slice(0, limit);

            set({ questions }, false, "FETCH_QUESTIONS");
          },

          selectAnswer: (questionId, answerIndex) => {
            const { questions } = get();
            const newQuestions = structuredClone(questions);

            const questionIndex = newQuestions.findIndex(
              (question) => question.id === questionId
            );

            const questionInfo = newQuestions[questionIndex];

            const isCorrectUserAnswer =
              questionInfo.correctAnswer === answerIndex;
            if (isCorrectUserAnswer) confetti();

            newQuestions[questionIndex] = {
              ...questionInfo,
              isCorrectUserAnswer,
              userSelectedAnswer: answerIndex,
            };

            set({ questions: newQuestions }, false, "SELECT_ANSWER");
          },

          goNextQuestion: () => {
            const { currentQuestion, questions } = get();
            const nextQuestion = currentQuestion + 1;

            if (nextQuestion < questions.length) {
              set({ currentQuestion: nextQuestion }, false, "GO_NEXT_QUESTION");
            }
          },

          goPreviosQuestion: () => {
            const { currentQuestion } = get();
            const previousQuestion = currentQuestion - 1;

            if (previousQuestion >= 0) {
              set(
                { currentQuestion: previousQuestion },
                false,
                "GO_NEXT_PREVIOUS"
              );
            }
          },

          reset: () => {
            set({ currentQuestion: 0, questions: [] }, false, "RESET");
          },
        };
      },
      { name: "questions" }
    )
  )
);
