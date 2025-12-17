'use server';

import { moderateComment } from '@/ai/flows/moderate-comments';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addCommentSchema = z.object({
  postId: z.string(),
  parentId: z.string().optional(),
  content: z.string().min(1, 'Comment cannot be empty.'),
});

export async function addComment(input: unknown) {
  try {
    const { postId, parentId, content } = addCommentSchema.parse(input);

    const moderationResult = await moderateComment({ comment: content });

    if (moderationResult.isFlagged) {
      // In a real app, you would save the comment with a 'flagged' status.
      console.log('Comment flagged:', moderationResult.reason);
      return {
        success: false,
        message: `Your comment could not be posted. Reason: "${moderationResult.reason}"`,
      };
    }

    // In a real app, you would save the comment to your database here.
    console.log('Comment approved and would be saved to DB:', { postId, parentId, content });

    revalidatePath('/');
    return { success: true, message: 'Comment added successfully.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors.map(e => e.message).join(', ') };
    }
    console.error('Error adding comment:', error);
    return { success: false, message: 'An unexpected error occurred while posting your comment.' };
  }
}

export async function handleVote(itemId: string, itemType: 'post' | 'comment', voteType: 'up' | 'down' | null) {
  try {
    // In a real app, you would update the karma in your database here.
    console.log('Vote handled and would be saved to DB:', { itemId, itemType, voteType });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error handling vote:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
