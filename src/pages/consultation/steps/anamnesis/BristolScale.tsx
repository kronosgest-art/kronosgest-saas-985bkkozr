import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface BristolScaleProps {
  value: string
  onChange: (val: string) => void
}

export function BristolScale({ value, onChange }: BristolScaleProps) {
  const options = [
    { val: 'Tipo 1', desc: 'Bolinhas duras', color: 'bg-amber-800' },
    { val: 'Tipo 2', desc: 'Cilindro duro', color: 'bg-amber-700' },
    { val: 'Tipo 3', desc: 'Cilindro com fissuras', color: 'bg-amber-600' },
    { val: 'Tipo 4', desc: 'Cilindro suave (Normal)', color: 'bg-amber-500' },
    { val: 'Tipo 5', desc: 'Bolinhas macias', color: 'bg-amber-400' },
    { val: 'Tipo 6', desc: 'Pedaços macios', color: 'bg-amber-300' },
    { val: 'Tipo 7', desc: 'Líquido', color: 'bg-amber-200' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mt-3">
      {options.map((opt) => (
        <Tooltip key={opt.val}>
          <TooltipTrigger asChild>
            <div
              onClick={() => onChange(opt.val)}
              className={cn(
                'cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-2 transition-all hover:border-primary/50',
                value === opt.val
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card',
              )}
            >
              <div className={cn('w-6 h-6 rounded-full', opt.color)}></div>
              <span className="text-xs font-medium leading-tight">{opt.val}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {opt.val}: {opt.desc}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
