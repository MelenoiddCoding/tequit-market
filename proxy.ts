import { NextRequest, NextResponse } from "next/server";
export function proxy(request:NextRequest){const role=request.cookies.get("tequit_demo_role")?.value;const path=request.nextUrl.pathname;if(path.startsWith("/admin")&&role!=="admin")return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`,request.url));if(path.startsWith("/dashboard")&&!role)return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`,request.url));return NextResponse.next()}
export const config={matcher:["/dashboard/:path*","/admin/:path*"]};
