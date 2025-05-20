
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchExecutions, ExecutionsResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import MainLayout from "@/components/layout/MainLayout";

interface Filters {
  employeeId: string;
  sessionId: string;
}

const Executions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    employeeId: "",
    sessionId: ""
  });
  const navigate = useNavigate();

  // Use React Query to fetch executions data
  const { data: executionsData, isLoading, refetch } = useQuery({
    queryKey: ["executions", currentPage, filters],
    queryFn: async () => {
      const response = await fetchExecutions(currentPage, 10, {
        employee_id: filters.employeeId,
        session_id: filters.sessionId
      });
      return response.data;
    }
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      employeeId: "",
      sessionId: ""
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    refetch();
  };

  const handlePageChange = (direction: "next" | "prev") => {
    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    if (newPage >= 1) {
      setCurrentPage(newPage);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate("/")}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">All Executions</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Chatbot Executions</CardTitle>
            <CardDescription>Complete list of all chatbot interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/40 p-4 rounded-md mb-4">
              <div className="text-sm font-medium mb-2 flex items-center">
                <Filter size={16} className="mr-2" />
                Filter Results
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="employeeId" className="text-xs font-medium">
                    Employee ID
                  </label>
                  <Input
                    id="employeeId"
                    placeholder="Filter by employee ID"
                    value={filters.employeeId}
                    onChange={(e) => handleFilterChange("employeeId", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="sessionId" className="text-xs font-medium">
                    Session ID
                  </label>
                  <Input
                    id="sessionId"
                    placeholder="Filter by session ID"
                    value={filters.sessionId}
                    onChange={(e) => handleFilterChange("sessionId", e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button variant="secondary" className="flex-1" onClick={handleApplyFilters}>
                    <Search size={16} className="mr-2" />
                    Apply
                  </Button>
                  <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Execution ID</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Input</TableHead>
                      <TableHead>Output</TableHead>
                      <TableHead className="text-right">Token Usage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executionsData?.results.map((execution) => (
                      <TableRow key={execution.execution_id}>
                        <TableCell className="font-medium">
                          {execution.execution_id}
                        </TableCell>
                        <TableCell>{execution.employee_id}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-normal"
                            onClick={() => handleSessionClick(execution.session_id)}
                          >
                            <span title={execution.session_id}>
                              {execution.session_id}
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell>{execution.input ? formatDate(execution.input.time) : "N/A"}</TableCell>
                        <TableCell>{execution.output ? formatDate(execution.output.time) : "N/A"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <span title={execution.input?.query}>
                            {execution.input?.query || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <span title={execution.output?.answer || execution.output?.query}>
                            {execution.output?.answer || execution.output?.query || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {execution.input && execution.output
                            ? execution.input.tokens + execution.output.tokens
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            execution.status === "success" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {execution.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {(!executionsData?.results || executionsData.results.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No results found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t p-4">
            <div className="text-sm text-muted-foreground">
              Showing page {currentPage} ({executionsData?.results?.length || 0} of {executionsData?.total || 0} records)
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handlePageChange("prev")}
                disabled={!executionsData?.previous}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handlePageChange("next")}
                disabled={!executionsData?.next}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Executions;
