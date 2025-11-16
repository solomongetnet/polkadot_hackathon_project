import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bot,
  Crown,
  Download,
  Mail,
  MessageSquare,
  Shield,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickActionsCard = () => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>User management tools and utilities</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-2 md:gap-4">
        <Button
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <UserPlus className="h-5 w-5" />
          <span className="text-xs">Add User</span>
        </Button>
        <Button
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <Mail className="h-5 w-5" />
          <span className="text-xs">Bulk Email</span>
        </Button>
        <Button
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <Shield className="h-5 w-5" />
          <span className="text-xs">Permissions</span>
        </Button>
        <Button
          variant="outline"
          className="max-w-full h-12 sm:h-20 sm:flex-col items-center gap-2 hover:scale-105 transition-transform bg-transparent"
        >
          <Download className="h-5 w-5" />
          <span className="text-xs">Export Data</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
