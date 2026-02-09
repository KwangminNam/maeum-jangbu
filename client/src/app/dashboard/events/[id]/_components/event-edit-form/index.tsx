"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { EventEditFormHeader } from "./EventEditFormHeader";
import { EventEditFormContents } from "./EventEditFormContents";
import { EventEditFormActions } from "./EventEditFormActions";

interface EventEditFormProps {
  title: string;
  type: string;
  date: string;
  submitting: boolean;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function EventEditForm({
  title,
  type,
  date,
  submitting,
  onTitleChange,
  onTypeChange,
  onDateChange,
  onSubmit,
  onCancel,
}: EventEditFormProps) {
  const isValid = Boolean(title && type && date);

  return (
    <motion.div
      key="edit"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-5 mb-6 shadow-lg">
        <EventEditFormHeader onCancel={onCancel} />

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <EventEditFormContents
            title={title}
            type={type}
            date={date}
            onTitleChange={onTitleChange}
            onTypeChange={onTypeChange}
            onDateChange={onDateChange}
          />

          <EventEditFormActions
            isValid={isValid}
            submitting={submitting}
            onCancel={onCancel}
          />
        </form>
      </Card>
    </motion.div>
  );
}
