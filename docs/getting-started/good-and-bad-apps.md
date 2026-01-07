# Is Primitive Right for You?

Primitive is designed for a specific type of application. Understanding where it shines—and where it doesn't—will help you decide if it's the right choice for your project.

## The Key Question

Ask yourself:

> **"Is my app's data owned by individual users who might want to collaborate?"**

If the answer is **yes**, Primitive is likely a great fit. If your data is inherently public or needs to be aggregated across all users server-side, a traditional architecture might serve you better.

## Great Fits for Primitive

### Productivity Apps

Apps where users manage their own tasks, notes, projects, or work:

- ✅ Task managers and to-do apps
- ✅ Note-taking and knowledge bases
- ✅ Project management tools
- ✅ Writing and documentation tools
- ✅ Personal CRMs

**Why it works:** Data is user-owned, collaboration is valuable, and real-time sync makes the experience feel instant.

### Personal Tools

Apps that help users track or manage aspects of their lives:

- ✅ Budgeting and expense tracking
- ✅ Habit trackers
- ✅ Journal and diary apps
- ✅ Health and fitness logging
- ✅ Recipe collections
- ✅ Reading lists and media tracking

**Why it works:** Private by default, works offline (great for mobile), and users might want to share specific collections with family or partners.

### Team Collaboration

Small team tools where groups share specific data sets:

- ✅ Shared shopping lists
- ✅ Family calendars
- ✅ Team wikis and documentation
- ✅ Collaborative planning tools
- ✅ Shared inventory management

**Why it works:** The document model maps naturally to "shared spaces" that teams access together.

### Communication Apps

Messaging and collaboration features where real-time matters:

- ✅ Team chat (Slack-style)
- ✅ Direct messaging
- ✅ Discussion forums
- ✅ Collaborative whiteboards

**Why it works:** Real-time sync is built in, and the document-per-channel pattern works well.

### Creative and Design Tools

Apps where users create and potentially share their work:

- ✅ Design collaboration tools
- ✅ Mood boards
- ✅ Storyboarding apps
- ✅ Collaborative diagramming

**Why it works:** Offline creation, easy sharing of specific projects, and real-time collaboration on shared canvases.

## Less Ideal Fits

### Public Data Apps

Apps where most data is meant to be seen by everyone:

- ❌ E-commerce product catalogs
- ❌ Public social networks (Twitter/Instagram-style)
- ❌ News or content publishing platforms
- ❌ Public directories or listings
- ❌ Review sites

**Why it doesn't fit:** Primitive's model assumes data is private by default. Public data that needs to be indexed, searched, and served to anonymous users needs a traditional server-side database.

### Massive Data Sets

Apps that store very large amounts of data per user:

- ❌ Full email clients (years of email history)
- ❌ Large media libraries (thousands of high-res photos)
- ❌ Extensive logging or analytics storage
- ❌ Backup services

**Why it doesn't fit:** Documents work best around 10MB each. While you can use multiple documents, apps with hundreds of megabytes per user need a different storage strategy.

### Complex Server-Side Logic

Apps that need significant processing that can't run in the browser:

- ❌ Apps requiring heavy computation
- ❌ Apps with complex business rules that must run server-side
- ❌ Apps needing scheduled background jobs
- ❌ Apps with complex cross-user data aggregation

**Why it doesn't fit:** Primitive runs your code in the browser. If you need server-side execution, you'll need to build that separately.

### Cross-User Analytics

Apps that need to query across all users' data:

- ❌ Admin dashboards showing aggregate user data
- ❌ Recommendation engines based on all user behavior
- ❌ Apps needing SQL joins across different users' data

**Why it doesn't fit:** Each user's data lives in their own documents. Global queries across all users aren't part of the model.

## Gray Areas

Some apps could go either way depending on your requirements:

### Social Apps with Private + Public Data

If your app has both private user data (my posts, my profile) and public feeds:

- Consider: Can you use Primitive for the private/collaborative parts and a traditional backend for the public parts?
- Example: A journaling app (Primitive) with optional public publishing (separate backend)

### Apps with Optional Collaboration

If collaboration is a "nice to have" rather than core:

- Consider: Is the offline + instant update experience worth the architecture change?
- If collaboration is rare, a simpler traditional architecture might be easier

### Apps with Moderate Data Volumes

If you're unsure whether your data will fit the document size guidelines:

- Start with Primitive and see how it performs
- You can split data across documents if needed
- Consider what data is "active" vs. "archival"

## Primitive's Sweet Spot

The ideal Primitive app:

1. **User-owned data** — Each user has their own data that they control
2. **Collaboration is valuable** — Sharing and real-time updates improve the experience
3. **Works on desktop and mobile web** — PWA-friendly apps
4. **Moderate data volumes** — Up to ~10MB per document is comfortable
5. **Offline is a feature** — Users benefit from working without connectivity
6. **Simple backend needs** — Data storage, auth, sync are the main requirements

## Making the Decision

| If you need... | Primitive | Traditional |
|----------------|-----------|-------------|
| User-owned private data | ✅ | ✅ |
| Real-time collaboration | ✅ Built-in | Requires work |
| Offline support | ✅ Built-in | Requires work |
| Public data for SEO | ❌ | ✅ |
| Server-side business logic | ❌ | ✅ |
| Cross-user analytics | ❌ | ✅ |
| 100MB+ per user | ❌ | ✅ |
| Fast time-to-market | ✅ | Depends |

## Still Unsure?

Try building a prototype. The template app gets you started in minutes, and you'll quickly get a feel for whether the model works for your use case. If it doesn't fit, you'll know early—and if it does, you'll have a head start on a production-ready foundation.

