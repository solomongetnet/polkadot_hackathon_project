// lib/constants/error-codes.ts

export const ERROR_CODES = {
  GUEST_CHAT_LIMIT: "GUEST_CHAT_LIMIT",
  PLAN_LIMIT: "PLAN_LIMIT",
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
export type ErrorCodeValue = (typeof ERROR_CODES)[ErrorCode];

export const ERROR_MESSAGES = {
  [ERROR_CODES.GUEST_CHAT_LIMIT]: {
    message: "Login Required",
    description:
      "Guests can only start one chat. Log in to unlock more characters and features..",
  },
  [ERROR_CODES.PLAN_LIMIT]: {
    message: "Plan Limit Reached",
    description:
      "You can send up to 10 messages per day on the free plan. Upgrade to continue chatting without limits.",
  },
} as const;
