import type { ProjectContent } from "@/explorer/types";

// Real projects, from private/career-profile.md (git-ignored). Listed in the
// order to show them in; the map re-sorts by how many areas each one used.
// No dates or durations, ever.
export const PROJECTS: readonly ProjectContent[] = [
  {
    id: "propiedatos",
    areas: ["agentic-ai", "full-stack", "data", "databases"],
    title: { en: "Propiedatos", es: "Propiedatos" },
    client: { en: "My own product", es: "Producto propio" },
    metric: {
      en: "About 1,500 land listings from 3 websites, refreshed every day",
      es: "Unos 1,500 lotes de 3 sitios web, actualizados cada día",
    },
    story: {
      en: "A real-estate data platform for Costa Rica where I'm the only engineer. Python scrapers collect land listings every day, and the data is cleaned, validated and tracked over time, including price changes and how long each listing has been up. Each property gets a report that grades it against local prices and adds crime, climate and natural-disaster data, written up by an LLM. Visitors search in plain language, powered by vector search on pgvector.",
      es: "Una plataforma de datos inmobiliarios para Costa Rica en la que soy el único ingeniero. Scrapers en Python recogen lotes cada día, y los datos se limpian, se validan y se siguen en el tiempo, incluidos los cambios de precio y cuánto lleva publicado cada lote. Cada propiedad tiene un reporte que la califica frente a los precios de la zona y suma datos de crimen, clima y desastres naturales, redactado por un LLM. La búsqueda funciona en lenguaje natural, con búsqueda vectorial en pgvector.",
    },
    links: ["https://www.propiedatos.com"],
  },
  {
    id: "psicofit",
    areas: ["mobile", "full-stack", "databases"],
    title: { en: "Psicofit", es: "Psicofit" },
    client: { en: "Platform for psychologists, in progress", es: "Plataforma para psicólogos, en desarrollo" },
    metric: {
      en: "Profiles, online booking and instant payments in one portal",
      es: "Perfiles, citas en línea y pagos inmediatos en un solo portal",
    },
    story: {
      en: "Psychologists get a public profile and a booking system like Calendly, with instant payments through Tilopay. Built with Next.js and MongoDB, with SEO from the start. A Flutter app is in development that teaches psychology topics in short lessons, in the style of Duolingo.",
      es: "Los psicólogos tienen un perfil público y un sistema de citas al estilo de Calendly, con pagos inmediatos por Tilopay. Hecho con Next.js y MongoDB, con SEO desde el inicio. Está en desarrollo una app en Flutter que enseña temas de psicología en lecciones cortas, al estilo de Duolingo.",
    },
  },
  {
    id: "guest-apps",
    areas: ["mobile", "full-stack", "databases"],
    title: { en: "Offline-first guest apps", es: "Apps para huéspedes sin conexión" },
    client: { en: "Eleven Systems, in-house software", es: "Eleven Systems, software interno" },
    metric: {
      en: "2 native iOS apps rebuilt in Flutter for about 50 users",
      es: "2 apps nativas de iOS rehechas en Flutter para unos 50 usuarios",
    },
    story: {
      en: "A messaging app and a trip app for guests staying in properties. I moved both from native iOS to Flutter, stored data on the device with ObjectBox so they work offline, and wrote reconciliation logic that keeps every device in sync with the backend.",
      es: "Una app de mensajería y una app de viajes para huéspedes en propiedades. Pasé ambas de iOS nativo a Flutter, guardé los datos en el dispositivo con ObjectBox para que funcionen sin conexión y escribí la lógica de reconciliación que mantiene cada dispositivo sincronizado con el backend.",
    },
  },
  {
    id: "db-observability",
    areas: ["data", "databases"],
    title: { en: "Database observability", es: "Observabilidad de bases de datos" },
    client: { en: "Datasite, 80+ MongoDB databases", es: "Datasite, más de 80 bases MongoDB" },
    metric: {
      en: "Caught slow queries and collection scans before they became incidents",
      es: "Detectó consultas lentas y collection scans antes de que se volvieran incidentes",
    },
    story: {
      en: "I looked after more than 80 MongoDB databases, including backups and on-call. I built a Python job that shipped every database's logs to Loki, tagged by environment and cluster, then a pipeline that found collection scans and slow queries and alerted on critical errors. Airflow ran the checks, and the raw data went to Snowflake, where dbt shaped it in a medallion architecture for performance dashboards. Jenkins builds also created the indexes each service needed, and I built and maintained services that turned MongoDB change streams into Kafka messages with Spring Kafka.",
      es: "Me encargué de más de 80 bases de datos MongoDB, incluidos respaldos y guardias. Construí un proceso en Python que enviaba los logs de cada base a Loki, etiquetados por ambiente y clúster, y luego un pipeline que encontraba collection scans y consultas lentas y alertaba sobre errores críticos. Airflow ejecutaba las revisiones y los datos crudos iban a Snowflake, donde dbt los organizaba en una arquitectura medallion para dashboards de rendimiento. Los builds de Jenkins también creaban los índices que cada servicio necesitaba, y construí y mantuve servicios que convertían los change streams de MongoDB en mensajes de Kafka con Spring Kafka.",
    },
  },
  {
    id: "meenta",
    areas: ["full-stack", "databases"],
    title: { en: "Health-testing platforms", es: "Plataformas de pruebas de salud" },
    client: { en: "Meenta, COVID and genetic testing", es: "Meenta, pruebas de COVID y genéticas" },
    metric: {
      en: "Led both platforms as the CTO's right hand",
      es: "Lideré ambas plataformas como mano derecha del CTO",
    },
    story: {
      en: "Hired for the genetic-testing platform, I ended up leading it and the COVID-testing platform. We moved the backend from Google Cloud Functions to Node.js and Express and the data from Firebase to MongoDB, and used AWS Lambda for serverless jobs. I worked with the PM to keep new features and maintenance on track.",
      es: "Me contrataron para la plataforma de pruebas genéticas y terminé liderándola junto con la de pruebas de COVID. Pasamos el backend de Google Cloud Functions a Node.js y Express y los datos de Firebase a MongoDB, y usamos AWS Lambda para tareas serverless. Trabajé con el PM para mantener al día las nuevas funciones y el mantenimiento.",
    },
  },
  {
    id: "audyence",
    areas: ["full-stack", "databases"],
    title: { en: "Audyence", es: "Audyence" },
    client: { en: "Senior full stack engineer", es: "Ingeniero full stack sénior" },
    metric: {
      en: "Redesigned MongoDB schemas and indexes, and shipped payments and reporting",
      es: "Rediseñé esquemas e índices de MongoDB, y entregué pagos y reportes",
    },
    story: {
      en: "Full stack work on a NestJS and React product running on AWS. I owned the MongoDB schema and index improvements, added payments with Stripe and reporting with Metabase, and worked directly with the PM on new features and improvements.",
      es: "Trabajo full stack en un producto con NestJS y React sobre AWS. Me encargué de mejorar los esquemas e índices de MongoDB, agregué pagos con Stripe y reportes con Metabase, y trabajé directamente con el PM en nuevas funciones y mejoras.",
    },
  },
  {
    id: "angular",
    areas: ["full-stack"],
    title: { en: "Angular modernization", es: "Modernización a Angular" },
    client: { en: "Jetson Systems, now Eleven Systems", es: "Jetson Systems, hoy Eleven Systems" },
    metric: {
      en: "Led 5 developers and 2 QAs moving about 6 apps to modern Angular",
      es: "Lideré a 5 desarrolladores y 2 QA para pasar unas 6 apps a Angular moderno",
    },
    story: {
      en: "I joined as a junior front-end developer and became team lead. We had about six AngularJS apps sharing components, and I led their move to the newest Angular, shared components included. I also set up the Jenkins deployments for each environment.",
      es: "Entré como desarrollador front-end junior y llegué a líder del equipo. Teníamos unas seis apps en AngularJS que compartían componentes, y lideré su paso al Angular más reciente, incluidos los componentes compartidos. También configuré los despliegues con Jenkins para cada ambiente.",
    },
  },
  {
    id: "small-business",
    areas: ["full-stack"],
    title: { en: "Websites for small businesses", es: "Sitios para pequeños negocios" },
    client: { en: "Lactanne, Solaris and Hanslistenia", es: "Lactanne, Solaris y Hanslistenia" },
    metric: {
      en: "3 sites built for search, with blogs and an online shop",
      es: "3 sitios hechos para buscadores, con blog y tienda en línea",
    },
    story: {
      en: "Lactanne and Solaris, a tanning salon, have Next.js sites built to rank in search, each with its own blog. Hanslistenia, a calisthenics center, has an online shop.",
      es: "Lactanne y Solaris, un salón de bronceado, tienen sitios en Next.js hechos para posicionar en buscadores, cada uno con su blog. Hanslistenia, un centro de calistenia, tiene una tienda en línea.",
    },
    links: ["https://lactanne.com", "https://solarisbronceado.com", "https://hanslistenia.com"],
  },
];
