import { apiClient } from "./api";
import type { APIResponse } from "../types/ticket";

export interface ProcessTicketRequest {
  raw_description: string;
}

export const ticketService = {
  /**
   * Submits raw ticket text to the LangGraph processing pipeline
   */
  async processTicket(rawDescription: string): Promise<APIResponse> {
    const payload: ProcessTicketRequest = {
      raw_description: rawDescription,
    };

    const response = await apiClient.post<APIResponse>(
      "/tickets/process",
      payload,
    );
    return response.data;
  },
};
