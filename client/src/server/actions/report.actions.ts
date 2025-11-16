"use server";
import { serverSession } from "@/lib/auth-server";
import * as yup from "yup";
import prisma from "../config/prisma";
import { handleErrorResponse } from "../helper/error-utils";

const validateSubmitCharacterReport = yup.object({
  reason: yup.string().required(),
  details: yup.string().notRequired(),
  characterId: yup.string().required(),
});

export const submitCharacterReportAction = async (data: {
  reason: string;
  details: string;
  characterId: string;
}) => {
  try {
    console.log("-----------------------------HIT ------");

    const session = await serverSession();
    const currentUser = session?.user;

    if (!currentUser) {
      return {
        success: false,
        error: {
          message: "Please login to submit report",
          code: "LOGIN_REQUIRED",
        },
      };
    }

    const validatedData = await validateSubmitCharacterReport.validate(data);

    const result = await prisma.characterReport.create({
      data: {
        reporterId: currentUser?.id,
        reason: validatedData.reason as any,
        details: validatedData.details,
        characterId: validatedData.characterId,
      },
    });

    return { success: true, message: "Submmited Successfull" };
  } catch (error) {
    return {
      success: false,
      error: {
        message: handleErrorResponse(error).message,
      },
    };
  }
};
