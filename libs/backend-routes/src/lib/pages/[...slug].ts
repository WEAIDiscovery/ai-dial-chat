import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export default async function middleware(
    _req: NextRequest,
    _event: NextFetchEvent,
): Promise<NextResponse | void> {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello World</title>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  `;

    return new NextResponse(htmlContent, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
