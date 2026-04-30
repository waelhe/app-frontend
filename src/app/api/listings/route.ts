import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/listings — List listings with pagination, category filter, search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const size = Math.min(100, Math.max(1, Number(searchParams.get('size') || 12)))
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || 'ACTIVE'
    const providerId = searchParams.get('providerId') || undefined

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (providerId) {
      where.providerId = providerId
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const [items, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          provider: {
            select: { id: true, name: true, displayName: true, image: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      db.listing.count({ where }),
    ])

    // Compute average rating for each listing
    const listingsWithRating = items.map((listing) => {
      const ratings = listing.reviews.map((r) => r.rating)
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0
      const { reviews, ...rest } = listing
      return { ...rest, avgRating, reviewCount: ratings.length }
    })

    return NextResponse.json({
      data: listingsWithRating,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    })
  } catch (error) {
    console.error('[LISTINGS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

// POST /api/listings — Create a new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      price,
      currency,
      images,
      location,
      providerId,
    } = body

    if (!title || !category || !providerId) {
      return NextResponse.json(
        { error: 'title, category, and providerId are required' },
        { status: 400 }
      )
    }

    const listing = await db.listing.create({
      data: {
        title,
        description: description || null,
        category,
        price: price ?? 0,
        currency: currency || 'SYP',
        images: images ? JSON.stringify(images) : '[]',
        location: location || null,
        providerId,
        status: 'ACTIVE',
      },
      include: {
        provider: {
          select: { id: true, name: true, displayName: true, image: true },
        },
      },
    })

    return NextResponse.json({ data: listing }, { status: 201 })
  } catch (error) {
    console.error('[LISTINGS_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
