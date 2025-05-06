import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold tracking-tighter text-primary">
            404
          </h1>
          <h2 className="text-3xl font-bold tracking-tight">
            ページが見つかりません
          </h2>
          <p className="text-muted-foreground">
            申し訳ありません。お探しのページが見つかりませんでした。移動、削除、または存在しない可能性があります。
          </p>
        </div>

        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            ホームに戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
