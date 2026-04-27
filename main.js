function criarTriggerAgenda() {
  // Remove triggers antigos da mesma funcao (evita duplicacao)
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === "sincronizarAgenda") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Cria novo trigger (a cada 5 minutos)
  ScriptApp.newTrigger("sincronizarAgenda")
    .timeBased()
    .everyMinutes(30)
    .create();
}

function sincronizarAgenda() {
  garantirTodasAbas();
  ocultarAbasTecnicas();

  const abaAtual = obterOuCriarAba(CONFIG.ABAS.ATUAL);
  const abaHistorico = obterOuCriarAba(CONFIG.ABAS.HIST);

  // Garantir headers
  const headersAtual = garantirHeader(abaAtual, HEADERS);
  const headersHist = garantirHeader(abaHistorico, HEADERS_HIST);

  const mapaAtualCol = mapearColunas(headersAtual);
  const mapaHistCol = mapearColunas(headersHist);

  const ano = new Date().getFullYear();
  const inicio = new Date(ano, 0, 1);
  const fim = new Date(ano, 11, 31);

  const eventos = CalendarApp.getDefaultCalendar().getEvents(inicio, fim);

  const dadosAtuais = abaAtual.getDataRange().getValues();
  const mapaAtual = {};

  // Mapear por ID
  for (let i = 1; i < dadosAtuais.length; i++) {
    const linha = dadosAtuais[i];
    const id = linha[mapaAtualCol["ID"]];
    mapaAtual[id] = { linha, index: i + 1, visto: false };
  }

  eventos.forEach(evento => {
    const id = evento.getId();

    const inicioEvento = evento.getStartTime();
    const fimEvento = evento.getEndTime();
    const criado = evento.getDateCreated();
    const ultimaAtualizacao = evento.getLastUpdated();

    const mesmoDia = isMesmoDia(inicioEvento, criado);

    const horasAntecedencia = Math.round((inicioEvento - criado) / (1000 * 60 * 60));

    let classificacao = "";
    if (mesmoDia) classificacao = "EM CIMA DA HORA";
    else if (horasAntecedencia < 24) classificacao = "CURTO PRAZO";
    else classificacao = "PLANEJADA";

    const duracao = (fimEvento - inicioEvento) / 60000;

    const participantes = evento.getGuestList()
      .map(g => g.getEmail())
      .join(", ");

    const organizador = evento.getCreators().join(", ");

    const dadosObj = {
      "ID": id,
      "Titulo": evento.getTitle(),
      "Tipo Reuniao": extrairTipoReuniao(evento.getTitle()),
      "Treinador": extrairTreinadores(evento.getTitle()),
      "Inocio": inicioEvento,
      "Fim": fimEvento,

      // NOVOS CAMPOS
      "Data": new Date(inicioEvento.getFullYear(), inicioEvento.getMonth(), inicioEvento.getDate()),
      "Ano": getAno(inicioEvento),
      "Mes": getMes(inicioEvento),
      "Ano-Mes": getAnoMes(inicioEvento),
      "Semana": getSemanaAno(inicioEvento),
      "Dia Semana": getDiaSemana(inicioEvento),

      "Criado em": criado,
      "Ultima atualizacao": ultimaAtualizacao,
      "Mesmo dia": mesmoDia ? "SIM" : "NAO",
      "Horas antecedencia": horasAntecedencia,
      "Classificacao": classificacao,
      "Duracao (M)": duracao,
      "Duracao (H)": duracao / 60,
      "Organizador": organizador,
      "Participantes": participantes
    };

    const novaLinha = montarLinha(mapaAtualCol, dadosObj);

    const existente = mapaAtual[id];

    if (!existente) {
      // NOVO
      abaAtual.appendRow(novaLinha);

      const histLinha = montarLinha(mapaHistCol, {
        "Data Log": new Date(),
        "Tipo": "CRIADO",
        ...dadosObj
      });

      abaHistorico.appendRow(histLinha);

    } else {
      existente.visto = true;

      const linhaAntiga = existente.linha;

      const mudancas = compararMudancas(mapaAtualCol, linhaAntiga, novaLinha, headersAtual);
      const mudou = mudancas.length > 0;

      if (mudou) {
        // monta descricao das mudancas
        const descricaoMudancas = mudancas.map(m =>
          `${m.campo}: "${m.de}" -> "${m.para}"`
        ).join(" | ");

        const histLinha = montarLinha(mapaHistCol, {
          "Data Log": new Date(),
          "Tipo": "ALTERADO",
          "Alterações": descricaoMudancas, // NOVO CAMPO
          ...dadosObj
        });

        abaHistorico.appendRow(histLinha);

        // atualiza so se mudou
        abaAtual.getRange(existente.index, 1, 1, novaLinha.length)
          .setValues([novaLinha]);
      }

    }
  });

  // EXCLUIDOS (corrigido)
  const idsParaExcluir = Object.keys(mapaAtual)
    .filter(id => !mapaAtual[id].visto)
    // ordena de baixo pra cima (evita bug ao deletar linhas)
    .sort((a, b) => mapaAtual[b].index - mapaAtual[a].index);

  idsParaExcluir.forEach(id => {
    const item = mapaAtual[id];

    const dadosAntigos = {};

    // monta objeto com base no header atual
    Object.keys(mapaAtualCol).forEach(coluna => {
      dadosAntigos[coluna] = item.linha[mapaAtualCol[coluna]];
    });

    // envia TUDO pro histórico
    const histLinha = montarLinha(mapaHistCol, {
      "Data Log": new Date(),
      "Tipo": "EXCLUIDO",
      ...dadosAntigos
    });

    abaHistorico.appendRow(histLinha);

    // remove da aba atual
    abaAtual.deleteRow(item.index);
  });

  criarModeloEstrela();
}
