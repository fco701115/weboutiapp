import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const messages = await (prisma as any).message.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(messages);
    } catch (error: any) {
        console.error('GET /api/messages error:', error.message || error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, content } = body;

        const message = await (prisma as any).message.create({
            data: {
                name,
                email,
                subject,
                content,
                status: 'UNREAD'
            }
        });

        return NextResponse.json(message);
    } catch (error: any) {
        console.error('POST /api/messages error:', error.message || error);
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
}




