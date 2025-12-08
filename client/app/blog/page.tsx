import { Calendar, ArrowRight } from "lucide-react"

const posts = [
  {
    id: 1,
    title: "10 Tips for Finding Your Perfect Apartment",
    excerpt: "Learn expert strategies to narrow down your search and find an apartment that meets all your needs.",
    author: "Sarah Johnson",
    date: "Dec 15, 2024",
    category: "Guide",
  },
  {
    id: 2,
    title: "Understanding Rental Agreements",
    excerpt: "A comprehensive guide to what you should look for in rental agreements and tenant rights.",
    author: "Mike Chen",
    date: "Dec 10, 2024",
    category: "Legal",
  },
  {
    id: 3,
    title: "Best Neighborhoods in 2025",
    excerpt: "Explore the most sought-after neighborhoods and what makes them great places to live.",
    author: "Emma Davis",
    date: "Dec 5, 2024",
    category: "Lifestyle",
  },
  {
    id: 4,
    title: "Preparing for a Rental Application",
    excerpt: "Get ready for your rental application with our complete checklist and preparation guide.",
    author: "Alex Rodriguez",
    date: "Nov 28, 2024",
    category: "Tips",
  },
  {
    id: 5,
    title: "Moving Day Checklist",
    excerpt: "Ensure a smooth move with our comprehensive moving day checklist and timeline.",
    author: "Jordan Smith",
    date: "Nov 20, 2024",
    category: "Guide",
  },
  {
    id: 6,
    title: "Virtual Tours: What to Look For",
    excerpt: "Make the most of virtual property tours with our expert tips and what to check.",
    author: "Casey Martinez",
    date: "Nov 15, 2024",
    category: "Technology",
  },
]

export default function Blog() {
  return (
    <>
        <section className="py-20 md:py-28 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">PropertyHub Blog</h1>
            <p className="text-lg text-muted-foreground">
              Expert tips, guides, and insights for renters and property seekers.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="bg-primary/10 h-48 flex items-center justify-center">
                    <img
                      src={`/blog-.jpg?height=192&width=400&query=blog-${post.id}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold cursor-pointer hover:gap-3 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
    </>
  )
}
