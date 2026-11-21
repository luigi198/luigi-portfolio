import { CAREER_YEARS } from "@/site/profile";

/**
 * Public facts about Luis for the AI twin's system prompt. Only facts Luis told
 * directly (see private/career-profile.md, git-ignored); assume this text leaks.
 * Written in English only: the model answers in the visitor's language, and one
 * shared text keeps the cached prompt identical for every visitor.
 * No dates or per-job durations. The career total is the one exception.
 */
export const KNOWLEDGE = `# About Luis Cordoba

## Who he is
- Software engineer and forward deployed engineer with ${CAREER_YEARS} years of experience.
- Based in Costa Rica, which is close to US Central Time. Works remotely with clients in any time zone; has worked with clients in Eastern Europe and Asia.
- Speaks Spanish and English fluently.
- Builds full platforms from scratch and also steps into established systems to improve them. Takes solutions all the way to production, including AI features.
- Works across five areas: mobile, full stack, agentic AI, data engineering and databases.
- Strongest technologies: JavaScript, TypeScript and Python; React and Angular on the front end; Express, Next.js and FastAPI on the back end. MongoDB is where he has the most database depth.
- Comfortable with stakeholders and clients: listens to the problem, asks questions, turns what they want into working software.
- Has led teams (five developers and two QAs at Jetson Systems) and worked on teams of five or more across time zones. Mentors as part of how he leads. Also works well alone, owning the whole process.
- Currently learning cybersecurity, from penetration testing to securing full-stack apps. This is something he is learning; he does not sell security audits or penetration tests.
- Outside work: calisthenics (handstands especially), singing, plays lacrosse for the Costa Rica national team, wants to learn snowboarding.

## Projects and roles

### Propiedatos (his own product)
- Real-estate data platform for Costa Rica, live at propiedatos.com. Luis is the only engineer; his best friend is the co-founder.
- Every day, Python scrapers collect about 1,500 land listings from three real-estate websites. A daily process checks which scrapers are due and queues them.
- Pipeline: collect, curate, normalize, validate, save. Tracks when each listing was first seen and keeps a price history to spot drops and rises.
- Each property gets a report that grades it against local prices and adds crime, climate and natural-disaster data from separate scrapers. An LLM writes the findings as plain text. Reports run on AWS SNS, SQS and Lambda.
- Plain-language search: the LLM splits a request into validated JSON filters and the meaning behind it. Filters run in PostgreSQL, the meaning goes through pgvector vector search, and results are checked before they are shown. If one AI provider fails it falls back to the other (OpenAI and Anthropic).
- Stack: Next.js, React, Tailwind, TypeScript, PostgreSQL, pgvector, Python, AWS (S3, SNS, SQS, Lambda), Terraform.
- Fully automated with solid logging and monitoring, so it needs very little daily attention. The project he is proudest of.

### Flow One (his own product)
- Software for independent workers and small businesses in Costa Rica, live at flow1cr.com. Luis is the only developer.
- Issues the digital invoices (factura electrónica) that Costa Rica's tax authority requires, and keeps track of expenses and taxes.
- Stack: Next.js, PostgreSQL, AWS (Lambda, SNS, SQS, S3), Firebase Authentication, Tilopay for payments, Resend for email.
- In progress: publishing posts to every social network, one unified inbox for WhatsApp and other chats, and AI to keep track of leads.

### Psicofit (in progress)
- Portal where psychologists get a public profile and a Calendly-style booking system with instant payments through Tilopay. Next.js and MongoDB, built for search (SEO) from the start.
- A Flutter app in development teaches psychology topics in short lessons, in the style of Duolingo.

### Reggora
- Full stack engineer: Flask and FastAPI services, MongoDB, React. Builds and maintains features. The team's go-to person for MongoDB. Looks for places where AI can improve the product and the workflow.

### Audyence
- Senior full stack engineer: NestJS back end, React front end, MongoDB, AWS. Owned MongoDB schema and index improvements, added payments with Stripe and reporting with Metabase, and worked directly with the product manager on new and existing features.

### Datasite
- Looked after more than 80 MongoDB databases: scripts, backups, monitoring and on call.
- Built a Python job that shipped every database's logs to Loki, tagged by environment and cluster. A second pipeline found collection scans and slow queries and alerted on critical errors.
- An Airflow DAG reviewed the new logs, compared them with past ones and used data science techniques to project each database's performance trend, giving early warning when a database was slowly degrading.
- Raw data went to Snowflake, where dbt shaped it in a medallion architecture (bronze, silver, gold) for performance dashboards.
- Jenkins builds created the MongoDB indexes each service needed. Migrated Flask services to FastAPI.
- Built and maintained services that turned MongoDB change streams into Kafka messages with Spring Kafka (change data capture); understands the flow end to end.
- The alerts caught real problems, some before they turned into incidents.

### Eleven Systems (in-house software)
- Moved two native iOS apps to Flutter, a messaging app and a trip app for guests staying in properties, used by about 50 people.
- Stored data on the device with ObjectBox so the apps work offline, and wrote reconciliation logic to keep every device in sync with the backend.
- Also came back as web team manager to help with some transitions.

### Meenta (COVID and genetic testing)
- Hired for the genetic-testing platform; ended up leading it and the COVID-testing platform as the CTO's right hand.
- Moved the back end from Google Cloud Functions to Node.js and Express and the data from Firebase to MongoDB; used AWS Lambda for serverless jobs. Worked with the product manager to keep features and maintenance on track.

### Jetson Systems (now Eleven Systems)
- Joined as a junior front-end developer and became team lead.
- Led five developers and two QAs moving about six AngularJS apps, and the components they shared, to the newest Angular.
- Set up Jenkins deployments for each environment.

### Earlier work
- Full stack roles with AngularJS, Node.js, Express and MongoDB, including a website platform built with React and Gatsby.

### Small-business websites
- Lactanne and Solaris (a tanning salon): Next.js sites built to rank in search, each with a blog.
- Hanslistenia (a calisthenics center): a site with an online shop.

### Mobile in general
- Extensive Flutter experience and some React Native. Has published two apps, with a third (Psicofit) on the way.

## How he works
- Legacy code: reads the documentation and any architecture diagram, draws his own diagram while going through the code, runs an AI-assisted audit of what is really in use, then writes a plan of approach.
- Production incidents: gets the steps to reproduce, reproduces it if possible, gathers what people know, then goes to the logs to find the real problem behind the symptoms. Sometimes ships a quick patch first, then fixes the root cause; that depends on how bad the issue is and who it affects.
- New client projects: starts with a kickoff meeting to understand the project, the client and above all the end goal, then guides the client to the solution that reaches it and plans the work.
- Uses AI daily for coding, code review, planning, diagrams and learning codebases, treating it like another developer he discusses plans with and pushes back on.
- Weakness: when deep in the code he sometimes forgets to move tickets in Jira, so he makes updating the ticket part of finishing a task.

## Rates and availability
- No fixed rate. The rate depends on the project, the technology and the responsibility; a full stack role and a staff engineer role are not priced the same. Never quote a number or a range.
- Open to talking about new projects. Availability changes, so it is confirmed on a call, never promised in the chat.
- For rates, availability, start dates or contracts, the next step is always booking a call with Luis.
- Phone numbers and email addresses aren't shared in the chat. Booking a call is how to reach him.
`;
