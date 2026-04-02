import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BristolScale } from './BristolScale'
import { getTooltipText } from './utils'

interface QuestionFieldProps {
  item: any
  answer: any
  onChange: (id: string, val: any) => void
  isError: boolean
  isSuccess: boolean
}

export function QuestionField({ item, answer, onChange, isError, isSuccess }: QuestionFieldProps) {
  const tooltip = getTooltipText(item.id)
  const isCalculated = item.id === 'dp_imc' || item.id === 'dp_rcq'

  return (
    <div
      className={cn(
        'p-5 rounded-xl border transition-all',
        isError
          ? 'border-destructive bg-destructive/5'
          : 'border-border hover:border-primary/20 bg-card',
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <Label className="text-base font-medium flex items-center gap-2 flex-wrap">
          {item.titulo}
          {item.obrigatoria && <span className="text-destructive">*</span>}
          {isCalculated && (
            <span className="text-xs text-muted-foreground font-normal">(Auto)</span>
          )}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </Label>
        {isSuccess && !isError && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
        {isError && <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
      </div>

      {item.id === 'av_gastro_bristol' ? (
        <BristolScale value={answer || ''} onChange={(val) => onChange(item.id, val)} />
      ) : item.tipo === 'text' ||
        item.tipo === 'date' ||
        item.tipo === 'number' ||
        item.tipo === 'email' ||
        item.tipo === 'tel' ? (
        <input
          type={item.tipo === 'number' ? 'text' : item.tipo}
          inputMode={item.tipo === 'number' ? 'decimal' : undefined}
          placeholder={item.placeholder || 'Sua resposta...'}
          value={answer || ''}
          readOnly={isCalculated}
          onChange={(e) => onChange(item.id, e.target.value)}
          className={cn(
            'flex h-11 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors',
            isCalculated ? 'bg-muted text-muted-foreground cursor-default' : 'bg-background',
          )}
        />
      ) : item.tipo === 'textarea' || (!item.tipo && item.tipo !== 'section') ? (
        <Textarea
          placeholder={item.placeholder || 'Descreva aqui...'}
          value={answer || ''}
          onChange={(e) => onChange(item.id, e.target.value)}
          className="min-h-[100px] text-base resize-y"
        />
      ) : item.tipo === 'select' && item.opcoes ? (
        <Select value={answer || ''} onValueChange={(val) => onChange(item.id, val)}>
          <SelectTrigger className="w-full sm:w-[300px] h-11">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {item.opcoes.map((op: string, i: number) => (
              <SelectItem key={i} value={op}>
                {op}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : item.tipo === 'radio' && item.opcoes ? (
        <RadioGroup
          value={answer || ''}
          onValueChange={(val) => onChange(item.id, val)}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2"
        >
          {item.opcoes.map((op: string, i: number) => (
            <div
              key={i}
              className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
              onClick={() => onChange(item.id, op)}
            >
              <RadioGroupItem value={op} id={`${item.id}-op-${i}`} />
              <Label htmlFor={`${item.id}-op-${i}`} className="font-medium cursor-pointer text-sm">
                {op}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : item.tipo === 'checkbox' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {item.opcoes && item.opcoes.length > 0 ? (
            item.opcoes.map((op: string, i: number) => {
              const isChecked = (answer || []).includes(op)
              return (
                <div
                  key={i}
                  className="flex items-start space-x-3 bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                >
                  <Checkbox
                    id={`${item.id}-cb-${i}`}
                    checked={isChecked}
                    className="mt-0.5 w-5 h-5"
                    onCheckedChange={(checked) => {
                      const currentArr = answer || []
                      const newArr = checked
                        ? [...currentArr, op]
                        : currentArr.filter((v: string) => v !== op)
                      onChange(item.id, newArr)
                    }}
                  />
                  <Label
                    htmlFor={`${item.id}-cb-${i}`}
                    className="font-medium text-sm leading-snug cursor-pointer"
                  >
                    {op}
                  </Label>
                </div>
              )
            })
          ) : (
            <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded-lg">
              <Checkbox
                id={`${item.id}-cb-single`}
                checked={answer === 'Sim' || answer === true}
                className="w-5 h-5"
                onCheckedChange={(checked) => onChange(item.id, checked ? 'Sim' : 'Não')}
              />
              <Label
                htmlFor={`${item.id}-cb-single`}
                className="cursor-pointer text-sm font-medium"
              >
                Sim
              </Label>
            </div>
          )}
        </div>
      ) : null}

      {isError && (
        <p className="text-sm text-destructive mt-3 font-medium animate-in fade-in slide-in-from-top-1">
          Este campo é obrigatório e precisa ser preenchido.
        </p>
      )}
    </div>
  )
}
