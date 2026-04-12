DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Tentar pegar o ID do admin se existir para vincular o protocolo caso necessário
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'dra.morganavieira@gmail.com' LIMIT 1;

  IF NOT EXISTS (
    SELECT 1 FROM public.protocolos WHERE nome = 'Dor Zero com Ozonioterapia'
  ) THEN
    INSERT INTO public.protocolos (
      id, nome, indicacao, numero_sessoes, tipo_aplicacao, frequencia, duracao_sessao,
      valor_total, valor_sessao_avulsa, beneficios_esperados, tipo_tcle, apenas_pacote_fechado, user_id, is_padrao
    ) VALUES (
      gen_random_uuid(),
      'Dor Zero com Ozonioterapia',
      'Tratamento para alívio de dores crônicas',
      10,
      'Injeção muscular + ozônio retal',
      '2x/semana',
      '45 minutos',
      1200.00,
      150.00,
      'Alívio imediato da dor, redução de inflamação',
      'TCLE Ozonioterapia',
      false,
      v_admin_id,
      true
    );
  END IF;
END $$;
