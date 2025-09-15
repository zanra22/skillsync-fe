"use client";

import { Suspense } from "react";
import EmailVerification from "@/components/auth/EmailVerification";
import { Card, CardContent } from "@/components/ui/card";

const EmailVerificationContent = () => {
  return <EmailVerification />;
};

const EmailVerificationPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neural flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto bg-card/95 backdrop-blur-sm border-border/50 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  );
};

export default EmailVerificationPage;
