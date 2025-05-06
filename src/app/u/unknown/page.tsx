import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import { UserX, ArrowLeft } from "lucide-react";

export default function UnknownUserPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <UserX className="h-24 w-24 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            ユーザーが見つかりません
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            お探しのユーザーは存在しないか、
            <br />
            削除された可能性があります。
          </p>
        </div>

        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            ホームに戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
