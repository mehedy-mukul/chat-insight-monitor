import { toast } from "sonner";
import { API_BASE_URL, API_AUTH_KEY } from '@/config/env';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface SummaryData {
  total_chats: string;
  total_employees: string;
  total_sessions: string;
  total_tokens: string;
  prompt_tokens: string;
  completion_tokens: string;
}

export interface Execution {
  execution_id: number;
  session_id: string;
  employee_id: string;
  input: {
    tokens: number;
    query: string;
    time: string;
  };
  output: {
    tokens: number;
    query: string;
    time: string;
  };
  status: string;
}

export interface ExecutionsResponse {
  page: number;
  limit: number;
  total: string;
  next: string | null;
  previous: string | null;
  results: Execution[];
}

// Generic fetch function with error handling
async function fetchApi<T>(endpoint: string, options = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: API_AUTH_KEY,
        ...((options as any).headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    toast.error(`Error: ${errorMessage}`);
    return { data: null, error: errorMessage };
  }
}

// Get dashboard summary statistics
export const fetchSummaryData = async (): Promise<ApiResponse<SummaryData>> => {
  return fetchApi<SummaryData>("/webhook/executions/summary");
};

// Get executions list with pagination and filters
export const fetchExecutions = async (
  page = 1,
  limit = 10,
  filters: Record<string, string> = {}
): Promise<ApiResponse<ExecutionsResponse>> => {
  // Build query parameters for pagination and filters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  // Add any filters that have values
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  return fetchApi<ExecutionsResponse>(`/webhook/executions?${queryParams.toString()}`);
};
