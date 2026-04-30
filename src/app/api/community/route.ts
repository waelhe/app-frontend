import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/community — List community posts (news, events, charity)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const size = Math.min(100, Math.max(1, Number(searchParams.get('size') || 12)))
    const type = searchParams.get('type') || undefined
    const search = searchParams.get('search') || undefined

    const where: Record<string, unknown> = { isActive: true }

    if (type) where.type = type

    if (search) {
      where.OR = [
        { titleAr: { contains: search } },
        { titleEn: { contains: search } },
        { contentAr: { contains: search } },
        { contentEn: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.communityPost.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * size,
        take: size,
      }),
      db.communityPost.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    })
  } catch (error) {
    console.error('[COMMUNITY_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    )
  }
}

// POST /api/community — Create a community post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      titleAr,
      titleEn,
      contentAr,
      contentEn,
      image,
      type,
      isPinned,
    } = body

    if (!titleAr || !titleEn) {
      return NextResponse.json(
        { error: 'titleAr and titleEn are required' },
        { status: 400 }
      )
    }

    const post = await db.communityPost.create({
      data: {
        titleAr,
        titleEn,
        contentAr: contentAr || null,
        contentEn: contentEn || null,
        image: image || null,
        type: type || 'news',
        isPinned: isPinned ?? false,
      },
    })

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (error) {
    console.error('[COMMUNITY_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create community post' },
      { status: 500 }
    )
  }
}
