'use server';
/**
 * @fileOverview AI-powered comment moderation flow.
 *
 * - moderateComment - A function that moderates a comment and flags it if it's inappropriate.
 * - ModerateCommentInput - The input type for the moderateComment function.
 * - ModerateCommentOutput - The return type for the moderateComment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateCommentInputSchema = z.object({
  comment: z.string().describe('The comment to be moderated.'),
  userReports: z
    .number()
    .describe('The number of user reports the comment has received.')
    .optional(),
});
export type ModerateCommentInput = z.infer<typeof ModerateCommentInputSchema>;

const ModerateCommentOutputSchema = z.object({
  isFlagged: z.boolean().describe('Whether the comment is flagged as inappropriate.'),
  reason: z.string().describe('The reason for flagging the comment, if applicable.'),
});
export type ModerateCommentOutput = z.infer<typeof ModerateCommentOutputSchema>;

export async function moderateComment(input: ModerateCommentInput): Promise<ModerateCommentOutput> {
  return moderateCommentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateCommentPrompt',
  input: {schema: ModerateCommentInputSchema},
  output: {schema: ModerateCommentOutputSchema},
  prompt: `You are a moderator AI that flags inappropriate comments based on keywords, sentiment, and user reports.

  Comment: {{{comment}}}
  User Reports: {{#if userReports}}{{{userReports}}}{{else}}0{{/if}}

  Analyze the comment and determine if it violates any community guidelines, considering the number of user reports.

  Respond with a JSON object indicating whether the comment should be flagged and the reason.
  If userReports are more than 3, flag automatically without analysing the comment.
  `,
});

const moderateCommentFlow = ai.defineFlow(
  {
    name: 'moderateCommentFlow',
    inputSchema: ModerateCommentInputSchema,
    outputSchema: ModerateCommentOutputSchema,
  },
  async input => {
    if ((input.userReports ?? 0) > 3) {
      return {
        isFlagged: true,
        reason: 'Flagged automatically due to a high number of user reports.',
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
