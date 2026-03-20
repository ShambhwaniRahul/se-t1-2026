import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingBag, StickyNote, Trash2, Send, Phone, Mail, CalendarDays } from "lucide-react";
import type { Customer } from "./crmData";

interface CustomerDrawerProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote: (customerId: string, text: string) => void;
  onDeleteNote: (customerId: string, noteId: string) => void;
}

export function CustomerDrawer({
  customer,
  open,
  onOpenChange,
  onAddNote,
  onDeleteNote,
}: CustomerDrawerProps) {
  const [noteText, setNoteText] = useState("");

  if (!customer) return null;

  const handleSubmitNote = () => {
    if (!noteText.trim()) return;
    onAddNote(customer.id, noteText.trim());
    setNoteText("");
  };

  const orderStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "success" as const;
      case "refunded": return "warning" as const;
      case "cancelled": return "destructive" as const;
      default: return "default" as const;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl">{customer.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Customer profile for {customer.name}
          </SheetDescription>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </SheetHeader>

        {/* Contact & Stats */}
        <div className="px-6 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>Joined {format(new Date(customer.joinedAt), "MMM yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>Last visit {format(new Date(customer.lastVisit), "MMM d")}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border bg-card p-3 text-center">
              <Star className="h-4 w-4 mx-auto text-warning mb-1" />
              <p className="text-lg font-bold tabular-nums">{customer.loyaltyPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <ShoppingBag className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold tabular-nums">{customer.visitCount}</p>
              <p className="text-xs text-muted-foreground">Visits</p>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1 mt-0.5">Total Spent</p>
              <p className="text-lg font-bold tabular-nums">${customer.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="orders" className="px-6 pt-4 pb-6">
          <TabsList className="w-full">
            <TabsTrigger value="orders" className="flex-1 gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 gap-1.5">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4 space-y-3">
            {customer.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
            ) : (
              customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">{order.id}</span>
                    <StatusBadge variant={orderStatusVariant(order.status)}>
                      {order.status}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.date), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm">{order.items.join(", ")}</p>
                  <p className="text-sm font-semibold tabular-nums">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note…"
                className="min-h-[72px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmitNote();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleSubmitNote}
                disabled={!noteText.trim()}
                className="shrink-0 self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {customer.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notes yet.</p>
            ) : (
              customer.notes.map((note) => (
                <div
                  key={note.id}
                  className="group rounded-lg border p-3 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed">{note.text}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteNote(customer.id, note.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(note.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
