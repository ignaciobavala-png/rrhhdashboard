'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface EditableSectionProps {
  icon: React.ReactNode;
  title: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  saving?: boolean;
  children: React.ReactNode;
  editMode?: boolean;
}

export function EditableSection({
  icon,
  title,
  editing,
  onEdit,
  onCancel,
  onSave,
  saving,
  children
}: EditableSectionProps) {
  return (
    <Card className='relative'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          {icon}
          {title}
        </CardTitle>
        <div className='flex gap-1'>
          {editing ? (
            <>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={onCancel}
                disabled={saving}
              >
                <Icons.close className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='default'
                size='icon'
                className='h-7 w-7'
                onClick={onSave}
                disabled={saving}
              >
                <Icons.check className='h-3.5 w-3.5' />
              </Button>
            </>
          ) : (
            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={onEdit}>
              <Icons.edit className='h-3.5 w-3.5' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3 text-sm'>{children}</CardContent>
    </Card>
  );
}
