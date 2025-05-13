import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NotificationsDropdown() {
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-2">
            {notifications?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                لا توجد إشعارات
              </div>
            ) : (
              notifications?.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start space-y-1 ${
                    !notification.isRead ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(notification.createdAt), "PPp", {
                      locale: ar,
                    })}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
