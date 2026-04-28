import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, collection, query, orderBy, onSnapshot } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";
import { useAppTheme } from "../theme/AppTheme";

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;
  location?: string;
  type: 'group' | 'appointment' | 'workshop';
}

export function EventCalendarScreen({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const theme = useAppTheme();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const eventsQuery = query(collection(db, "events"), orderBy("startTime", "asc"));

    const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(eventsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "events");
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-full flex flex-col p-4 bg-[#F7F5F2]" style={{ fontFamily: 'var(--font-sans)' }}>
      <header className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <h1 className="text-2xl font-bold" style={{ color: '#3D8B7A' }}>Event Calendar</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto space-y-4">
        {events.map(event => (
          <Card key={event.id} className="bg-white rounded-2xl border-none shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: '#3D8B7A' }}>{event.title}</h2>
                <span className="text-[10px] font-bold uppercase py-1 px-2 rounded-full bg-[#E8F0ED]" style={{ color: '#3D8B7A' }}>{event.type}</span>
              </div>
              <p className="text-sm text-gray-600">{event.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
