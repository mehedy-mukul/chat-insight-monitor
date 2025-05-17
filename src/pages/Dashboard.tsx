
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { fetchExecutions } from "@/services/api";
import StatsCard from "@/components/StatsCard";

interface Execution {
  id: string;
  model: string;
  prompt: string;
  response: string;
  startTime: string;
  endTime: string;
  status: "success" | "failure";
  cost: number;
}

interface ApiResponse {
  data: Execution[];
  total: number;
}

const itemsPerPageOptions = [5, 10, 20];

const Dashboard = () => {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [modelFilter, setModelFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["executions", page, itemsPerPage, modelFilter, statusFilter],
    queryFn: () => fetchExecutions(page, itemsPerPage, { model: modelFilter, status: statusFilter })
  });

  const totalPages = data?.data ? Math.ceil(Number(data.data.total) / itemsPerPage) : 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setPage(1); // Reset to the first page when items per page changes
  };

  const handleModelFilterChange = (value: string) => {
    setModelFilter(value === "all" ? null : value);
    setPage(1); // Reset to the first page when the filter changes
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value);
    setPage(1); // Reset to the first page when the filter changes
  };

  // Safely handle data access with optional chaining
  const executionsData = data?.data?.results || [];
  const models = executionsData.length > 0 
    ? [...new Set(executionsData.map((item) => item.model || ''))] 
    : [];

  const totalExecutions = data?.data?.total ? Number(data.data.total) : 0;
  const successRate = executionsData.length > 0
    ? (executionsData.filter((item) => item.status === "success").length / executionsData.length) * 100
    : 0;
  const averageCost = executionsData.length > 0
    ? executionsData.reduce((acc, item) => acc + (item.cost || 0), 0) / executionsData.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of AI chatbot performance and recent executions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Executions"
          value={totalExecutions.toString()}
          description="Total number of executions"
        />
        <StatsCard
          title="Success Rate"
          value={`${successRate.toFixed(2)}%`}
          description="Percentage of successful executions"
        />
        <StatsCard
          title="Average Cost"
          value={`$${averageCost.toFixed(4)}`}
          description="Average cost per execution"
        />
        <StatsCard
          title="Uptime"
          value="99.99%"
          description="AI Chatbot Uptime"
        />
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                A list of recent AI chatbot executions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder={`${itemsPerPage} items per page`} />
                    </SelectTrigger>
                    <SelectContent>
                      {itemsPerPageOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option} items per page
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={modelFilter || "all"} onValueChange={handleModelFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Models</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model || 'unknown'} value={model || 'unknown'}>
                          {model || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter || "all"} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Model</TableHead>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Start Time</TableHead>
                      <TableHead className="text-right">End Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    )}
                    {error && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Error: {error instanceof Error ? error.message : 'Unknown error'}
                        </TableCell>
                      </TableRow>
                    )}
                    {executionsData.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell className="font-medium">{execution.model}</TableCell>
                        <TableCell>{execution.prompt}</TableCell>
                        <TableCell>{execution.response}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={execution.status === "success" ? "default" : "destructive"}>
                            {execution.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${execution.cost?.toFixed(4) || '0.0000'}</TableCell>
                        <TableCell className="text-right">{formatDate(execution.startTime)}</TableCell>
                        <TableCell className="text-right">{formatDate(execution.endTime)}</TableCell>
                      </TableRow>
                    ))}
                    {executionsData.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No executions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics of AI chatbot executions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Coming Soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
