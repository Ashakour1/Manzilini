import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const token = req.cookies.get('manzilini')?.value

    const { pathname } = req.nextUrl;


    const protectedRoutes = [
        '/dashboard',
        '/properties'
    ]

    const auth = ['/']

    const isProtected = protectedRoutes.some((route) => 
    pathname.startsWith(route))


    const isAuthPage = auth.includes(pathname)

    if(!token && isProtected){
        return NextResponse.redirect(new URL("/", req.url))
    }
     if(token && isAuthPage){
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path",
        "/properties/:path",
        "/"

    ]
};
