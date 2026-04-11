import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sliders = await prisma.slider.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(sliders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const count = await prisma.slider.count();
        const slider = await prisma.slider.create({
            data: {
                title: data.title,
                subtitle: data.subtitle,
                description: data.description,
                image: data.image,
                thumbnail: data.thumbnail,
                link: data.link,
                buttonText: data.buttonText,
                order: count + 1,
                status: data.status || 'ACTIVE'
            }
        });
        return NextResponse.json(slider, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 });
    }
}
