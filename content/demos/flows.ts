/** Step-through flows for the Generative AI platform and Ivorie demos. Illustrative, not production traces. */

export interface FlowNode {
  id: string;
  label: string;
  sub: string;
}

export interface FlowStep {
  at: string;
  title: string;
  detail: string;
  trace?: string;
}

export interface Flow {
  id: "genai-request" | "ivorie-message" | "ivorie-payment";
  label: string;
  nodes: FlowNode[];
  steps: FlowStep[];
}

export const flows: Flow[] = [
  {
    id: "genai-request",
    label: "Life of a request",
    nodes: [
      { id: "client", label: "Client", sub: "user prompt" },
      { id: "router", label: "Model router", sub: "picks a model" },
      { id: "orchestrator", label: "Orchestrator", sub: "prompt + context" },
      { id: "tools", label: "MCP tools", sub: "web search" },
      { id: "rag", label: "Retrieval", sub: "vector DB" },
      { id: "answer", label: "Answer", sub: "streamed back" },
    ],
    steps: [
      {
        at: "client",
        title: "A question arrives",
        detail: "The client sends the user's message with the conversation id, so earlier turns can be pulled into context.",
        trace: '{ "conversation": "c_19", "message": "What changed in the refund policy this month?" }',
      },
      {
        at: "router",
        title: "Route to a model",
        detail: "The router classifies the request and picks one of several fine-tuned models for that category of prompt.",
        trace: '{ "category": "policy_question", "model": "policy-qa", "reason": "category match" }',
      },
      {
        at: "orchestrator",
        title: "Build the prompt",
        detail: "Categorised prompt templates plus managed conversation context: recent turns are kept, older ones summarised.",
        trace: '{ "template": "policy_qa.v3", "context_turns": 4, "summary": true }',
      },
      {
        at: "tools",
        title: "Call a tool over MCP",
        detail: "The model asks for fresh information, so the platform calls the custom MCP server's real-time web search tool.",
        trace: '{ "tool": "web_search", "args": { "query": "refund policy update" }, "results": 5 }',
      },
      {
        at: "rag",
        title: "Retrieve grounding",
        detail: "Retrieval-augmented generation pulls the most relevant internal chunks from the vector database to ground the answer.",
        trace: '{ "index": "policies", "top_k": 4, "chunks": ["policy.md#refunds", "faq.md#timelines"] }',
      },
      {
        at: "answer",
        title: "Answer, grounded",
        detail: "The response streams back with its sources. Grounding through RAG is what improved relevance and accuracy by 25%.",
        trace: '{ "sources": 3, "streamed": true }',
      },
    ],
  },
  {
    id: "ivorie-message",
    label: "Follow a message",
    nodes: [
      { id: "sender", label: "Couple’s app", sub: "Expo React Native" },
      { id: "gateway", label: "WebSocket gateway", sub: "NestJS" },
      { id: "db", label: "PostgreSQL", sub: "message stored" },
      { id: "fanout", label: "Fan-out", sub: "event-driven" },
      { id: "vendor", label: "Vendor’s app", sub: "live + push" },
    ],
    steps: [
      { at: "sender", title: "A couple messages a vendor", detail: "The mobile app sends the message over an open WebSocket connection." },
      { at: "gateway", title: "Gateway validates", detail: "The NestJS gateway authenticates the socket and checks the sender belongs to the conversation." },
      { at: "db", title: "Persist first", detail: "The message is written to PostgreSQL before anyone is notified, so history is the source of truth." },
      { at: "fanout", title: "Fan out asynchronously", detail: "An event triggers delivery to every participant's open sockets, and a push notification for anyone offline." },
      { at: "vendor", title: "Delivered", detail: "The vendor sees it live, or gets a notification. The system handles 10k+ messages a day this way." },
    ],
  },
  {
    id: "ivorie-payment",
    label: "Follow the money",
    nodes: [
      { id: "customer", label: "Customer", sub: "books a vendor" },
      { id: "checkout", label: "Checkout", sub: "Stripe" },
      { id: "platform", label: "Platform", sub: "keeps its fee" },
      { id: "connected", label: "Vendor account", sub: "Stripe Connect" },
      { id: "payout", label: "Payout", sub: "to the vendor's bank" },
    ],
    steps: [
      { at: "customer", title: "Booking confirmed", detail: "A couple confirms a vendor booking in the app." },
      { at: "checkout", title: "Pay once", detail: "The customer pays through Stripe; the platform never handles card details." },
      { at: "platform", title: "Split the payment", detail: "The platform's fee is separated from the vendor's share as part of the same charge." },
      { at: "connected", title: "Credit the vendor", detail: "The vendor's share lands in their Stripe Connected Account, onboarded through the platform." },
      { at: "payout", title: "Payout", detail: "Stripe pays the vendor out to their bank on their payout schedule." },
    ],
  },
];
