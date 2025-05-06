import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/shadcn/button";

export default function VerifyPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12 px-4">
      <Card className="w-full max-w-md mx-auto shadow-lg rounded-2xl">
        <CardHeader className="space-y-4 p-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full">
              <MailCheck className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">
            メールアドレスの確認
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-6">
          <p>
            確認メールを送信しました。<br />
            メール内のリンクをクリックしてください。
          </p>
          <p className="text-sm text-muted-foreground">
            メールが届かない場合は、迷惑メールをご確認ください。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
