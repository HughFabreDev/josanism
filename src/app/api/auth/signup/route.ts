import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

const BUCKET = "profile-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const EMAIL_REGEX = /\S+@\S+\.\S+/;

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function json(
  body: Record<string, unknown>,
  status = 200,
  init: ResponseInit = {}
) {
  return NextResponse.json(body, { status, ...init });
}

export async function POST(request: NextRequest) {
  // Method check
  if (request.method !== "POST") {
    console.error("許可されていないメソッド:", request.method);
    return json({ error: "メソッドが許可されていません。" }, 405);
  }

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("無効なコンテンツタイプ:", contentType);
      return json(
        { error: "無効なコンテンツタイプです。JSONを送信してください。" },
        415
      );
    }

    let email: string, userId: string, password: string, profileImage: string;
    try {
      const parsed = (await request.json()) as Record<string, unknown>;
      email = String(parsed.email);
      userId = String(parsed.userId);
      password = String(parsed.password);
      profileImage = String(parsed.profileImage);
    } catch (err) {
      console.error("JSON解析エラー:", err);
      return json({ error: "無効なJSONです。" }, 400);
    }

    if (!email || !userId || !password || !profileImage) {
      console.error("必須フィールドが不足しています。", {
        email,
        userId,
        password,
        profileImage,
      });
      return json({ error: "必須フィールドが不足しています。" }, 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      console.error("無効なメール形式:", email);
      return json({ error: "無効なメールアドレス形式です。" }, 400);
    }
    if (password.length < 8) {
      console.error("パスワードが短すぎます。長さ: ", password.length);
      return json(
        { error: "パスワードは8文字以上である必要があります。" },
        400
      );
    }

    try {
      const { data: existing, error: dupErr } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("username", userId)
        .maybeSingle();
      if (dupErr) throw dupErr;
      if (existing) {
        console.error("ユーザー名重複:", userId);
        return json({ error: "ユーザー名は既に使用されています。" }, 409);
      }
    } catch (err) {
      console.error("ユーザー名チェックエラー:", err);
      return json({ error: "サーバーエラーが発生しました。" }, 500);
    }

    const match = profileImage.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      console.error(
        "画像データの形式が不正です。:",
        profileImage.substring(0, 30)
      );
      return json({ error: "画像データが正しくありません。" }, 400);
    }
    const mime = match[1];
    let buffer: Buffer;
    try {
      buffer = Buffer.from(match[2], "base64");
    } catch (err) {
      console.error("画像デコードエラー:", err);
      return json({ error: "画像デコードに失敗しました。" }, 400);
    }
    if (buffer.length > MAX_IMAGE_BYTES) {
      console.error("画像サイズ超過:", buffer.length);
      return json({ error: "画像は5MB以下である必要があります。" }, 400);
    }

    let signUpData;
    let signUpError;
    try {
      ({ data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      }));
    } catch (err) {
      console.error("認証サービス呼び出し中エラー:", err);
      return json({ error: "認証サービスでエラーが発生しました。" }, 502);
    }
    if (signUpError) {
      if (signUpError.status === 422) {
        console.error("メール重複:", email);
        return json({ error: "メールアドレスは既に登録されています。" }, 409);
      }
      console.error("サインアップエラー:", signUpError.message);
      return json({ error: "サインアップに失敗しました。" }, 500);
    }
    const user = signUpData.user;
    if (!user) {
      console.error("サインアップ後にユーザー情報が取得できませんでした。");
      return json({ error: "サーバーエラーが発生しました。" }, 500);
    }

    const filePath = `${user.id}/${nanoid()}`;
    try {
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType: mime,
          upsert: false,
        });
      if (uploadErr) throw uploadErr;
    } catch (err) {
      console.error("画像アップロードエラー:", err);
      await supabase.auth.admin.deleteUser(user.id);
      return json({ error: "画像のアップロードに失敗しました。" }, 500);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    try {
      const { error: insertErr } = await supabase
        .from("profiles")
        .insert({ id: user.id, username: userId, avatar_url: publicUrl });
      if (insertErr) throw insertErr;
    } catch (err) {
      console.error("プロフィール挿入エラー:", err);
      await supabase.storage.from(BUCKET).remove([filePath]);
      await supabase.auth.admin.deleteUser(user.id);
      return json({ error: "プロフィール作成に失敗しました。" }, 500);
    }

    return json(
      { message: "登録完了！メールを確認して認証してください。" },
      201
    );
  } catch (err) {
    console.error("予期せぬサーバーエラー:", err);
    return json({ error: "予期せぬサーバーエラーが発生しました。" }, 500);
  }
}
