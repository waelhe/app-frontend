import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/emergency — List emergency contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined

    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = category

    const contacts = await db.emergencyContact.findMany({
      where,
      orderBy: [{ is24Hours: 'desc' }, { nameEn: 'asc' }],
    })

    return NextResponse.json({ data: contacts })
  } catch (error) {
    console.error('[EMERGENCY_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch emergency contacts' },
      { status: 500 }
    )
  }
}
