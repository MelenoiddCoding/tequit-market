import { saveSiteContent } from "@/lib/site-content-server";
export async function POST(request: Request) {
  return saveSiteContent(request, false);
}
