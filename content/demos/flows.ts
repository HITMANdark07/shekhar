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
  id:
    | "genai-request"
    | "ivorie-message"
    | "ivorie-payment"
    | "story-pipeline"
    | "tenant-januji"
    | "tenant-notifypay"
    | "tenant-missing";
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
      { id: "sender", label: "Couple’s app", sub: "Expo · Socket.IO" },
      { id: "gateway", label: "Chat gateway", sub: "NestJS · JWT" },
      { id: "db", label: "PostgreSQL", sub: "persist first" },
      { id: "presence", label: "Redis", sub: "who is online?" },
      { id: "deliver", label: "Vendor", sub: "live or push" },
    ],
    steps: [
      { at: "sender", title: "A couple messages a vendor", detail: "The mobile app sends the message over its Socket.IO connection." },
      { at: "gateway", title: "Authenticated socket", detail: "The NestJS gateway verified this socket's JWT when it connected, and checks the sender belongs to the conversation." },
      { at: "db", title: "Persist first", detail: "The message is saved to PostgreSQL before anyone is notified, so every device shows the same history." },
      { at: "presence", title: "Check presence", detail: "Redis maps each participant's sessions to their live sockets and says who is online right now." },
      { at: "deliver", title: "Deliver or push", detail: "Online sessions receive it instantly; offline participants get an Expo push notification, and a scheduled digest email if it stays unread. 10k+ messages a day flow this way." },
    ],
  },
  {
    id: "ivorie-payment",
    label: "Follow the money",
    nodes: [
      { id: "milestone", label: "Milestone due", sub: "scheduled job" },
      { id: "invoice", label: "Stripe invoice", sub: "sent ahead of time" },
      { id: "settle", label: "Funds settle", sub: "ACH" },
      { id: "transfer", label: "Vendor payout", sub: "Stripe Connect" },
      { id: "reward", label: "Referral reward", sub: "in-app, cash-out" },
    ],
    steps: [
      { at: "milestone", title: "A milestone comes due", detail: "Bookings are paid in installments; a timezone-aware scheduled job finds milestones coming due." },
      { at: "invoice", title: "Invoice ahead of time", detail: "A Stripe invoice goes out before the due date, with reminder and overdue emails on schedule." },
      { at: "settle", title: "Wait for settlement", detail: "Bank (ACH) payments take time; the platform records each charge once its funds have settled." },
      { at: "transfer", title: "Pay the vendor", detail: "A scheduled transfer sends the vendor's share to their Stripe Connect account, linked to the original charge; the platform fee stays behind." },
      { at: "reward", title: "Thank the recommender", detail: "If a recently married couple recommended this vendor, their commission is credited as in-app rewards they can cash out." },
    ],
  },
  {
    id: "story-pipeline",
    label: "Life of a story",
    nodes: [
      { id: "mic", label: "Narrator’s mic", sub: "AudioWorklet · 16 kHz" },
      { id: "stt", label: "Speech-to-text", sub: "Sarvam · Hindi → English" },
      { id: "director", label: "Scene director", sub: "LLM · characters + scenes" },
      { id: "dispatch", label: "Producer", sub: "FastAPI · Celery" },
      { id: "gpus", label: "GPU pods", sub: "ComfyUI · one job each" },
      { id: "panels", label: "Live panels", sub: "SSE · WebSocket" },
    ],
    steps: [
      { at: "mic", title: "Someone tells a story", detail: "The browser captures the microphone with an AudioWorklet and streams 16 kHz PCM audio over a WebSocket to a FastAPI session.", trace: '{ "type": "audio", "format": "pcm16", "sampleRate": 16000, "chunkMs": 100 }' },
      { at: "stt", title: "Speech becomes text", detail: "The session forwards audio to Sarvam's streaming API, which transcribes it, translating Hindi narration into English on the fly.", trace: '{ "transcript": "The old king called his three daughters…", "language_code": "hi-IN", "is_final": true }' },
      { at: "director", title: "An LLM directs the scene", detail: "An utterance buffer flushes complete thoughts to the scene director (gpt-4o-mini, or Qwen3 on vLLM), which registers new characters and decides when a panel is ready.", trace: '{ "new_characters": ["king", "youngest daughter"], "scene_ready": true }' },
      { at: "dispatch", title: "Fan out the work", detail: "New characters get a portrait on the text-to-image queue; the scene becomes one candidate per image-to-image pod, each with its own seed and the characters' reference images.", trace: '{ "t2i": 2, "i2i_batch": { "candidates": 3, "refs": 2 } }' },
      { at: "gpus", title: "GPUs render in parallel", detail: "Each Celery worker drives one ComfyUI pod, one job at a time. Candidates render side by side, so a scene takes about one job's time.", trace: '{ "pod1": "45%", "pod2": "52%", "pod3": "38%" }' },
      { at: "panels", title: "Panels appear live", detail: "Workers publish progress on Redis pub/sub; the browser watches every candidate fill in and the story's panels appear as it is told." },
    ],
  },
  {
    id: "tenant-januji",
    label: "Januji · AI chat",
    nodes: [
      { id: "app", label: "Januji app", sub: "Expo · Next.js" },
      { id: "appid", label: "App ID", sub: "X-App-ID · cached" },
      { id: "auth", label: "Auth", sub: "JWT + session" },
      { id: "limits", label: "Guards", sub: "rate limit · plan" },
      { id: "handler", label: "AI routes", sub: "Go · ai-common" },
      { id: "ai", label: "AI service", sub: "TypeScript · LangGraph" },
    ],
    steps: [
      { at: "app", title: "A Januji user sends a chat message", detail: "The app calls the shared backend with its own tenant ID in the X-App-ID header.", trace: "POST /api/v1/... chat   X-App-ID: <januji app uuid>" },
      { at: "appid", title: "Identify the tenant", detail: "Middleware validates the app ID against the apps table (cached in Redis) and stores it in the request context for everything downstream." },
      { at: "auth", title: "Authenticate the user", detail: "JWT and session checks run inside the tenant: a Januji token means nothing to NotifyPay." },
      { at: "limits", title: "Rate limit and plan", detail: "A Redis-backed rate limiter (with an in-memory fallback) and the cached subscription state decide whether this plan can use the feature." },
      { at: "handler", title: "Shared AI routes", detail: "The Go AI routes load the tenant's characters and conversation, every query filtered by app_id." },
      { at: "ai", title: "LLM call, streamed back", detail: "The TypeScript service picks the provider (OpenAI, Gemini or xAI), adds memory and RAG context from pgvector, charges tokens or coins, and streams the reply over SSE.", trace: "event: token   data: {\"delta\": \"Hey! Glad you're back…\"}" },
    ],
  },
  {
    id: "tenant-notifypay",
    label: "NotifyPay · payments",
    nodes: [
      { id: "app", label: "NotifyPay app", sub: "Android · Compose" },
      { id: "appid", label: "App ID", sub: "X-App-ID · cached" },
      { id: "auth", label: "Auth", sub: "JWT + session" },
      { id: "limits", label: "Guards", sub: "rate limit · plan" },
      { id: "handler", label: "NotifyPay routes", sub: "Go · app module" },
      { id: "db", label: "PostgreSQL", sub: "scoped by app_id" },
    ],
    steps: [
      { at: "app", title: "A NotifyPay user opens their list", detail: "The Android app calls the same backend with NotifyPay's app ID.", trace: "GET /api/v1/...   X-App-ID: <notifypay app uuid>" },
      { at: "appid", title: "Identify the tenant", detail: "Same middleware, different tenant: the request context now carries NotifyPay's app ID." },
      { at: "auth", title: "Authenticate the user", detail: "Users are tenant-scoped, so the token is checked against NotifyPay's users only." },
      { at: "limits", title: "Rate limit and plan", detail: "The same shared guards run for every app, configured per app in YAML." },
      { at: "handler", title: "App-specific module", detail: "NotifyPay's own routes, handlers and repositories sit on top of the shared common modules." },
      { at: "db", title: "Only this tenant's rows", detail: "Every table carries an indexed app_id, so the query can only ever see NotifyPay's data.", trace: "SELECT … FROM notifications WHERE app_id = '<notifypay>' AND user_id = $1 AND deleted_at IS NULL" },
    ],
  },
  {
    id: "tenant-missing",
    label: "No X-App-ID",
    nodes: [
      { id: "app", label: "Unknown client", sub: "no tenant header" },
      { id: "appid", label: "App ID", sub: "X-App-ID · cached" },
      { id: "auth", label: "Auth", sub: "never reached" },
    ],
    steps: [
      { at: "app", title: "A request arrives without a tenant", detail: "No X-App-ID or App-ID header is sent." },
      { at: "appid", title: "Look for the tenant", detail: "The app-ID middleware checks both header names before anything else in the chain runs." },
      { at: "appid", title: "Rejected at the door", detail: "The app-ID middleware rejected it before auth or any query ran, so tenant data is never touched. Only global admin routes are exempt from the header.", trace: '{ "code": "MISSING_APP_ID", "message": "App ID is required in header (X-App-ID or App-ID)" }' },
    ],
  },
];
