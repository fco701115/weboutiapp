import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const message = await (prisma as any).message.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(message);
    } catch (error: any) {
        console.error(`PATCH /api/messages error:`, error.message || error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await (prisma as any).message.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`DELETE /api/messages error:`, error.message || error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}


