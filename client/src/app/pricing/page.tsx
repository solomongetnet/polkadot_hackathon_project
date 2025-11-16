"use client"

import { useState } from "react"
import { Check, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"

const plans = [
  {
    name: "Basic",
    description: "For low budget, individual accounts",
    monthlyPrice: 7,
    annualPrice: 5,
    features: [
      { name: "Unlimited Domains", included: true },
      { name: "5 Domains Support", included: true },
      { name: "Free Wordpress Themes", included: true },
      { name: "Copyright removal", included: false },
      { name: "Email support", included: false },
      { name: "Comment support", included: false },
    ],
  },
  {
    name: "Standard",
    description: "For medium budget projects",
    monthlyPrice: 14,
    annualPrice: 10,
    featured: true,
    features: [
      { name: "Unlimited Domains", included: true },
      { name: "5 Domains Support", included: true },
      { name: "Free Wordpress Themes", included: true },
      { name: "Copyright removal", included: true },
      { name: "Email support", included: false },
      { name: "Comment support", included: false },
    ],
  },
  {
    name: "Premium",
    description: "High budget companies and entrepreneurs",
    monthlyPrice: 28,
    annualPrice: 20,
    features: [
      { name: "Unlimited Domains", included: true },
      { name: "15 Domains Support", included: true },
      { name: "Free Wordpress Themes", included: true },
      { name: "Copyright removal", included: true },
      { name: "Email support", included: true },
      { name: "Comment support", included: true },
    ],
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-16">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-8">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Choose a plan</h1>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Bill Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-blue-600" />
            <span className={`text-sm ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Bill Annually</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.featured ? "border-blue-500 shadow-lg scale-105" : "border-border"
              } transition-all duration-300 hover:shadow-lg`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          feature.included ? "text-green-600 dark:text-green-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  className={`w-full ${
                    plan.featured
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-background border border-input hover:bg-accent hover:text-accent-foreground"
                  }`}
                  variant={plan.featured ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
