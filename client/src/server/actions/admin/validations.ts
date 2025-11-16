import { z } from "zod";

export const getUsersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  sortField: z.string().default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  role: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});