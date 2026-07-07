import { Request, Response } from 'express';
import { db } from '../config/db';

export const sendMessage = async (req: Request, res: Response) => {
  const { receiverId, content, shopId } = req.body;
  const senderId = req.user?.id;

  if (!receiverId || !content || !content.trim()) {
    res.status(400).json({ error: 'Receiver ID and content are required' });
    return;
  }

  try {
    const result = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, shop_id, content) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [senderId, receiverId, shopId || null, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  const { otherUserId } = req.params;
  const currentUserId = req.user?.id;

  try {
    const result = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1) 
       ORDER BY created_at ASC`,
      [currentUserId, otherUserId]
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error retrieving chat history:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  const currentUserId = req.user?.id;

  try {
    // Advanced query to select distinct interlocutors with last message details and unread counts
    const result = await db.query(
      `SELECT u.id, u.name, u.avatar_url, u.role,
         (SELECT content FROM messages WHERE (sender_id = $1 AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = $1) ORDER BY created_at DESC LIMIT 1) as last_message,
         (SELECT created_at FROM messages WHERE (sender_id = $1 AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = $1) ORDER BY created_at DESC LIMIT 1) as last_message_time,
         (SELECT COUNT(*)::int FROM messages WHERE sender_id = u.id AND receiver_id = $1 AND is_read = false) as unread_count
       FROM users u
       WHERE u.id IN (
         SELECT DISTINCT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
       )`,
      [currentUserId]
    );

    // Resolve shop details for interlocutors who are boutique owners
    const conversations = [];
    for (const row of result.rows) {
      const shopResult = await db.query(
        `SELECT name, logo_url FROM shops WHERE owner_id = $1 AND status = 'approved'`,
        [row.id]
      );
      if (shopResult.rows.length > 0) {
        conversations.push({
          ...row,
          name: shopResult.rows[0].name,
          avatar_url: shopResult.rows[0].logo_url || row.avatar_url
        });
      } else {
        conversations.push(row);
      }
    }

    // Sort by last message time desc
    conversations.sort((a, b) => {
      const t1 = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
      const t2 = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
      return t2 - t1;
    });

    res.status(200).json(conversations);
  } catch (error: any) {
    console.error('Error retrieving conversations:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  const { otherUserId } = req.params;
  const currentUserId = req.user?.id;

  try {
    await db.query(
      `UPDATE messages SET is_read = true 
       WHERE receiver_id = $1 AND sender_id = $2`,
      [currentUserId, otherUserId]
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to update messages status' });
  }
};
