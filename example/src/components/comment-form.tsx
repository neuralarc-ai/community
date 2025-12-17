'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { addComment } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

const FormSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty.').max(10000, "Comment is too long."),
});

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ postId, parentId, onCommentAdded }: CommentFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const result = await addComment({
      postId,
      parentId,
      content: data.content,
    });

    if (result.success) {
      toast({
        title: 'Success!',
        description: 'Your comment has been posted.',
      });
      form.reset();
      onCommentAdded?.();
      // In a real app, revalidation would refresh the comment list.
      // For the demo, we just clear the form.
    } else {
      toast({
        variant: 'destructive',
        title: 'Error posting comment',
        description: result.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="What are your thoughts?"
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </Form>
  );
}
