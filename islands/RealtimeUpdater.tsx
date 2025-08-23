import { useEffect, useState } from "preact/hooks";

interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

interface RealtimeUpdaterProps {
  eventId: string;
  initialParticipants: Participant[];
  onUpdate?: (participants: Participant[]) => void;
}

// Simple hash function to detect data changes
function hashParticipants(participants: Participant[]): string {
  return JSON.stringify(participants.map(p => ({
    ticketNumber: p.ticketNumber,
    name: p.name,
    provenance: p.provenance,
    category: p.category,
    timestamp: p.timestamp
  })));
}

export default function RealtimeUpdater({
  eventId,
  initialParticipants
}: RealtimeUpdaterProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentCount, setCurrentCount] = useState(initialParticipants.length);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastDataHash, setLastDataHash] = useState<string>(hashParticipants(initialParticipants));
  
  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    const connect = () => {
      try {
        console.log(`🔌 Connecting to SSE for event ${eventId}`);
        eventSource = new EventSource(`/api/events/${eventId}/watch`);
        
        eventSource.onopen = () => {
          console.log("✅ SSE connected successfully");
          setIsConnected(true);
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("📩 SSE message received:", data);
            
            if (data.type === "participants_update") {
              const newCount = data.count;
              const newHash = hashParticipants(data.participants);
              
              console.log(`📊 Count: ${currentCount} → ${newCount}`);
              console.log(`🔍 Hash changed: ${newHash !== lastDataHash}`);
              
              // Check if either count or data content has changed
              if (newCount !== currentCount || newHash !== lastDataHash) {
                console.log("🔄 Data changed! Auto-refreshing in 1 second...");
                setCurrentCount(newCount);
                setLastDataHash(newHash);
                setIsRefreshing(true);
                
                // Auto-refresh after a short delay to allow the user to see the notification
                setTimeout(() => {
                  console.log("🔄 Auto-refreshing page now...");
                  globalThis.location.reload();
                }, 1000);
              }
            }
          } catch (error) {
            console.error("❌ Error parsing SSE data:", error);
          }
        };
        
        eventSource.onerror = (error) => {
          console.log("⚠️ SSE connection error:", error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error("❌ Failed to create EventSource:", error);
        setIsConnected(false);
      }
    };
    
    connect();
    
    return () => {
      console.log("🧹 Cleaning up SSE connection");
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventId]);

  // Show minimal discrete status indicator
  return (
    <span class={`inline-flex items-center gap-1 ml-2 text-xs ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
      <span class={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {isRefreshing && (
        <span class="text-blue-600 dark:text-blue-400 animate-pulse">↻</span>
      )}
    </span>
  );
}
