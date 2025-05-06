"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Upload, X, Eye, EyeOff } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

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
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import { Slider } from "@/components/shadcn/slider";

import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    userId: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    if (
      name === "confirmPassword" ||
      (name === "password" && formData.confirmPassword)
    ) {
      if (name === "password" && value !== formData.confirmPassword) {
        setErrors({ ...errors, confirmPassword: "パスワードが一致しません" });
      } else if (name === "confirmPassword" && value !== formData.password) {
        setErrors({ ...errors, confirmPassword: "パスワードが一致しません" });
      } else {
        setErrors({ ...errors, confirmPassword: "" });
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, agreeToTerms: checked });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profileImage: "ファイルサイズは5MB以下にしてください",
        }));
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImageUrl);
      setCropperOpen(false);

      // Clear any previous image upload error
      if (errors.profileImage) {
        setErrors({ ...errors, profileImage: "" });
      }
    } catch (e) {
      console.error("画像の切り抜き中にエラーが発生しました:", e);
    }
  };

  const getCroppedImg = (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = document.createElement("img");
      image.src = imageSrc;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("2Dコンテキストが取得できません"));
          return;
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        resolve(canvas.toDataURL("image/jpeg"));
      };

      image.onerror = () => {
        reject(new Error("画像読み込みエラー"));
      };
    });
  };

  const cancelCrop = () => {
    setCropperOpen(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeProfileImage = () => {
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "メールアドレスは必須です";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "メールアドレスが無効です";

    if (!formData.userId) newErrors.userId = "ユーザーIDは必須です";

    if (!formData.password) newErrors.password = "パスワードは必須です";
    else if (formData.password.length < 8)
      newErrors.password = "パスワードは8文字以上で入力してください";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "パスワードを確認してください";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "パスワードが一致しません";

    if (!croppedImage)
      newErrors.profileImage = "プロフィール画像を設定してください";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          userId: formData.userId,
          password: formData.password,
          profileImage: croppedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 409:
            if (data.error.includes("Username")) {
              setErrors((prev) => ({
                ...prev,
                userId: "このユーザーIDは既に使用されています",
              }));
            } else if (data.error.includes("Email")) {
              setErrors((prev) => ({
                ...prev,
                email: "このメールアドレスは既に登録されています",
              }));
            }
            break;
          case 400:
            setErrors((prev) => ({ ...prev, form: data.error }));
            break;
          default:
            setErrors((prev) => ({
              ...prev,
              form: "サインアップ中にエラーが発生しました",
            }));
        }
        return;
      }

      router.push("/auth/verify");
    } catch (error) {
      console.error("Signup error:", error);
      setErrors((prev) => ({
        ...prev,
        form: "サインアップ中にエラーが発生しました",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.email !== "" &&
      formData.userId !== "" &&
      formData.password !== "" &&
      formData.confirmPassword !== "" &&
      formData.password === formData.confirmPassword &&
      formData.agreeToTerms &&
      croppedImage !== null &&
      Object.values(errors).every((error) => !error)
    );
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            サインアップ
          </CardTitle>
          <CardDescription className="text-center">
            サインアップするには認証情報を入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div
                className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border cursor-pointer group"
                onClick={triggerFileInput}
                role="button"
                tabIndex={0}
                aria-label="プロフィール画像をアップロード"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    triggerFileInput();
                  }
                }}
              >
                {croppedImage ? (
                  <>
                    <Image
                      src={croppedImage || "/placeholder.svg"}
                      alt="Profile preview"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </>
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-hidden="true"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-4 w-4" />
                  {croppedImage ? "写真を変更" : "写真をアップロード"}
                </Button>

                {croppedImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={removeProfileImage}
                  >
                    <X className="h-4 w-4" />
                    削除
                  </Button>
                )}
              </div>

              {errors.profileImage && (
                <p className="text-sm text-destructive mt-1">
                  {errors.profileImage}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(errors.email && "border-destructive")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">ユーザーID</Label>
                <Input
                  id="userId"
                  name="userId"
                  placeholder="ユーザー名"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className={cn(errors.userId && "border-destructive")}
                  aria-invalid={!!errors.userId}
                  aria-describedby={errors.userId ? "userId-error" : undefined}
                />
                {errors.userId && (
                  <p id="userId-error" className="text-sm text-destructive">
                    {errors.userId}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={cn(
                      errors.confirmPassword && "border-destructive"
                    )}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword
                        ? "パスワードを隠す"
                        : "パスワードを表示"}
                    </span>
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-destructive"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="terms" className="text-sm">
                  利用規約およびプライバシーポリシーに同意します
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!isFormValid()}>
              サインアップ
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            すでにアカウントをお持ちですか？{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>

      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>プロフィール画像をトリミング</DialogTitle>
            <DialogDescription>
              正方形のアスペクト比に調整してください。
            </DialogDescription>
          </DialogHeader>

          <div className="relative w-full h-80 mt-4">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="zoom">ズーム</Label>
            <Slider
              id="zoom"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              aria-label="ズーム"
            />
          </div>

          <DialogFooter className="flex justify-between sm:justify-between mt-4">
            <Button type="button" variant="outline" onClick={cancelCrop}>
              キャンセル
            </Button>
            <Button type="button" onClick={createCroppedImage}>
              適用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
