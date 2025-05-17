
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, MessageSquare, Clock, TrendingUp, 
  Input, Output, Filter, Search, LogOut 
} from "lucide-react";
import { fetchSummaryData, fetchExecutions, SummaryData, ExecutionsResponse } from "@/services/api";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input as InputField } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [executionsData, setExecutionsData] = useState<ExecutionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    employeeId: "",
    sessionId: ""
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch summary data
        const summaryResponse = await fetchSummaryData();
        if (summaryResponse.data) {
          setSummaryData(summaryResponse.data);
        }

        // Fetch executions data
        const executionsResponse = await fetchExecutions(1, 10);
        if (executionsResponse.data) {
          setExecutionsData(executionsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const filteredResults = await fetchExecutions(1, 10, {
        employee_id: filters.employeeId,
        session_id: filters.sessionId
      });
      
      if (filteredResults.data) {
        setExecutionsData(filteredResults.data);
      }
    } catch (error) {
      toast.error("Failed to filter results");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setFilters({
      employeeId: "",
      sessionId: ""
    });
    
    setIsLoading(true);
    try {
      const results = await fetchExecutions(1, 10);
      if (results.data) {
        setExecutionsData(results.data);
      }
    } catch (error) {
      toast.error("Failed to reset filters");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Chatbot Monitor Dashboard</h1>
        <Button variant="outline" onClick={logout} className="flex items-center gap-2">
          <LogOut size={16} />
          Logout
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatsCard 
          title="Total Users" 
          value={summaryData?.total_employees || "0"}
          icon={<Users size={20} />}
          isLoading={isLoading}
        />
        <StatsCard 
          title="Total Chats" 
          value={summaryData?.total_chats || "0"}
          icon={<MessageSquare size={20} />}
          isLoading={isLoading}
        />
        <StatsCard 
          title="Total Sessions" 
          value={summaryData?.total_sessions || "0"}
          icon={<Clock size={20} />}
          isLoading={isLoading}
        />
        <StatsCard 
          title="Total Tokens" 
          value={summaryData?.total_tokens || "0"}
          icon={<TrendingUp size={20} />}
          isLoading={isLoading}
        />
        <StatsCard 
          title="Input Tokens" 
          value={summaryData?.prompt_tokens || "0"}
          icon={<Input size={20} />}
          isLoading={isLoading}
        />
        <StatsCard 
          title="Output Tokens" 
          value={summaryData?.completion_tokens || "0"}
          icon={<Output size={20} />}
          isLoading={isLoading}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Chat Executions</CardTitle>
              <CardDescription>Recent AI chatbot interactions</CardDescription>
            </div>
            <Button onClick={() => navigate("/executions")}>View All</Button>
          </div>
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
                <InputField
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
                <InputField
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
              {[...Array(5)].map((_, i) => (
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
                        <span title={execution.session_id}>
                          {execution.session_id}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(execution.input.time)}</TableCell>
                      <TableCell>{formatDate(execution.output.time)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <span title={execution.input.query}>
                          {execution.input.query}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <span title={execution.output.query}>
                          {execution.output.query}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {execution.input.tokens + execution.output.tokens}
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
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {executionsData?.results?.length || 0} of {executionsData?.total || 0} records
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
