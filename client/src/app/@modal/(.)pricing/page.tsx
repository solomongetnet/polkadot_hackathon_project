"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CloseButton from "./close-button";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { planFeatures } from "@/lib/plan/plan-features";
import {
  useGetPlansQuery,
  useUpgradeUserPlanMutation,
} from "@/hooks/api/use-plan";
import { formatCurrency } from "@/utils";
import { useRouter } from "next/navigation";

const comparisonFeatures = [
  {
    feature: "Saved Chats",
    free: "8 chats",
    premium: "50+ chats",
    freeHas: true,
    premiumHas: true,
  },
  {
    feature: "Messages per Chat",
    free: "10",
    premium: "100+",
    freeHas: true,
    premiumHas: true,
  },
  {
    feature: "Custom Characters",
    free: "3 characters",
    premium: "Unlimited",
    freeHas: true,
    premiumHas: true,
  },
  {
    feature: "Themes & Visuals",
    free: "Default",
    premium: "Fully customizable",
    freeHas: true,
    premiumHas: true,
  },
  {
    feature: "Memory & Context",
    free: "Short-term only",
    premium: "Full context memory",
    freeHas: true,
    premiumHas: true,
  },
  {
    feature: "Voice & Avatar Customization",
    free: "Not available",
    premium: "Fully customizable",
    freeHas: false,
    premiumHas: true,
  },
  {
    feature: "Export Chats",
    free: "Not available",
    premium: "PDF / Markdown",
    freeHas: false,
    premiumHas: true,
  },
  {
    feature: "Custom Personality",
    free: "Presets only",
    premium: "Tunable traits",
    freeHas: true,
    premiumHas: true,
  },
  {
    feature: "Voice Calls",
    free: "Not available",
    premium: "Included",
    freeHas: false,
    premiumHas: true,
  },
  {
    feature: "Early Feature Access",
    free: "Not available",
    premium: "Included",
    freeHas: false,
    premiumHas: true,
  },
];

export default function UpgradeModal() {
  const [showComparison, setShowComparison] = useState(false);
  const router = useRouter();
  const [animate, setAnimate] = useState(false);
  const getPlansQuery = useGetPlansQuery();
  useEffect(() => {
    setAnimate(false);
    const timeout = setTimeout(() => setAnimate(true), 20);
    return () => clearTimeout(timeout);
  }, [showComparison]);
  const upgradeUserPlanMutation = useUpgradeUserPlanMutation();

  const handleBack = () => setShowComparison(false);

  const handleUpgrade = async (plan: "PLUS") => {
    const { checkout_url } = await upgradeUserPlanMutation.mutateAsync({
      txRef: "",
      plan: plan,
    });

    if(checkout_url){
    router.push(checkout_url);

    }
  };

  const animationClass = animate
    ? "opacity-100 translate-y-0 transition ease-out duration-300"
    : "opacity-0 translate-y-6 transition ease-in duration-150";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <CloseButton />
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xl min-w-full min-h-full" />

      <div
        className={`relative mx-4 bg-background rounded-2xl p-6 shadow-2xl  max-w-2xl ${animationClass}`}
      >
        {showComparison ? (
          <>
            {/* Back */}
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 text-foreground/60 hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl font-semibold">Free vs Chrapia+</h2>
            </div>

            {/* Comparison Table */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 p-3 bg-accent rounded-xl font-medium text-sm sticky top-0">
                <div>Feature</div>
                <div className="text-center">Free</div>
                <div className="text-center">Chrapia+</div>
              </div>

              {comparisonFeatures.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-2 p-3 bg-accent rounded-xl text-xs"
                >
                  <div className="font-medium">{item.feature}</div>
                  <div className="text-center flex items-center justify-center gap-1">
                    {item.freeHas ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-muted-foreground">
                          {item.free}
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {item.free}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-center flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-foreground">{item.premium}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button
                className="w-full font-semibold py-3 rounded-xl "
                size="lg"
                onClick={() => handleUpgrade("PLUS")}
                disabled={getPlansQuery.isPending}
              >
                {getPlansQuery.isPending
                  ? "Loading..."
                  : getPlansQuery.data
                  ? `
                  Get plus ${formatCurrency(
                    getPlansQuery?.data?.find((plan) => plan.name === "PLUS")
                      ?.priceCents || 0
                  )}
                  `
                  : ""}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Overview */}
            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl font-semibold">
                Chrapia<span className="text-blue-500 font-bold">+</span>
              </h2>
              <p className="text-muted-foreground text-sm">Birr 400/month</p>
            </div>

            <div className="space-y-3 mb-8 overflow-y-auto max-h-[50vh]">
              {planFeatures["PLUS"].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="flex items-start gap-4 p-4 bg-accent rounded-xl"
                  >
                    <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                    <div>
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full font-semibold py-3 rounded-xl "
                size="lg"
                onClick={() => handleUpgrade("PLUS")}
                disabled={getPlansQuery.isPending}
              >
                {getPlansQuery.isPending
                  ? "Loading..."
                  : getPlansQuery.data
                  ? `
                  Get plus ${formatCurrency(
                    getPlansQuery?.data?.find((plan) => plan.name === "PLUS")
                      ?.priceCents || 0
                  )}
                  `
                  : ""}
              </Button>
              <Button
                variant="outline"
                className="w-full font-medium py-3 rounded-xl"
                size="lg"
                onClick={() => setShowComparison(true)}
              >
                Compare with Free
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Payments secured by <u>Chapa</u>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
