import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/listings/[id] — Get single listing by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, displayName: true, image: true, phone: true },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, displayName: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          select: { id: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Compute average rating
    const ratings = listing.reviews.map((r) => r.rating)
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0

    return NextResponse.json({
      data: { ...listing, avgRating, reviewCount: ratings.length },
    })
  } catch (error) {
    console.error('[LISTING_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

// PUT /api/listings/[id] — Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'title',
      'description',
      'category',
      'price',
      'currency',
      'status',
      'location',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (body.images !== undefined) {
      updateData.images = JSON.stringify(body.images)
    }

    const listing = await db.listing.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: { id: true, name: true, displayName: true, image: true },
        },
      },
    })

    return NextResponse.json({ data: listing })
  } catch (error) {
    console.error('[LISTING_PUT]', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE /api/listings/[id] — Delete listing
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    await db.listing.delete({ where: { id } })

    return NextResponse.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    console.error('[LISTING_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
