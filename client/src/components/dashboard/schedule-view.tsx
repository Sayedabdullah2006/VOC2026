import { Schedule } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ScheduleViewProps {
  schedules: Schedule[];
}

export default function ScheduleView({ schedules }: ScheduleViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-sm text-gray-600">No upcoming classes scheduled.</p>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">
                    {format(new Date(schedule.startTime), "MMMM d, yyyy")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(schedule.startTime), "h:mm a")} - 
                    {format(new Date(schedule.endTime), "h:mm a")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
