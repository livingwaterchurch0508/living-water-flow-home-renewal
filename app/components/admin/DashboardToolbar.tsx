'use client';

import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface DashboardToolbarProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  labels: {
    add: string;
    edit: string;
    delete: string;
  };
}

export function DashboardToolbar({
  onAdd,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  labels,
}: DashboardToolbarProps) {
  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="outline" onClick={onAdd} aria-label={labels.add}>
            <Plus className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{labels.add}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            disabled={!canEdit}
            aria-label={labels.edit}
            onClick={onEdit}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{labels.edit}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="destructive"
            disabled={!canDelete}
            aria-label={labels.delete}
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{labels.delete}</TooltipContent>
      </Tooltip>
    </div>
  );
}
