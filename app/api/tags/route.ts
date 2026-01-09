import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/app/lib/supabaseServerClient";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get all unique tags from posts table
    const { data: posts, error } = await supabase
      .from("posts")
      .select("tags")
      .not("tags", "is", null);

    if (error) {
      console.error("Error fetching tags:", error);
      return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }

    // Flatten all tags and remove duplicates
    const allTags = posts.flatMap(post => post.tags || []);
    const uniqueTags = [...new Set(allTags)];

    // Filter tags based on query if provided
    const filteredTags = query
      ? uniqueTags.filter(tag =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
      : uniqueTags;

    // Sort and limit results
    const sortedTags = filteredTags.sort().slice(0, limit);

    return NextResponse.json({ tags: sortedTags });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}