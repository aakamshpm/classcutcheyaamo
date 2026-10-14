import { renderPwaIcon } from "@/lib/pwa-icon";

// the png icons the web manifest points at. generated at build time, so
// they're plain static files by the time anyone asks for them.
export const dynamic = "force-static";
export const dynamicParams = false;

const ICONS: Record<string, { size: number; maskable: boolean }> = {
  "icon-192.png": { size: 192, maskable: false },
  "icon-512.png": { size: 512, maskable: false },
  "icon-maskable-512.png": { size: 512, maskable: true },
};

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const icon = ICONS[name];
  if (!icon) return new Response("not found", { status: 404 });
  return renderPwaIcon(icon.size, { maskable: icon.maskable });
}
