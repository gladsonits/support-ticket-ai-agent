import { useState } from "react";
import { TicketInputForm } from "./components/TicketInputForm";
import { TicketDashboard } from "./components/TicketDashboard";
import { SecurityViolationCard } from "./components/SecurityViolationCard";
import type { APIResponse } from "./types/ticket";
import { ticketService } from "./services/ticketService";

export function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [ticketResponse, setTicketResponse] = useState<APIResponse | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcessTicket = async (text: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await ticketService.processTicket(text);
      setTicketResponse(data);
    } catch (err: any) {
      console.error("Backend Error:", err);
      const errorText =
        err.response?.data?.message ||
        err.message ||
        "Failed to reach backend server.";
      setErrorMessage(
        `API Error: ${errorText}. Make sure your FastAPI backend is running.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart AI Ticket Analyzer Agent
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time PII Scrubbing, Prompt Injection Guardrails, and Ticket
            Classification
          </p>
        </header>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold underline ml-4 hover:text-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {!ticketResponse ? (
          <TicketInputForm
            onSubmit={handleProcessTicket}
            isLoading={isLoading}
          />
        ) : ticketResponse.status === "rejected" ? (
          <SecurityViolationCard
            response={ticketResponse}
            onReset={() => setTicketResponse(null)}
          />
        ) : (
          <TicketDashboard
            response={ticketResponse}
            onReset={() => setTicketResponse(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
