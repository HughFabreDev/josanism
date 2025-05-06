"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription,
} from "@/components/shadcn/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/shadcn/navigation-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/shadcn/avatar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    title: "ソーシャル",
    description: "ジョサン教が運営しているソーシャルサービス。",
    items: [
      {
        title: "メッセージ",
        description: "セキュアなメッセージサービス。",
        href: "/social/messages",
      },
      {
        title: "掲示板",
        description: "誰でも書き込めるスレッド型の交流サービス。",
        href: "/social/boards",
      },
      {
        title: "SNS",
        description: "投稿で人と交流するサービス。",
        href: "/social/sns",
      },
    ],
  },
  {
    title: "ゲーム",
    description: "ジョサン教が運営しているゲーム。",
    items: [
      {
        title: "オセロ",
        description: "石を挟んで色を変えるボードゲーム。",
        href: "/games/othello",
      },
      {
        title: "競馬",
        description: "馬のレースで勝敗を予想するゲーム。",
        href: "/games/horserace",
      },
      {
        title: "麻雀",
        description: "牌を揃えて点を取る頭脳ゲーム。",
        href: "/games/mahjong",
      },

      {
        title: "ゲーム一覧",
        description: "ジョサン教サイトにあるすべてのゲーム。",
        href: "/games",
      },
    ],
  },
  {
    title: "リソース",
    description: "ジョサン教に関してのリソース。",
    items: [
      {
        title: "ジョサン教とは",
        description: "ジョサン教の全容を公開。",
        href: "/resources/about",
      },
      {
        title: "リリースノート",
        description: "ジョサン教サイトの更新内容のまとめ。",
        href: "/resources/release-notes",
      },
      {
        title: "プライバシーポリシー",
        description: "個人情報の取り扱い方。",
        href: "/resources/privacy",
      },
      {
        title: "利用規約",
        description: "ジョサン教サイトでの法律。",
        href: "/resources/terms",
      },
    ],
  },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition-colors hover:text-primary"
          >
            JOSANISM
          </Link>
        </div>

        {!isMobile && (
          <NavigationMenu
            className="hidden md:flex ml-12"
            delayDuration={50}
            skipDelayDuration={50}
          >
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {item.items.map((sub) => (
                        <ListItem
                          key={sub.title}
                          title={sub.title}
                          href={sub.href}
                          description={sub.description}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <>
                  <div className="hidden md:flex md:gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                user.profile?.avatar_url ||
                                `https://www.gravatar.com/avatar/${user.email
                                  ?.toLowerCase()
                                  .trim()}?d=mp`
                              }
                              alt={
                                user.profile?.username ||
                                user.email?.split("@")[0] ||
                                "User"
                              }
                            />
                            <AvatarFallback>
                              {(user.profile?.username ||
                                user.email?.split("@")[0] ||
                                "U")[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="flex flex-col items-start px-4 py-2">
                          <div className="font-medium">
                            {user.profile?.username ||
                              user.email?.split("@")[0] ||
                              "User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/u/${user.profile?.username}`}>
                            プロフィール
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings">設定</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                          <span>ログアウト</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex md:gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/login">
                      <span>ログイン</span>
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/signup">
                      <span>サインアップ</span>
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="text-left text-lg font-bold">
                    JOSANISM
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Mobile navigation menu
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto">
                    {user && (
                      <div className="p-6 border-b">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={
                                user.profile?.avatar_url ||
                                `https://www.gravatar.com/avatar/${user.email
                                  ?.toLowerCase()
                                  .trim()}?d=mp`
                              }
                              alt={
                                user.profile?.username ||
                                user.email?.split("@")[0] ||
                                "User"
                              }
                            />
                            <AvatarFallback>
                              {(user.profile?.username ||
                                user.email?.split("@")[0] ||
                                "U")[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.profile?.username ||
                                user.email?.split("@")[0] ||
                                "User"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {navItems.map((section) => (
                      <div
                        key={section.title}
                        className="border-b last:border-b-0"
                      >
                        <div className="p-6">
                          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">
                            {section.title}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <SheetClose asChild key={item.title}>
                                <Link
                                  href={item.href}
                                  className="flex flex-col gap-0.5 rounded-md p-3 text-sm transition-colors hover:bg-accent"
                                >
                                  <span className="font-medium">
                                    {item.title}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.description}
                                  </span>
                                </Link>
                              </SheetClose>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="sticky bottom-0 border-t bg-background p-6 flex flex-col gap-2">
                    {user ? (
                      <>
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                          asChild
                        >
                          <Link href="/profile">プロフィール</Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                          asChild
                        >
                          <Link href="/settings">設定</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          className="justify-start w-full"
                          onClick={handleSignOut}
                        >
                          <span>ログアウト</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                          asChild
                        >
                          <Link href="/auth/login">
                            <span>ログイン</span>
                          </Link>
                        </Button>
                        <Button className="justify-start w-full" asChild>
                          <Link href="/auth/signup">
                            <span>新規登録</span>
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-md p-3 transition-transform active:scale-75"
      aria-label="Toggle theme"
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; description?: string }
>(({ className, title, description, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {description && (
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          )}
          {children}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
