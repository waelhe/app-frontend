import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/search — Search across listings and directory items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || undefined
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const size = Math.min(50, Math.max(1, Number(searchParams.get('size') || 10)))

    if (!query.trim()) {
      return NextResponse.json({
        data: { listings: [], directoryItems: [] },
        pagination: { page, size, total: 0, totalPages: 0 },
      })
    }

    // Build listing where clause
    const listingWhere: Record<string, unknown> = { status: 'ACTIVE' }
    if (category) listingWhere.category = category
    listingWhere.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { location: { contains: query } },
    ]

    // Build directory where clause
    const directoryWhere: Record<string, unknown> = { isActive: true }
    if (category) directoryWhere.category = category
    directoryWhere.OR = [
      { nameAr: { contains: query } },
      { nameEn: { contains: query } },
      { address: { contains: query } },
    ]

    const skip = (page - 1) * size

    const [listings, directoryItems, listingsTotal, directoryTotal] =
      await Promise.all([
        db.listing.findMany({
          where: listingWhere,
          include: {
            provider: {
              select: { id: true, name: true, displayName: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: size,
        }),
        db.directoryItem.findMany({
          where: directoryWhere,
          orderBy: { rating: 'desc' },
          skip,
          take: size,
        }),
        db.listing.count({ where: listingWhere }),
        db.directoryItem.count({ where: directoryWhere }),
      ])

    const total = listingsTotal + directoryTotal

    return NextResponse.json({
      data: { listings, directoryItems },
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    })
  } catch (error) {
    console.error('[SEARCH_GET]', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
