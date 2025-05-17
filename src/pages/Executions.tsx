
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { fetchExecutions } from "@/services/api";
import { formatDate } from "@/lib/utils";

interface Execution {
  id: string;
  timestamp: string;
  input: string;
  output: string;
  status: "success" | "failure" | "pending";
}

interface Filters {
  status: "all" | "success" | "failure" | "pending";
  search: string;
}

const Executions = () => {
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: "",
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["executions", filters, page, pageSize],
    queryFn: () => fetchExecutions(page, pageSize, { status: filters.status, search: filters.search })
  });

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status: status as Filters["status"] });
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
    setPage(1);
  };

  const totalPages = data?.data ? Math.ceil(Number(data.data.total) / pageSize) : 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const executionsData = data?.data?.results || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Executions</h1>
        <p className="text-muted-foreground">
          View and filter all AI chatbot executions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executions List</CardTitle>
          <CardDescription>
            Filter and search through the executions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Search executions..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <div>
              <Select onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Input</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 italic text-muted-foreground"
                    >
                      Loading executions...
                    </TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 italic text-red-500"
                    >
                      Error: {error instanceof Error ? error.message : 'Unknown error'}
                    </TableCell>
                  </TableRow>
                )}
                {executionsData.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell className="font-medium">{execution.id}</TableCell>
                    <TableCell>{formatDate(execution.timestamp)}</TableCell>
                    <TableCell>{execution.input}</TableCell>
                    <TableCell>{execution.output}</TableCell>
                    <TableCell>{execution.status}</TableCell>
                  </TableRow>
                ))}
                {executionsData.length === 0 && !isLoading && !error && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 italic text-muted-foreground"
                    >
                      No executions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || totalPages === 0}
              variant="outline"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Executions;
