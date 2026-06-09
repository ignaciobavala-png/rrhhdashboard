import { Icons } from '@/components/icons';

type Props = {
  tabName: string;
  suggestedSection: string;
};

export function SectionSuggestionBanner({ tabName, suggestedSection }: Props) {
  return (
    <div className='bg-muted/60 flex items-start gap-2 rounded-md px-3 py-2 text-sm'>
      <Icons.sparkles className='text-muted-foreground mt-0.5 h-4 w-4 shrink-0' />
      <p className='text-muted-foreground'>
        La pestaña <span className='text-foreground font-medium'>"{tabName}"</span> parece
        corresponder a <span className='text-foreground font-medium'>{suggestedSection}</span>. Si
        esta sección no existe en el dashboard, los datos quedan disponibles aquí.
      </p>
    </div>
  );
}
