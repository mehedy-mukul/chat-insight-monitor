
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Info, 
  Send, 
  Clock, 
  MessageSquare
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useQuery } from "@tanstack/react-query";
import { fetchSessionExecutions, Execution } from "@/services/api";
import { formatDate } from "@/lib/utils";
import MainLayout from "@/components/layout/MainLayout";

interface ChatMessageProps {
  message: Execution;
  isUser: boolean;
}

const ChatMessage = ({ message, isUser }: ChatMessageProps) => {
  const text = isUser ? message.input.query : (message.output.answer || "");
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div
            className={`max-w-[75%] rounded-lg p-3 ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <p className="whitespace-pre-wrap">{text}</p>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Message Details</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Execution ID:</span>
                <span>{message.execution_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee ID:</span>
                <span>{message.employee_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span>
                  {formatDate(isUser ? message.input.time : message.output.time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens:</span>
                <span>{isUser ? message.input.tokens : message.output.tokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`${
                  message.status === "success" 
                    ? "text-green-500" 
                    : "text-red-500"
                }`}>
                  {message.status}
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

const Chat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await fetchSessionExecutions(sessionId);
      return response.data;
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionData]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Just clear the input since we're not actually sending messages
    setNewMessage("");
  };
  
  return (
    <MainLayout>
      <div className="flex-1 flex flex-col h-full">
        <div className="border-b p-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/executions')}
            >
              <ArrowLeft />
            </Button>
            <div>
              <h1 className="text-lg font-medium flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> 
                Chat Session
              </h1>
              <p className="text-sm text-muted-foreground">Session ID: {sessionId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    {sessionData?.results && sessionData.results.length > 0 
                      ? formatDate(sessionData.results[0].input.time) 
                      : "No data"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Session start time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Session Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Details about this conversation session
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm">Session ID:</span>
                      <span className="col-span-2 text-sm font-medium truncate">{sessionId}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm">Employee ID:</span>
                      <span className="col-span-2 text-sm font-medium">
                        {sessionData?.results && sessionData.results.length > 0 
                          ? sessionData.results[0].employee_id 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm">Messages:</span>
                      <span className="col-span-2 text-sm font-medium">
                        {sessionData?.total || "0"} total
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-destructive">
                <p className="text-lg font-medium">Failed to load chat</p>
                <p className="text-sm">Please try again later</p>
              </div>
            </div>
          )}

          {sessionData?.results && sessionData.results.length > 0 ? (
            <div className="space-y-4">
              {sessionData.results.map((message) => (
                <div key={message.execution_id} className="space-y-2">
                  <ChatMessage message={message} isUser={true} />
                  <ChatMessage message={message} isUser={false} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : !isLoading && !error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-2 opacity-20" />
                <p className="text-lg font-medium">No messages found</p>
                <p className="text-sm">This chat session appears to be empty</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This is a read-only view of the conversation. New messages won't be sent.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
