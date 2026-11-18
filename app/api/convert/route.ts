import { ConvertError, convertUrl } from "@/features/url-to-markdown/convert";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    url?: unknown;
  } | null;
  const url = typeof body?.url === "string" ? body.url : "";

  try {
    return Response.json(await convertUrl(url));
  } catch (error) {
    if (error instanceof ConvertError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.code === "extract" ? 422 : 400 },
      );
    }
    return Response.json(
      { error: "변환 중 알 수 없는 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
