import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export default async function middleware(
  _req: NextRequest,
  _event: NextFetchEvent,
): Promise<NextResponse | void> {
  console.log('Hello from [...slug].ts middleware');
  // return NextResponse.next();
}
