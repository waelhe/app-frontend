import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/bookings — List bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const size = Math.min(100, Math.max(1, Number(searchParams.get('size') || 12)))
    const consumerId = searchParams.get('consumerId') || undefined
    const providerId = searchParams.get('providerId') || undefined
    const listingId = searchParams.get('listingId') || undefined
    const status = searchParams.get('status') || undefined

    const where: Record<string, unknown> = {}

    if (consumerId) where.consumerId = consumerId
    if (providerId) where.providerId = providerId
    if (listingId) where.listingId = listingId
    if (status) where.status = status

    const [items, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: {
          listing: {
            select: { id: true, title: true, category: true, price: true, images: true },
          },
          consumer: {
            select: { id: true, name: true, displayName: true, image: true },
          },
          provider: {
            select: { id: true, name: true, displayName: true, image: true },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      db.booking.count({ where }),
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
    console.error('[BOOKINGS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST /api/bookings — Create a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, consumerId, providerId, notes, priceCents, currency } =
      body

    if (!listingId || !consumerId || !providerId) {
      return NextResponse.json(
        { error: 'listingId, consumerId, and providerId are required' },
        { status: 400 }
      )
    }

    // Verify listing exists
    const listing = await db.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const booking = await db.booking.create({
      data: {
        listingId,
        consumerId,
        providerId,
        notes: notes || null,
        priceCents: priceCents ?? Math.round(listing.price * 100),
        currency: currency || listing.currency,
        status: 'PENDING',
      },
      include: {
        listing: {
          select: { id: true, title: true, category: true, price: true },
        },
        consumer: {
          select: { id: true, name: true, displayName: true },
        },
        provider: {
          select: { id: true, name: true, displayName: true },
        },
      },
    })

    return NextResponse.json({ data: booking }, { status: 201 })
  } catch (error) {
    console.error('[BOOKINGS_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
