import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

// GET /api/bookings/[id] — Get booking by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            currency: true,
            images: true,
          },
        },
        consumer: {
          select: { id: true, name: true, displayName: true, image: true },
        },
        provider: {
          select: { id: true, name: true, displayName: true, image: true, phone: true },
        },
        payment: true,
        review: {
          include: {
            reviewer: {
              select: { id: true, name: true, displayName: true },
            },
          },
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ data: booking })
  } catch (error) {
    console.error('[BOOKING_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] — Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await db.booking.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Validate status transitions
    const transitionErrors: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    }

    const allowed = transitionErrors[existing.status] || []
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${existing.status} to ${status}. Allowed: ${allowed.join(', ') || 'none'}`,
        },
        { status: 400 }
      )
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status },
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
        payment: true,
      },
    })

    return NextResponse.json({ data: booking })
  } catch (error) {
    console.error('[BOOKING_PUT]', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
