import { NextRequest } from "next/server";

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] }
) {
  const { path } = params;
  const searchParams = request.nextUrl.searchParams.toString();
  const pathString = path.join("/");
  const url = `${POSTHOG_HOST}/${pathString}${searchParams ? `?${searchParams}` : ""}`;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(POSTHOG_HOST).host);

  const body = request.method === "GET" ? undefined : await request.text();

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
