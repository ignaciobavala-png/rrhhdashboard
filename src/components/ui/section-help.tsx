'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SectionHelpProps {
  title: string;
  children: React.ReactNode;
}

export function SectionHelp({ title, children }: SectionHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-5 text-muted-foreground/50 hover:text-foreground -mr-1'
        >
          <Icons.help className='size-3.5' />
          <span className='sr-only'>Ayuda: {title}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 text-sm p-3'>
        <div className='space-y-1.5'>
          <h4 className='font-medium text-sm leading-none'>{title}</h4>
          <div className='text-muted-foreground text-xs leading-relaxed'>{children}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
