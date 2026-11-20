import type { ProjectContent } from "@/explorer/types";

// SAMPLE CONTENT: replace with real projects. Listed in the order to show
// them in; the map re-sorts by how many areas each one used. No dates.
export const PROJECTS: readonly ProjectContent[] = [
  {
    id: "copilot",
    areas: ["agentic-ai", "mobile", "data", "databases"],
    title: { en: "Warehouse ops copilot", es: "Copiloto de almacén" },
    client: { en: "3PL warehouse, on site", es: "Almacén 3PL, en sitio" },
    metric: { en: "From first visit to production in 6 weeks", es: "De la primera visita a producción en 6 semanas" },
    story: {
      en: "Floor leads ask a tablet things like “what's late for dock 4?” and get an answer from live inventory data. I spent the first week on the floor before writing any code.",
      es: "Los jefes de piso le preguntan a una tableta cosas como “¿qué va tarde en el andén 4?” y reciben respuesta con datos de inventario en vivo. Pasé la primera semana en el piso antes de escribir código.",
    },
  },
  {
    id: "triage",
    areas: ["agentic-ai", "full-stack", "data"],
    title: { en: "Support triage agent", es: "Agente de soporte" },
    client: { en: "B2B software company", es: "Empresa de software B2B" },
    metric: { en: "62% of tickets resolved without a human", es: "62% de los tickets resueltos sin una persona" },
    story: {
      en: "An agent that reads each ticket, checks the customer's account through internal tools, and either answers or routes it with a summary. It only acts on what it can look up.",
      es: "Un agente que lee cada ticket, revisa la cuenta del cliente con herramientas internas y responde o lo enruta con un resumen. Solo actúa sobre lo que puede consultar.",
    },
  },
  {
    id: "field",
    areas: ["mobile", "full-stack", "databases"],
    title: { en: "Field-service app", es: "App de servicio técnico" },
    client: { en: "HVAC maintenance company", es: "Empresa de mantenimiento de climatización" },
    metric: { en: "Used daily by 1,200 technicians, offline first", es: "Usada a diario por 1,200 técnicos, sin conexión primero" },
    story: {
      en: "Technicians filled paper forms and someone retyped them at night. I built a React Native app that works with no signal, an API to sync it, and the schema behind both.",
      es: "Los técnicos llenaban formularios en papel y alguien los transcribía de noche. Hice una app en React Native que funciona sin señal, una API para sincronizarla y el esquema detrás de ambas.",
    },
  },
  {
    id: "logistics",
    areas: ["full-stack", "data", "databases"],
    title: { en: "Logistics booking platform", es: "Plataforma logística" },
    client: { en: "Freight forwarder", es: "Agente de carga" },
    metric: { en: "API at 180 ms p95 while serving 3,000 requests a minute", es: "API a 180 ms p95 con 3,000 solicitudes por minuto" },
    story: {
      en: "Bookings lived in email threads. I built the booking web app and API, plus an events pipeline so operations could see every shipment's status live.",
      es: "Las reservas vivían en hilos de correo. Construí la app web y la API de reservas, más un pipeline de eventos para que operaciones viera el estado de cada envío en vivo.",
    },
  },
  {
    id: "onboarding",
    areas: ["mobile", "full-stack"],
    title: { en: "Bank onboarding app", es: "App de alta bancaria" },
    client: { en: "Digital bank", es: "Banco digital" },
    metric: { en: "Account opening from 14 minutes to 4", es: "Apertura de cuenta de 14 minutos a 4" },
    story: {
      en: "New customers dropped off halfway through a long form. I rebuilt the flow in fewer steps with ID capture on the phone and saved progress on the server.",
      es: "Los clientes nuevos abandonaban a mitad de un formulario largo. Rehíce el flujo en menos pasos, con captura de identificación en el teléfono y progreso guardado en el servidor.",
    },
  },
  {
    id: "retail",
    areas: ["data", "databases"],
    title: { en: "Retail sales warehouse", es: "Warehouse de ventas" },
    client: { en: "Grocery chain, 80 stores", es: "Cadena de supermercados, 80 tiendas" },
    metric: { en: "Nightly reports from 6 hours to 40 minutes", es: "Reportes nocturnos de 6 horas a 40 minutos" },
    story: {
      en: "Store managers were getting yesterday's numbers at noon. I rebuilt the loads to process only what changed and moved the heavy joins into the warehouse.",
      es: "Los gerentes recibían los números de ayer al mediodía. Reconstruí las cargas para procesar solo lo que cambiaba y moví los joins pesados al warehouse.",
    },
  },
  {
    id: "clinic",
    areas: ["databases", "data"],
    title: { en: "Clinic records migration", es: "Migración clínica" },
    client: { en: "Regional clinic network", es: "Red regional de clínicas" },
    metric: { en: "4 TB moved to a new engine with no downtime", es: "4 TB migrados a otro motor sin tiempo fuera de servicio" },
    story: {
      en: "Twelve clinics shared one aging SQL Server. I replicated it to PostgreSQL, ran both side by side for three weeks, and switched over on a Sunday morning in eleven minutes.",
      es: "Doce clínicas compartían un SQL Server viejo. Lo repliqué a PostgreSQL, corrí ambos en paralelo tres semanas y cambié un domingo en la mañana en once minutos.",
    },
  },
];
