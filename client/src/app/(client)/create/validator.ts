import * as yup from "yup";

export const newCharacterSchema = yup.object({
  name: yup.string().min(2).max(20).required("Name is required"),
  description: yup
    .string()
    .min(10)
    .max(500)
    .required("Description is required"),
  tagline: yup.string().min(2).max(60).required("Tagline is required"),
  personality: yup.string().min(2, 'You should select at least 1 personality').max(200).required("Personality is required"),
  prompt: yup.string().min(10).max(500).required("Prompt is required"),
  backgroundUrl: yup.string().max(300).nullable(),
  themeId: yup.string().max(60).nullable(),
  visibility: yup
    .mixed<"PUBLIC" | "PRIVATE">()
    .oneOf(["PUBLIC", "PRIVATE"])
    .default("PUBLIC"),
});

export type NewCharacterInput = yup.InferType<typeof newCharacterSchema>;
