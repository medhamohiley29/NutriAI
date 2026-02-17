
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Recommendation, WorkoutDay } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateWorkoutPlan = async (profile: UserProfile): Promise<WorkoutDay[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const goalsStr = profile.goals?.join(", ") || "General Fitness";
  const timingStr = profile.workoutTiming ? `Preferred workout time: ${profile.workoutTiming}.` : "";
  
  const prompt = `Generate a 7-day fitness routine for ${profile.name}.
    Metrics: Age ${profile.age}, BMI ${profile.bmi}, Goals: ${goalsStr}.
    ${timingStr}
    Requirements: Each day must be 1-2 hours. Tailor exercises to the preferred time if applicable (e.g., more stretching for morning, higher intensity for afternoon).
    Return a list of 7 days.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING, description: "Day of the week" },
            duration: { type: Type.STRING, description: "e.g., 90 mins" },
            exercises: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["day", "duration", "exercises"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const generateDietPlan = async (profile: UserProfile): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const goalsStr = profile.goals?.join(", ") || "General Fitness";

  const prompt = `Generate a localized diet plan.
    Profile: ${profile.dietType} diet, Region: ${profile.region}.
    Goals: ${goalsStr}, BMI: ${profile.bmi}.
    Provide a meal for Breakfast, Lunch, Snack, and Dinner.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          breakfast: { type: Type.STRING },
          lunch: { type: Type.STRING },
          snack: { type: Type.STRING },
          dinner: { type: Type.STRING },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["breakfast", "lunch", "snack", "dinner", "tips"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
