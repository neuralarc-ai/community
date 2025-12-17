import type { Post, User } from './types';

const users: Record<string, User> = {
  alex: { name: 'Alex', avatarUrl: 'https://picsum.photos/seed/1/40/40', karma: 1204 },
  ben: { name: 'Ben', avatarUrl: 'https://picsum.photos/seed/2/40/40', karma: 876 },
  casey: { name: 'Casey', avatarUrl: 'https://picsum.photos/seed/3/40/40', karma: 2345 },
  dana: { name: 'Dana', avatarUrl: 'https://picsum.photos/seed/4/40/40', karma: 543 },
};

const mainPost: Post = {
  id: '1',
  title: 'What are some "red flags" to look for in a software development job posting?',
  author: users.alex,
  timestamp: '8 hours ago',
  content: "I'm on the hunt for a new remote position and I'm trying to get better at filtering out potentially bad workplaces before I even apply. What are some subtle (or not-so-subtle) clues in a job description that might signal a toxic culture, unrealistic expectations, or a company that's just generally disorganized? Things like 'we're a family' or 'must be a rockstar ninja' are the obvious ones, but what else should I be wary of?",
  karma: 256,
  comments: [
    {
      id: 'c1',
      author: users.ben,
      timestamp: '7 hours ago',
      content: "A long list of required technologies for a junior role. If they expect an entry-level dev to know 15 different frameworks, they're either clueless or want to squeeze one person for the work of three.",
      karma: 122,
      replies: [
        {
          id: 'c1-1',
          author: users.casey,
          timestamp: '6 hours ago',
          content: "This. Also, when the 'responsibilities' section is a mile long but the 'what we offer' or 'compensation' section is vague or missing entirely. Big red flag.",
          karma: 78,
          replies: [],
        },
        {
          id: 'c1-2',
          author: users.alex,
          timestamp: '5 hours ago',
          content: "Good point. I saw one that listed 'expert in both React and Vue'. Why would anyone be an expert in both? Pick a lane!",
          karma: 45,
          replies: [
            {
              id: 'c1-2-1',
              author: users.dana,
              timestamp: '4 hours ago',
              content: "It usually means they're migrating from one to the other and want the new person to do all the work with no help. Been there, done that, got the t-shirt.",
              karma: 62,
              replies: [],
            }
          ],
        },
      ],
    },
    {
      id: 'c2',
      author: users.dana,
      timestamp: '6 hours ago',
      content: "Phrases like 'fast-paced environment' and 'ability to wear many hats'. It's code for 'we are understaffed and you will be overworked'.",
      karma: 95,
      replies: [],
    },
    {
      id: 'c3',
      author: users.casey,
      timestamp: '3 hours ago',
      content: "I'm always wary of 'unlimited PTO'. It often translates to 'no one ever takes a vacation and you'll be guilt-tripped if you do'. I prefer a company that specifies a generous, mandatory minimum vacation policy.",
      karma: 88,
      replies: [],
    },
  ],
};

// Simulate a database call
export async function getPost(id: string): Promise<Post> {
  if (id === '1') {
    return Promise.resolve(mainPost);
  }
  throw new Error('Post not found');
}
