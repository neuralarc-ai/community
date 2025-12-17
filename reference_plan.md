# Reference Plan: UI Theme and Threaded Comments

## Goal
Replicate the example UI (centered, card-based, clean theme) and implement the exact threaded comment structure.

## 1. Comment Thread UI (`app/components/CommentItem.tsx`)
Match `example/src/components/comment.tsx` structure:
- **Container:** `div.flex.gap-3.relative`
- **Thread Line:** `div.w-px.absolute.left-4.top-10.h-[calc(100%-2.5rem)].bg-border` (with hover effect)
- **Avatar:** `div.flex.flex-col.items-center.z-10` -> `Avatar`
- **Content:** `div.flex-grow`
  - Header: `u/Username` + `Time`
  - Body: `p`
  - Footer: `VoteButtons` + `Reply Button`
  - Reply Form: `AnimatePresence` + `motion.div` (optional, or just conditional rendering)
  - Nested Replies: `div.mt-4.space-y-6` containing mapped children.

*Note:* The current recursive `CommentTree` structure in `app/components/CommentItem.tsx` calling `CommentTree` again is slightly different from the example which calls `Comment` directly. The example's `Comment` component handles its own children mapping. I should align `CommentItem` to handle its own children mapping if possible, or adjust `CommentTree` to just be a wrapper.
However, sticking to `CommentTree` -> `CommentItem` -> `CommentTree` is fine as long as the *visual markup* matches.
Crucially, the example uses:
```tsx
{comment.replies && comment.replies.length > 0 && (
  <div className="mt-4 space-y-6">
    {comment.replies.map((reply) => (
      <Comment key={reply.id} comment={reply} postId={postId} />
    ))}
  </div>
)}
```
I should check if `CommentItem` recursively renders `CommentTree` or if it should map children directly.
Currently `CommentItem` renders `CommentTree` for children. I will adjust the styling of that container to `mt-4 space-y-6`.

## 2. Post List Page (`app/(protected)/posts/page.tsx`)
Update to match the clean theme:
- **Background:** `bg-background` (not `#DAE0E6`)
- **Container:** `max-w-4xl` centered (or `max-w-2xl` for tighter focus if preferred, but user said "same ui everywhere" implying the example which uses `max-w-4xl`).
- **Create Post Bar:** Style as a card with `shadow-sm` and clean input, similar to the updated `[id]/page.tsx` or `example`'s style.
- **Post Item List:** Ensure `PostItem` looks good in the list context (it was updated previously, just need to check margins).

## 3. Consistency
- Ensure `app/globals.css` (already updated) is being used effectively.
- Check `VoteButton` consistency.

## Execution Order
1. Update `app/components/CommentItem.tsx` to exactly match the markup of the example.
2. Update `app/(protected)/posts/page.tsx` to match the clean theme of `app/(protected)/posts/[id]/page.tsx`.

