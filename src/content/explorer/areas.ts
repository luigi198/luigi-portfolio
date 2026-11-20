import type { AreaContent } from "@/explorer/types";

// Real tools, offers and answers, from private/career-profile.md (git-ignored).
// Listed in layer order, top (closest to the user) to bottom (storage).
export const AREAS: readonly AreaContent[] = [
  {
    id: "mobile",
    name: { en: "Mobile", es: "Móvil" },
    topic: { en: "mobile", es: "móvil" },
    pitch: {
      en: "Apps that keep working offline and stay in sync with your backend.",
      es: "Apps que siguen funcionando sin conexión y se mantienen sincronizadas con su backend.",
    },
    know: ["Flutter", "Dart", "Native iOS", "ObjectBox", "Offline sync", "Data reconciliation"],
    can: {
      en: ["Rebuild a native app in Flutter for iOS and Android", "Make an app work offline and sync safely", "Build a learning or booking app"],
      es: ["Rehacer una app nativa en Flutter para iOS y Android", "Hacer que una app funcione sin conexión y sincronice bien", "Construir una app de aprendizaje o de citas"],
    },
    twin: {
      en: {
        question: "Have you built apps that work offline?",
        answer: "Yes. At Eleven Systems I moved two native iOS apps to Flutter, a messaging app and a trip app for guests staying in properties. Data lived on the device with ObjectBox, and I wrote reconciliation logic to sync it with the backend, so every device ended up with the same data.",
      },
      es: {
        question: "¿Ha hecho apps que funcionen sin conexión?",
        answer: "Sí. En Eleven Systems pasé dos apps nativas de iOS a Flutter, una de mensajería y otra de viajes para huéspedes en propiedades. Los datos vivían en el dispositivo con ObjectBox, y escribí la lógica de reconciliación para sincronizarlos con el backend, así todos los dispositivos terminaban con los mismos datos.",
      },
    },
  },
  {
    id: "full-stack",
    name: { en: "Full stack", es: "Full stack" },
    topic: { en: "full stack", es: "full stack" },
    pitch: {
      en: "Products built end to end, from the database to the screen.",
      es: "Productos construidos de punta a punta, de la base de datos a la pantalla.",
    },
    know: ["TypeScript", "React", "Next.js", "Tailwind", "Node.js", "NestJS", "Flask", "FastAPI", "Angular", "Vue", "AWS", "Terraform", "Stripe"],
    can: {
      en: ["Build a product end to end, database to UI", "Modernize a legacy app without stopping the business", "Ship a site built for search, with a blog or a shop"],
      es: ["Construir un producto de punta a punta, de la base de datos a la interfaz", "Modernizar una app vieja sin detener el negocio", "Lanzar un sitio hecho para buscadores, con blog o tienda"],
    },
    twin: {
      en: {
        question: "Can you modernize an old app?",
        answer: "I've done it a few times. At Jetson Systems I led five developers and two QAs moving about six AngularJS apps to the newest Angular, including the components they shared. At Meenta we moved from Google Cloud Functions to Node.js and from Firebase to MongoDB while the platform kept running.",
      },
      es: {
        question: "¿Puede modernizar una app vieja?",
        answer: "Lo he hecho varias veces. En Jetson Systems lideré a cinco desarrolladores y dos QA para pasar unas seis apps de AngularJS al Angular más reciente, incluidos los componentes que compartían. En Meenta pasamos de Google Cloud Functions a Node.js y de Firebase a MongoDB sin detener la plataforma.",
      },
    },
  },
  {
    id: "agentic-ai",
    name: { en: "Agentic AI", es: "IA agéntica" },
    topic: { en: "agentic AI", es: "IA agéntica" },
    pitch: {
      en: "AI that searches and writes from your real data, with checks around it.",
      es: "IA que busca y redacta con sus datos reales, con controles alrededor.",
    },
    know: ["OpenAI & Anthropic APIs", "Tool orchestration", "RAG", "pgvector", "Embeddings", "Structured JSON output", "Provider fallback", "LLM observability"],
    can: {
      en: ["Add plain-language search over your own data", "Generate reports an AI writes from real numbers", "Make AI features reliable, with fallbacks, logs and cost tracking"],
      es: ["Agregar búsqueda en lenguaje natural sobre sus datos", "Generar reportes que una IA redacta con números reales", "Hacer confiables las funciones de IA, con respaldos, logs y control de costos"],
    },
    twin: {
      en: {
        question: "How does the search on Propiedatos work?",
        answer: "You type what you want in your own words, say a lot near the beach under a certain price. The LLM splits that into hard filters, as validated JSON, and the meaning behind the request. Filters run in PostgreSQL, the meaning goes through pgvector, and the results are checked before you see them. If one AI provider fails, it falls back to the other.",
      },
      es: {
        question: "¿Cómo funciona la búsqueda de Propiedatos?",
        answer: "Usted escribe lo que busca con sus palabras, por ejemplo un lote cerca de la playa por debajo de cierto precio. El LLM lo separa en filtros concretos, como JSON validado, y en la intención detrás de la búsqueda. Los filtros corren en PostgreSQL, la intención pasa por pgvector y los resultados se revisan antes de mostrarlos. Si un proveedor de IA falla, usa el otro.",
      },
    },
  },
  {
    id: "data",
    name: { en: "Data engineering", es: "Ingeniería de datos" },
    topic: { en: "data engineering", es: "ingeniería de datos" },
    pitch: {
      en: "Pipelines that collect, clean and watch your data every day.",
      es: "Pipelines que recogen, limpian y vigilan sus datos todos los días.",
    },
    know: ["Python", "Web scraping", "asyncio", "Airflow", "dbt", "Snowflake", "Kafka", "MongoDB change streams", "Spring Kafka", "Loki", "AWS Lambda, SQS & SNS", "Medallion architecture"],
    can: {
      en: ["Collect data from websites every day and keep it clean", "Stream database changes to other services with Kafka", "Turn raw logs into dashboards and alerts", "Build pipelines that warn you before something breaks"],
      es: ["Recoger datos de sitios web cada día y mantenerlos limpios", "Enviar los cambios de la base de datos a otros servicios con Kafka", "Convertir logs crudos en dashboards y alertas", "Construir pipelines que avisan antes de que algo falle"],
    },
    twin: {
      en: {
        question: "What kind of data pipelines have you built?",
        answer: "At Datasite I built one that pulled the logs from more than 80 MongoDB databases into Loki, tagged by environment and cluster. A second step looked for slow queries and collection scans and alerted on critical errors. Airflow ran the checks, and dbt shaped the data in Snowflake for dashboards. It caught real problems, some before they turned into incidents.",
      },
      es: {
        question: "¿Qué tipo de pipelines de datos ha construido?",
        answer: "En Datasite construí uno que llevaba los logs de más de 80 bases MongoDB a Loki, etiquetados por ambiente y clúster. Un segundo paso buscaba consultas lentas y collection scans y alertaba sobre errores críticos. Airflow ejecutaba las revisiones y dbt organizaba los datos en Snowflake para los dashboards. Detectó problemas reales, algunos antes de que se volvieran incidentes.",
      },
    },
  },
  {
    id: "databases",
    name: { en: "Databases", es: "Bases de datos" },
    topic: { en: "databases", es: "bases de datos" },
    pitch: {
      en: "Databases that stay fast, backed up and watched.",
      es: "Bases de datos rápidas, respaldadas y vigiladas.",
    },
    know: ["MongoDB", "PostgreSQL", "pgvector", "MySQL", "Snowflake", "Indexing", "Query tuning", "Backups", "Monitoring & on-call"],
    can: {
      en: ["Find slow queries and missing indexes before they hurt", "Move data between databases, like Firebase to MongoDB", "Set up backups, monitoring and alerts"],
      es: ["Encontrar consultas lentas e índices faltantes antes de que duelan", "Mover datos entre bases, como de Firebase a MongoDB", "Configurar respaldos, monitoreo y alertas"],
    },
    twin: {
      en: {
        question: "Can you help with a slow MongoDB?",
        answer: "That's where I have the most experience. At Datasite I looked after more than 80 MongoDB databases and was on call for them. I tracked collection scans and slow queries from the logs, and Jenkins builds created the indexes each service needed. At Audyence and Reggora I'm usually the person the team asks about schemas and indexes.",
      },
      es: {
        question: "¿Puede ayudar con un MongoDB lento?",
        answer: "Es donde tengo más experiencia. En Datasite me encargué de más de 80 bases MongoDB y estuve de guardia para ellas. Seguía los collection scans y las consultas lentas desde los logs, y los builds de Jenkins creaban los índices que cada servicio necesitaba. En Audyence y en Reggora suelo ser a quien el equipo le pregunta por esquemas e índices.",
      },
    },
  },
];
