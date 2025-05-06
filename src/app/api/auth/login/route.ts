import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  SupabaseClient,
  Session,
  User,
  AuthError,
} from "@supabase/supabase-js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(
  body: Record<string, unknown>,
  status = 200,
  init: ResponseInit = {}
) {
  return NextResponse.json(body, { status, ...init });
}

function makeCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
  secure: boolean
) {
  return [
    `${name}=${value}`,
    `Max-Age=${maxAgeSeconds}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");
    if (contentType !== "application/json") {
      console.error("無効なコンテンツタイプ:", contentType);
      return json(
        { error: "無効なコンテンツタイプです。JSONを送信してください。" },
        415
      );
    }

    let identifier: string, password: string;
    try {
      const parsed = (await req.json()) as Record<string, unknown>;
      identifier = String(parsed.identifier);
      password = String(parsed.password);
    } catch (err) {
      console.error("JSON解析エラー:", err);
      return json({ error: "無効なJSONです。" }, 400);
    }

    if (!identifier || !password) {
      console.error("認証情報が未設定です。", {
        identifier,
        password,
      });
      return json({ error: "認証情報は必須です。" }, 400);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEYを確認してください。"
      );
      return json(
        { error: "サーバー設定エラー。管理者に連絡してください。" },
        500
      );
    }

    let supabase: SupabaseClient;
    try {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: true },
      });
    } catch (err) {
      console.error("Supabaseクライアントの初期化失敗:", err);
      return json({ error: "認証サービス初期化エラー。" }, 500);
    }

    let response;
    try {
      const email = EMAIL_RE.test(identifier)
        ? identifier
        : `${identifier}@josanism.com`;
      response = await supabase.auth.signInWithPassword({ email, password });
    } catch (err) {
      console.error("認証サービス呼び出し中エラー:", err);
      return json({ error: "認証サービスでエラーが発生しました。" }, 502);
    }

    const { data, error } = response;
    if (error || !data?.session || !data?.user) {
      console.error("認証失敗:", error?.message);
      return json(
        {
          error:
            "認証に失敗しました。メールアドレスまたはユーザーIDとパスワードを確認してください。",
        },
        401
      );
    }

    const session: Session = data.session;
    const user: User = data.user;

    const secureFlag = process.env.NODE_ENV === "production";
    try {
      const accessCookie = makeCookie(
        "sb-access-token",
        session.access_token,
        session.expires_in ?? 0,
        secureFlag
      );
      const refreshCookie = makeCookie(
        "sb-refresh-token",
        session.refresh_token,
        60 * 60 * 24 * 30,
        secureFlag
      );

      const res = json({ user }, 200);
      res.headers.append("Set-Cookie", accessCookie);
      res.headers.append("Set-Cookie", refreshCookie);
      return res;
    } catch (err) {
      console.error("Cookie設定エラー:", err);
      return json({ error: "セッション情報の設定に失敗しました。" }, 500);
    }
  } catch (err) {
    console.error("予期せぬサーバーエラー:", err);
    return json({ error: "予期せぬサーバーエラーが発生しました。" }, 500);
  }
}
