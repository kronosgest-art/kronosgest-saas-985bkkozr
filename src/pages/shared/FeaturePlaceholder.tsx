import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

export default function FeaturePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center p-4 animate-fade-in-up">
      <Card className="w-full max-w-md text-center border-primary/20 shadow-elevation">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
            <Construction className="h-8 w-8 text-secondary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            Esta funcionalidade está atualmente em desenvolvimento e estará disponível em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden mt-4">
            <div className="h-full w-1/3 rounded-full bg-secondary animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
