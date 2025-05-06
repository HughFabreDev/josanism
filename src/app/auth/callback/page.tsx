"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Loader2, AlertTriangle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
        error: supabaseError,
      } = await supabase.auth.getSession();

      if (supabaseError) {
        console.error("Supabase セッション取得エラー:", supabaseError);
        setError(
          `セッションの取得に失敗しました。${supabaseError.message} (コード: ${supabaseError.status})`
        );
        return;
      }

      if (!session) {
        console.warn("セッションが見つかりませんでした。");
        setError(
          "有効な認証情報が見つかりませんでした。再度ログインしてください。"
        );
        return;
      }

      router.replace("/dashboard");
    } catch (e: any) {
      console.error("予期しないエラー:", e);
      if (e.message?.includes("Failed to fetch")) {
        setError(
          "ネットワーク接続に失敗しました。インターネット接続を確認してください。"
        );
      } else {
        setError(`予期しないエラーが発生しました。詳細: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    handleAuth();
  }, [handleAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm mx-auto">
        <Card className="rounded-2xl shadow-2xl">
          <CardHeader className="flex flex-col items-center gap-4 p-8">
            {loading && !error && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            {error && <AlertTriangle className="h-12 w-12 text-destructive" />}
            <CardTitle className="text-3xl font-bold text-center">
              {loading && !error && "認証中..."}
              {error && "認証エラー"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 px-8 pb-1 text-center">
            {loading && !error && (
              <p className="text-base text-muted-foreground">
                少々お待ちください。自動的に遷移します。
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive font-medium whitespace-pre-wrap">
                {error}
              </p>
            )}
          </CardContent>

          {error && (
            <CardFooter className="flex flex-col gap-3 p-8">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleAuth}
              >
                再試行
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => router.replace("/login")}
              >
                ログイン画面へ戻る
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
