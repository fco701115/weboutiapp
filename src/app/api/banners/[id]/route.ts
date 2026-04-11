import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.banner.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Banner deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await req.json();
        const banner = await prisma.banner.update({
            where: { id },
            data: {
                title: data.title,
                subtitle: data.subtitle,
                image: data.image,
                position: data.position,
                type: data.type
            }
        });
        return NextResponse.json(banner);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }
}
