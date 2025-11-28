"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPassword({ className, ...props }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");

  const inputRefs = useRef([]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    // TODO: Send OTP to email
    console.log("Send OTP to:", email);
    setStep("otp");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    console.log("Email:", email);
    console.log("OTP:", otp);
    console.log("New Password:", newPassword);
    // TODO: Verify OTP and reset password
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow 0-9 or empty

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <form
      onSubmit={step === "email" ? handleSendOtp : handleResetPassword}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {step === "email"
            ? "Enter your email address to receive an OTP."
            : "Enter the 6-digit OTP sent to your email and set a new password."}
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            disabled={step === "otp"}
          />
        </div>

        {step === "otp" && (
          <>
            <div className="grid gap-3">
              <Label>OTP</Label>
              <div className="flex gap-2 justify-between">
                {otpDigits.map((digit, index) => (
                  <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-10 text-center"
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
          </>
        )}

        <Button type="submit" className="w-full">
          {step === "email" ? "Send OTP" : "Reset Password"}
        </Button>
      </div>
    </form>
  );
}
