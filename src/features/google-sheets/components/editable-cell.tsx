'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { updateSheetRowField } from '../api/service';
import { SmartCell } from './smart-cell';
import type { ColumnType } from '../api/types';

type Props = {
  rowId: string;
  syncId: string;
  field: string;
  value: string;
  type: ColumnType;
  isEdited?: boolean;
};

export function EditableCell({ rowId, syncId, field, value, type, isEdited }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => updateSheetRowField(rowId, field, draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheet-rows', syncId] });
      setEditing(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // Links come from the source sheet — read-only, not editable
  if (type === 'url' || type === 'email') {
    return <SmartCell value={value} type={type} />;
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        className='h-7 min-w-[80px] px-2 text-sm'
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== value) mutation.mutate();
          else setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (draft !== value) mutation.mutate();
            else setEditing(false);
          }
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setDraft(value);
          setEditing(true);
        }
      }}
      className={`cursor-pointer rounded px-1 py-0.5 hover:bg-muted/60 ${
        isEdited ? 'text-blue-600 dark:text-blue-400' : ''
      }`}
      title={isEdited ? 'Editado localmente' : 'Clic para editar'}
    >
      <SmartCell value={value} type={type} />
    </div>
  );
}
