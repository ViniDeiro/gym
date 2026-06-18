import { WorkoutType } from "@/types/domain";

export const workoutTypes: Array<{ label: string; value: WorkoutType; color: string }> = [
  { label: "Peito", value: "peito", color: "#FF5C7A" },
  { label: "Costas", value: "costas", color: "#4F8DFF" },
  { label: "Perna", value: "perna", color: "#FFB020" },
  { label: "Cardio", value: "cardio", color: "#5BFF8A" },
  { label: "Braço", value: "braco", color: "#9B5CFF" },
  { label: "Full body", value: "full_body", color: "#64FFDA" },
  { label: "Mobilidade", value: "mobilidade", color: "#F7FAFC" },
  { label: "Outro", value: "outro", color: "#98A2B3" }
];
