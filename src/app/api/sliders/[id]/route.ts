import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.slider.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Slider deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete slider' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await req.json();
        const slider = await prisma.slider.update({
            where: { id },
            data: {
                title: data.title,
                subtitle: data.subtitle,
                description: data.description,
                image: data.image,
                thumbnail: data.thumbnail,
                link: data.link,
                buttonText: data.buttonText,
                status: data.status,
                order: data.order
            }
        });
        return NextResponse.json(slider);
    } catch (error) {
        console.error("PUT Slider Error:", error);
        return NextResponse.json({ error: 'Failed to update slider' }, { status: 500 });
    }
}
