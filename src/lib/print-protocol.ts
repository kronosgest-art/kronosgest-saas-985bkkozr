import { supabase } from '@/lib/supabase/client'

export async function printProtocol(protocol: any, userId: string) {
  const { data: prof } = await supabase
    .from('profissionais')
    .select('*, organizations(*)')
    .eq('user_id', userId)
    .single()

  const org = prof?.organizations

  const html = `
    <html>
      <head>
        <title>Protocolo - ${protocol.nome}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { max-width: 180px; max-height: 80px; object-fit: contain; }
          .org-info { text-align: right; font-size: 13px; color: #555; }
          .title { color: #1E3A8A; font-size: 26px; font-weight: bold; margin-bottom: 5px; }
          .meta { font-size: 14px; color: #666; margin-bottom: 30px; padding-bottom: 10px; border-bottom: 1px dashed #eee; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #1E3A8A; text-transform: uppercase; }
          .content { white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .alert-content { white-space: pre-wrap; font-size: 14px; background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fecaca; color: #991b1b; }
          .footer { margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #888; }
          .signature { margin-top: 80px; text-align: center; }
          .signature-line { width: 300px; border-bottom: 1px solid #333; margin: 0 auto 10px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${org?.logo_url ? `<img src="${org.logo_url}" class="logo" />` : '<h2 style="color:#1E3A8A;margin:0;">DOCUMENTO CLÍNICO</h2>'}
          </div>
          <div class="org-info">
            <strong style="font-size:16px;color:#1E3A8A;">${org?.nome || 'Clínica Integrativa'}</strong><br/>
            ${org?.cnpj ? `CNPJ: ${org.cnpj}<br/>` : ''}
            ${org?.telefone ? `Tel: ${org.telefone}<br/>` : ''}
            ${org?.endereco ? `${org.endereco}` : ''}
          </div>
        </div>

        <div class="title">${protocol.nome}</div>
        <div class="meta">
          <strong>Tipo:</strong> ${protocol.tipo || 'Geral'} &nbsp;|&nbsp; <strong>Duração:</strong> ${protocol.duracao || 'Contínuo'}
        </div>

        ${
          protocol.descricao
            ? `
        <div class="section">
          <div class="section-title">Objetivo do Protocolo</div>
          <div class="content">${protocol.descricao}</div>
        </div>`
            : ''
        }

        <div class="section">
          <div class="section-title">Fórmula e Posologia</div>
          <div class="content">${protocol.suplementos || 'Nenhuma fórmula especificada.'}</div>
        </div>

        ${
          protocol.contraindicacoes
            ? `
        <div class="section">
          <div class="section-title">Contraindicações e Alertas</div>
          <div class="alert-content">${protocol.contraindicacoes}</div>
        </div>`
            : ''
        }

        <div class="signature">
          <div class="signature-line"></div>
          <strong style="font-size:16px;">${prof?.nome_completo || 'Profissional Responsável'}</strong><br/>
          <span style="color:#666;">${prof?.especialidade || 'Medicina Integrativa'}</span><br/>
          <span style="color:#666;">${prof?.tipo_registro || 'Registro'}: ${prof?.numero_registro || prof?.cpf || 'Não informado'}</span>
        </div>

        <div class="footer">
          Emitido em ${new Date().toLocaleDateString('pt-BR')} - Este documento é de uso exclusivo e intransferível.
        </div>
        <script>
          window.onload = () => { 
            setTimeout(() => { window.print(); window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}
