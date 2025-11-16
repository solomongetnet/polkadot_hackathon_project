"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  Shield,
  SpellCheckIcon as Spam,
  Eye,
  Sword,
  Heart,
  Info,
  DollarSign,
  Copyright,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/shared/avatar";
import { useChatStore } from "@/store";
import { useSubmitCharacterReportMutation } from "@/hooks/api/use-report";

const reportReasons = [
  {
    value: "Inappropriate Content",
    label: "Inappropriate Content",
    icon: AlertTriangle,
  },
  {
    value: "Harassment or Bullying",
    label: "Harassment or Bullying",
    icon: Shield,
  },
  { value: "Spam", label: "Spam", icon: Spam },
  { value: "NSFW (Adult Content)", label: "NSFW (Adult Content)", icon: Eye },
  { value: "Violence or Gore", label: "Violence or Gore", icon: Sword },
  {
    value: "Hate Speech or Discrimination",
    label: "Hate Speech or Discrimination",
    icon: Heart,
  },
  { value: "Misinformation", label: "Misinformation", icon: Info },
  { value: "Scam or Fraud", label: "Scam or Fraud", icon: DollarSign },
  {
    value: "Copyright Violation",
    label: "Copyright Violation",
    icon: Copyright,
  },
  { value: "Other", label: "Other", icon: MoreHorizontal },
];

export function ReportCharacterModal({}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [step, setStep] = useState<"reasons" | "details">("reasons");
  const character = useChatStore((state) => state.activeChatData?.character);
  const submitReportMutation = useSubmitCharacterReportMutation();

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    setStep("details");
  };

  const handleBack = () => {
    setStep("reasons");
  };

  const handleSubmit = async () => {
    if (!selectedReason || !character?.id) return;

    await submitReportMutation.mutateAsync({
      details: details,
      reason: selectedReason,
      characterId: character?.id,
    });

    // Reset form
    setSelectedReason("");
    setDetails("");
    setStep("reasons");
    setIsOpen(false);
  };

  const handleClose = () => {
    setSelectedReason("");
    setDetails("");
    setStep("reasons");
    setIsOpen(false);
    submitReportMutation.reset();
  };

  const onOpenChange = (bool: boolean) => {
    if (!bool) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger >
        <span  className="text-xs hover:underline text-muted-foreground">
          Report
        </span>
      </DialogTrigger>

      <DialogContent className="p-0 border-0 bg-transparent shadow-none">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-background dark:bg-card border border-border rounded-2xl shadow-2xl w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-4 flex-shrink-0 border-b border-border">
              {step === "details" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="absolute left-4 top-4 h-8 w-8 rounded-full hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute right-4 top-4 h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Character Preview */}
              <div className="flex items-center justify-center gap-3">
                <Avatar
                  className="h-10 w-10 border border-border"
                  src={character?.avatarUrl || ""}
                  alt={character?.name}
                  fallback={character?.name}
                />
                <div className="text-center">
                  <h3 className="font-medium text-foreground text-sm">
                    {character?.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 ">
              <AnimatePresence mode="wait">
                {step === "reasons" && (
                  <motion.div
                    key="reasons"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 max-h-fit overflow-y-auto overflow-x-hidden px-2"
                  >
                    {reportReasons.map((reason) => {
                      const IconComponent = reason.icon;

                      return (
                        <motion.button
                          key={reason.value}
                          type="button"
                          onClick={() => handleReasonSelect(reason.value)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-muted-foreground/50 hover:bg-muted/50 text-left transition-all duration-200 w-full"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <IconComponent className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            {reason.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm font-medium text-foreground">
                        {selectedReason}
                      </p>
                    </div>

                    {/* Details Textarea */}
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Additional details (optional)..."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="min-h-[100px] resize-none text-sm"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {details.length}/500
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitReportMutation.isPending}
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      {submitReportMutation.isPending
                        ? "Submitting..."
                        : "Submit Report"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
