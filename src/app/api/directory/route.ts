import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/directory — List directory items with category/group filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const size = Math.min(100, Math.max(1, Number(searchParams.get('size') || 20)))
    const category = searchParams.get('category') || undefined
    const group = searchParams.get('group') || undefined
    const search = searchParams.get('search') || undefined
    const isEmergency = searchParams.get('isEmergency')

    const where: Record<string, unknown> = { isActive: true }

    if (category) where.category = category
    if (group) where.group = group
    if (isEmergency !== null && isEmergency !== undefined) {
      where.isEmergency = isEmergency === 'true'
    }

    if (search) {
      where.OR = [
        { nameAr: { contains: search } },
        { nameEn: { contains: search } },
        { address: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.directoryItem.findMany({
        where,
        orderBy: [{ isEmergency: 'desc' }, { rating: 'desc' }, { nameEn: 'asc' }],
        skip: (page - 1) * size,
        take: size,
      }),
      db.directoryItem.count({ where }),
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
    console.error('[DIRECTORY_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch directory items' },
      { status: 500 }
    )
  }
}

// POST /api/directory — Create a directory item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nameAr,
      nameEn,
      category,
      group,
      phone,
      address,
      descriptionAr,
      descriptionEn,
      image,
      rating,
      isEmergency,
    } = body

    if (!nameAr || !nameEn || !category || !group) {
      return NextResponse.json(
        { error: 'nameAr, nameEn, category, and group are required' },
        { status: 400 }
      )
    }

    const item = await db.directoryItem.create({
      data: {
        nameAr,
        nameEn,
        category,
        group,
        phone: phone || null,
        address: address || null,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        image: image || null,
        rating: rating ?? 0,
        isEmergency: isEmergency ?? false,
      },
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    console.error('[DIRECTORY_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create directory item' },
      { status: 500 }
    )
  }
}
