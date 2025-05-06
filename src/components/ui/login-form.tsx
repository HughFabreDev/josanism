"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";

export function LoginForm() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier)
      newErrors.identifier =
        "メールアドレスまたはユーザーIDを入力してください。";
    if (!formData.password)
      newErrors.password = "パスワードを入力してください。";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const email = formData.identifier.includes("@")
        ? formData.identifier
        : `${formData.identifier}@josanism.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) {
        setErrors({
          ...errors,
          password: "メールアドレスまたはパスワードが間違っています。",
        });
        return;
      }

      window.location.href = "/";
    } catch (error) {
      setErrors({
        ...errors,
        password:
          "ログイン中にエラーが発生しました。後でもう一度お試しください。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          ログイン
        </CardTitle>
        <CardDescription className="text-center">
          ログインするには認証情報を入力してください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">メールアドレスまたはユーザーID</Label>
            <Input
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              className={cn(errors.identifier && "border-destructive")}
              aria-invalid={!!errors.identifier}
              aria-describedby={
                errors.identifier ? "identifier-error" : undefined
              }
            />
            {errors.identifier && (
              <p id="identifier-error" className="text-sm text-destructive">
                {errors.identifier}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                className={cn(errors.password && "border-destructive")}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? "パスワードを隠す" : "パスワードを表示"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          アカウントがありませんか？
          <Link href="/auth/signup" className="text-primary hover:underline">
            サインアップ
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
