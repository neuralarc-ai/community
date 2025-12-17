import { getPost } from "@/lib/data";
import { MainPost } from "@/components/main-post";
import { CommentThread } from "@/components/comment-thread";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "@/components/comment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const post = await getPost("1"); // Fetch the mock post

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <MainPost post={post} />
      
      <Card className="mb-6 shadow-sm">
        <CardHeader>
            <p className="text-lg font-semibold leading-none tracking-tight">Add a comment</p>
        </CardHeader>
        <CardContent>
            <CommentForm postId={post.id} />
        </CardContent>
      </Card>
      
      <Separator className="my-6" />

      <h2 className="text-xl font-bold mb-4">Comments</h2>
      <CommentThread comments={post.comments} postId={post.id} />
    </div>
  );
}
