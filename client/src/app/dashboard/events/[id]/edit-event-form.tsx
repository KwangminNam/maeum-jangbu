"use client";

import { motion, AnimatePresence } from "framer-motion";
import { containerVariants } from "@/lib/animations";
import { useEditEventForm, useEventMessage } from "./_hooks";
import {
  EventInfoCard,
  EventMessageCard,
  AmountDashboard,
  BalanceCard,
  EventEditForm,
} from "./_components";

interface EditEventFormProps {
  eventId: string;
  initialTitle: string;
  initialType: string;
  initialDate: string;
  receivedAmount: number;
  sentAmount: number;
  recordCount: number;
}

export function EditEventForm({
  eventId,
  initialTitle,
  initialType,
  initialDate,
  receivedAmount,
  sentAmount,
  recordCount,
}: EditEventFormProps) {
  const form = useEditEventForm({
    eventId,
    initialTitle,
    initialType,
    initialDate,
  });

  const eventMessage = useEventMessage(initialType, initialDate);

  return (
    <AnimatePresence mode="wait">
      {form.isEditing ? (
        <EventEditForm
          title={form.title}
          type={form.type}
          date={form.date}
          submitting={form.submitting}
          onTitleChange={form.setTitle}
          onTypeChange={form.setType}
          onDateChange={form.setDate}
          onSubmit={form.handleSubmit}
          onCancel={form.cancelEditing}
        />
      ) : (
        <motion.div
          key="view"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3 mb-6"
        >
          <EventInfoCard
            type={initialType}
            date={initialDate}
            title={initialTitle}
            recordCount={recordCount}
            isDeleting={form.isDeleting}
            onEdit={form.startEditing}
            onDelete={form.handleDelete}
          />

          {eventMessage && (
            <EventMessageCard
              icon={eventMessage.icon}
              message={eventMessage.message}
              subMessage={eventMessage.subMessage}
            />
          )}

          <AmountDashboard
            receivedAmount={receivedAmount}
            sentAmount={sentAmount}
          />

          <BalanceCard
            receivedAmount={receivedAmount}
            sentAmount={sentAmount}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
