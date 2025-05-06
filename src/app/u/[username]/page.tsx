import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/avatar";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Edit, UserIcon } from "lucide-react";
import { Separator } from "@/components/shadcn/separator";

function formatDate(dateString: string | undefined) {
  if (!dateString) return "不明";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  name: string | null;
  banner_url: string | null;
  created_at: string;
};

async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getProfileByUsername(username: string) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    console.error("プロフィールの取得中にエラーが発生しました：", error);
    return null;
  }
  return profile;
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = decodeURIComponent(params.username);

  const [profile, currentUser] = await Promise.all([
    getProfileByUsername(username),
    getCurrentUser(),
  ]);

  if (!profile) {
    redirect("/u/unknown");
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="w-full overflow-hidden border-none shadow-lg rounded-xl">
          <div className="relative h-48 w-full">
            {profile.banner_url ? (
              <Image
                src={profile.banner_url || "/placeholder.svg"}
                alt="プロフィールバナー"
                fill
                sizes="100vw"
                priority
                className="object-cover rounded-t-xl"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-slate-800 rounded-t-xl"></div>
            )}
          </div>

          <div className="relative px-6 sm:px-8 -mt-12 z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4">
                <Avatar className="h-24 w-24 border-2 border-white dark:border-slate-900 rounded-full shadow-md">
                  <AvatarImage
                    src={profile.avatar_url ?? undefined}
                    alt={profile.name ?? profile.username ?? ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-2xl">
                    {profile.name?.charAt(0) ?? profile.username?.charAt(0) ?? (
                      <UserIcon className="h-10 w-10" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {profile.name || "名前なし"}
                  </h1>
                  <div className="flex flex-col gap-1 mt-1">
                    {profile.username && (
                      <p className="text-sm text-muted-foreground">
                        @{profile.username}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <Button className="self-start sm:self-auto gap-1.5" asChild>
                  <Link href={`/${profile.username}/edit`}>
                    <Edit className="h-4 w-4" />
                    <span>プロフィールを編集</span>
                  </Link>
                </Button>
              )}
            </div>

            <div className="mt-6 mb-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>
                  プロフィール作成日: {formatDate(profile.created_at)}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="pb-8">
              <div>
                <h2 className="text-lg font-semibold mb-3">自己紹介</h2>
                {profile.bio ? (
                  <p className="leading-relaxed">{profile.bio}</p>
                ) : (
                  <div className="p-6 border border-dashed rounded-lg bg-muted/30 text-center">
                    <p className="text-muted-foreground">
                      自己紹介がありません。
                    </p>
                    {isOwnProfile && (
                      <Button variant="link" size="sm" className="mt-2" asChild>
                        <Link href={`/${profile.username}/edit`}>
                          自己紹介を追加
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
