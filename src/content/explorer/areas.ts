import type { AreaContent } from "@/explorer/types";

// SAMPLE CONTENT: replace with real tools, offers and answers.
// Listed in layer order, top (closest to the user) to bottom (storage).
export const AREAS: readonly AreaContent[] = [
  {
    id: "mobile",
    name: { en: "Mobile", es: "Móvil" },
    topic: { en: "mobile", es: "móvil" },
    pitch: {
      en: "Apps that feel native and keep working when the signal drops.",
      es: "Apps que se sienten nativas y siguen funcionando cuando se cae la señal.",
    },
    know: ["React Native", "Expo", "Swift", "Kotlin", "Offline sync", "Push notifications", "App Store & Play releases"],
    can: {
      en: ["Take an app from idea to both stores", "Fix an app that crashes or drains the battery", "Make a field app work with no connection"],
      es: ["Llevar una app de la idea a ambas tiendas", "Arreglar una app que se cierra o gasta la batería", "Hacer que una app de campo funcione sin conexión"],
    },
    twin: {
      en: {
        question: "Have you built apps that work offline?",
        answer: "Yes, that's most of my mobile work. On the field-service app, technicians were in basements with no signal, so everything was written to a local store first and synced when they got back online. If your users lose connection, I'd design for that on day one.",
      },
      es: {
        question: "¿Has hecho apps que funcionen sin conexión?",
        answer: "Sí, es la mayor parte de mi trabajo en móvil. En la app de servicio técnico los técnicos trabajaban en sótanos sin señal, así que todo se guardaba primero en el teléfono y se sincronizaba al volver la conexión. Si tus usuarios pierden señal, lo diseñaría así desde el primer día.",
      },
    },
  },
  {
    id: "full-stack",
    name: { en: "Full stack", es: "Full stack" },
    topic: { en: "full stack", es: "full stack" },
    pitch: {
      en: "Web products and APIs that still hold up after launch day.",
      es: "Productos web y APIs que siguen en pie después del lanzamiento.",
    },
    know: ["TypeScript", "React", "Next.js", "Node.js", "Python", "REST & GraphQL", "AWS", "Docker"],
    can: {
      en: ["Build an MVP your team can keep growing", "Untangle a slow or fragile backend", "Join your team on-site and ship with them"],
      es: ["Construir un MVP que tu equipo pueda seguir creciendo", "Desenredar un backend lento o frágil", "Unirme a tu equipo en sitio y entregar con ellos"],
    },
    twin: {
      en: {
        question: "What does a typical full stack project look like with you?",
        answer: "Usually I start on the backend, because that's where the hard decisions are: the data model and the API. Then I build the screens people actually use. On the logistics platform that meant an API holding 180 ms at peak and a booking flow the ops team could use without training.",
      },
      es: {
        question: "¿Cómo es un proyecto full stack contigo?",
        answer: "Normalmente empiezo por el backend, porque ahí están las decisiones difíciles: el modelo de datos y la API. Después construyo las pantallas que la gente usa de verdad. En la plataforma de logística eso fue una API que se mantenía en 180 ms en hora pico y un flujo de reservas que el equipo usó sin capacitación.",
      },
    },
  },
  {
    id: "agentic-ai",
    name: { en: "Agentic AI", es: "IA agéntica" },
    topic: { en: "agentic AI", es: "IA agéntica" },
    pitch: {
      en: "Agents that do real work inside your systems, with clear limits.",
      es: "Agentes que hacen trabajo real dentro de tus sistemas, con límites claros.",
    },
    know: ["Claude & OpenAI APIs", "Tool calling", "MCP", "RAG", "Evals", "LangGraph", "Prompt-injection defenses"],
    can: {
      en: ["Automate a repetitive workflow end to end", "Put an assistant on top of your own data", "Measure whether an agent is actually right"],
      es: ["Automatizar un flujo repetitivo de punta a punta", "Poner un asistente sobre tus propios datos", "Medir si un agente realmente acierta"],
    },
    twin: {
      en: {
        question: "How do you keep an AI agent from making things up?",
        answer: "Two ways. It only answers from data I give it, and it has to say when it doesn't know. Then I test it against real past cases before anyone relies on it. The support triage agent went live only after it matched our human labels on 500 old tickets.",
      },
      es: {
        question: "¿Cómo evitas que un agente de IA invente cosas?",
        answer: "De dos formas. Solo responde con los datos que le doy y tiene que decir cuando no sabe. Después lo pruebo contra casos reales antes de que alguien dependa de él. El agente de soporte salió a producción solo cuando coincidió con nuestras etiquetas humanas en 500 tickets viejos.",
      },
    },
  },
  {
    id: "data",
    name: { en: "Data engineering", es: "Ingeniería de datos" },
    topic: { en: "data engineering", es: "ingeniería de datos" },
    pitch: {
      en: "Pipelines that get the right numbers to the right people every morning.",
      es: "Pipelines que llevan los números correctos a las personas correctas cada mañana.",
    },
    know: ["Python", "SQL", "Airflow", "dbt", "Spark", "Kafka", "Snowflake", "BigQuery"],
    can: {
      en: ["Bring scattered data into one warehouse", "Replace manual spreadsheets with scheduled reports", "Stream events in near real time"],
      es: ["Reunir datos dispersos en un solo warehouse", "Reemplazar hojas de cálculo manuales con reportes programados", "Procesar eventos casi en tiempo real"],
    },
    twin: {
      en: {
        question: "Our reports take all night. Can you help?",
        answer: "Probably. On the retail warehouse, nightly reports went from 6 hours to 40 minutes, mostly by loading only what changed instead of everything. I'd start by looking at which steps take longest. It's usually two or three of them.",
      },
      es: {
        question: "Nuestros reportes tardan toda la noche. ¿Puedes ayudar?",
        answer: "Probablemente. En el warehouse de retail los reportes nocturnos pasaron de 6 horas a 40 minutos, sobre todo cargando solo lo que cambió en vez de todo. Empezaría por ver qué pasos tardan más. Casi siempre son dos o tres.",
      },
    },
  },
  {
    id: "databases",
    name: { en: "Databases", es: "Bases de datos" },
    topic: { en: "databases", es: "bases de datos" },
    pitch: {
      en: "Databases that stay fast, backed up and uneventful.",
      es: "Bases de datos rápidas, respaldadas y sin sorpresas.",
    },
    know: ["PostgreSQL", "SQL Server", "MySQL", "Oracle", "MongoDB", "Redis", "Query tuning", "Replication", "Backups"],
    can: {
      en: ["Find and fix the queries slowing you down", "Migrate to a new engine without downtime", "Set up backups you've actually tested restoring"],
      es: ["Encontrar y arreglar las consultas que te frenan", "Migrar a otro motor sin tiempo fuera de servicio", "Configurar respaldos que de verdad has probado restaurar"],
    },
    twin: {
      en: {
        question: "Can you migrate our database without downtime?",
        answer: "Yes. I've done it with 4 TB of clinic records. Replicate to the new server, check the two match, then switch over in minutes during a quiet hour. The part people skip is rehearsing the switch. I always do it at least twice.",
      },
      es: {
        question: "¿Puedes migrar nuestra base de datos sin tiempo fuera de servicio?",
        answer: "Sí. Lo he hecho con 4 TB de expedientes clínicos. Replicar al nuevo servidor, verificar que coinciden y cambiar en minutos en una hora tranquila. Lo que la gente se salta es ensayar el cambio. Yo siempre lo ensayo al menos dos veces.",
      },
    },
  },
];
