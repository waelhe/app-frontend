import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/messages — List conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const size = Math.min(100, Math.max(1, Number(searchParams.get('size') || 20)))

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const where = {
      participants: { some: { id: userId } },
    }

    const [conversations, total] = await Promise.all([
      db.conversation.findMany({
        where,
        include: {
          participants: {
            select: { id: true, name: true, displayName: true, image: true },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          booking: {
            select: {
              id: true,
              listing: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      db.conversation.count({ where }),
    ])

    // Count unread messages for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        })
        return { ...conv, unreadCount }
      })
    )

    return NextResponse.json({
      data: conversationsWithUnread,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    })
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST /api/messages — Create conversation or send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create-conversation') {
      const { participantIds, bookingId } = body

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 participantIds are required' },
          { status: 400 }
        )
      }

      // Check if conversation already exists for this booking
      if (bookingId) {
        const existing = await db.conversation.findUnique({
          where: { bookingId },
          include: {
            participants: {
              select: { id: true, name: true, displayName: true, image: true },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        })
        if (existing) {
          return NextResponse.json({ data: existing })
        }
      }

      const conversation = await db.conversation.create({
        data: {
          bookingId: bookingId || null,
          participants: {
            connect: participantIds.map((id: string) => ({ id })),
          },
        },
        include: {
          participants: {
            select: { id: true, name: true, displayName: true, image: true },
          },
        },
      })

      return NextResponse.json({ data: conversation }, { status: 201 })
    }

    if (action === 'send-message') {
      const { conversationId, senderId, content } = body

      if (!conversationId || !senderId || !content) {
        return NextResponse.json(
          { error: 'conversationId, senderId, and content are required' },
          { status: 400 }
        )
      }

      // Verify conversation exists
      const conv = await db.conversation.findUnique({
        where: { id: conversationId },
      })
      if (!conv) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }

      const message = await db.message.create({
        data: {
          conversationId,
          senderId,
          content,
        },
        include: {
          sender: {
            select: { id: true, name: true, displayName: true, image: true },
          },
        },
      })

      // Update conversation's updatedAt
      await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })

      return NextResponse.json({ data: message }, { status: 201 })
    }

    // Get messages for a conversation
    if (action === 'get-messages') {
      const { conversationId, page: msgPage, size: msgSize } = body
      const p = Math.max(1, Number(msgPage || 1))
      const s = Math.min(100, Math.max(1, Number(msgSize || 50)))

      if (!conversationId) {
        return NextResponse.json(
          { error: 'conversationId is required' },
          { status: 400 }
        )
      }

      const [messages, total] = await Promise.all([
        db.message.findMany({
          where: { conversationId },
          include: {
            sender: {
              select: { id: true, name: true, displayName: true, image: true },
            },
          },
          orderBy: { createdAt: 'asc' },
          skip: (p - 1) * s,
          take: s,
        }),
        db.message.count({ where: { conversationId } }),
      ])

      return NextResponse.json({
        data: messages,
        pagination: {
          page: p,
          size: s,
          total,
          totalPages: Math.ceil(total / s),
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use create-conversation, send-message, or get-messages' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return NextResponse.json(
      { error: 'Failed to process message request' },
      { status: 500 }
    )
  }
}
