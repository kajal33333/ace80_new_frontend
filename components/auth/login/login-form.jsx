"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";
import { setCookie } from "cookies-next";
import { showSuccess } from "@/lib/toastUtils";
import { JSONStringify } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function LoginForm({ className, ...props }) {
  const axios = axiosInstance();
  const router = useRouter();
  const [formData, setFormData] = useState({
   emp_code: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);
    try {
      const response = await axios.post("/users/login", formData);
      if (response?.status === 200) {
        console.log("Login successful:", response?.data);
        setCookie("agritech_token", JSONStringify(response?.data?.data?.token),{maxAge: 60 * 60 * 12});
        setCookie("agritech_user", JSONStringify(response?.data?.data),{maxAge: 60 * 60 * 12});
        showSuccess(response?.data?.message);
        if(response?.data?.data?.role === "Support"){
          router.push("/admin/support-chat")
        }
        else{
          router.push("/admin/dashboard");
        }
      }
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.error?.errors) {
        const validationErrors = error?.response?.data?.error?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          const newErrors = {};
          validationErrors.forEach((err) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your user ID below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} >
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="empCode">User Id</Label>
                <Input
                  id="empCode"
                  type="text"
                  placeholder="Enter your user Id"
                  value={formData.emp_code}
                  onChange={(e) =>
                    setFormData({ ...formData, emp_code: e.target.value })
                  }
                />
                {errors?.emp_code && (
                  <p className="text-red-500 text-xs mt-1">{errors?.emp_code}</p>
                )}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link> */}
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                     placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  {errors?.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.password}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5 cursor-pointer" />
                    ) : (
                      <EyeOff className="w-5 h-5 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full cursor-pointer">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
