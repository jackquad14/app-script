function criarModeloEstrela() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const abas = {
    fato: obterOuCriarAba(CONFIG.ABAS.FATO),
    tempo: obterOuCriarAba(CONFIG.ABAS.DIM_TEMPO),
    tipo: obterOuCriarAba(CONFIG.ABAS.DIM_TIPO),
    treinador: obterOuCriarAba(CONFIG.ABAS.DIM_TREINADOR),
    cliente: obterOuCriarAba(CONFIG.ABAS.DIM_CLIENTE),
    relTreinador: obterOuCriarAba(CONFIG.ABAS.FATO_TREINADOR)
  };

  // 🔹 HEADERS
  abas.fato.clear().appendRow([
    "ID",
    "Data Key",
    "Tipo Key",
    "Cliente Key",
    "Horas antecedência",
    "Classificação",
    "Duração (H)"
  ]);

  abas.tempo.clear().appendRow([
    "Data Key",
    "Data",
    "Ano",
    "Mês",
    "Ano-Mês",
    "Semana",
    "Dia Semana"
  ]);

  abas.tipo.clear().appendRow(["Tipo Key", "Tipo"]);
  abas.treinador.clear().appendRow(["Treinador Key", "Nome"]);
  abas.cliente.clear().appendRow(["Cliente Key", "Nome"]);
  abas.relTreinador.clear().appendRow(["ID", "Treinador Key"]);

  // 🔹 origem
  const origem = ss.getSheetByName("AGENDA_ATUAL");
  const dados = origem.getDataRange().getValues();
  const headers = dados[0];

  const map = {};
  headers.forEach((h, i) => map[h] = i);

  // 🔹 caches
  const dimTempo = new Map();
  const dimTipo = new Map();
  const dimTreinador = new Map();
  const dimCliente = new Map();

  let tipoId = 1;
  let treinadorId = 1;
  let clienteId = 1;

  const fatos = [];
  const tempos = [];
  const relTreinadores = [];

  for (let i = 1; i < dados.length; i++) {
    const linha = dados[i];

    const id = linha[map["ID"]];
    const data = linha[map["Data"]];
    const tipo = linha[map["Tipo Reunião"]];
    const cliente = extrairCliente(linha[map["Título"]]);
    const treinadores = linha[map["Treinador"]];

    // 🔹 DATA KEY
    const dataKey = Utilities.formatDate(data, Session.getScriptTimeZone(), "yyyyMMdd");

    if (!dimTempo.has(dataKey)) {
      dimTempo.set(dataKey, true);

      tempos.push([
        dataKey,
        data,
        linha[map["Ano"]],
        linha[map["Mês"]],
        linha[map["Ano-Mês"]],
        linha[map["Semana"]],
        linha[map["Dia Semana"]]
      ]);
    }

    // 🔹 TIPO
    if (!dimTipo.has(tipo)) {
      dimTipo.set(tipo, tipoId++);
    }

    // 🔹 CLIENTE
    if (!dimCliente.has(cliente)) {
      dimCliente.set(cliente, clienteId++);
    }

    // 🔹 FATO
    fatos.push([
      id,
      dataKey,
      dimTipo.get(tipo),
      dimCliente.get(cliente),
      linha[map["Horas antecedência"]],
      linha[map["Classificação"]],
      linha[map["Duração (H)"]]
    ]);

    // 🔹 TREINADORES (N:N)
    if (treinadores) {
      treinadores.split(",").forEach(nome => {
        const n = nome.trim();

        if (!dimTreinador.has(n)) {
          dimTreinador.set(n, treinadorId++);
        }

        relTreinadores.push([
          id,
          dimTreinador.get(n)
        ]);
      });
    }
  }

  // 🔹 escrever dimensões
  abas.tempo.getRange(2, 1, tempos.length, tempos[0].length).setValues(tempos);

  abas.tipo.getRange(2, 1, dimTipo.size, 2)
    .setValues([...dimTipo.entries()].map(([k, v]) => [v, k]));

  abas.cliente.getRange(2, 1, dimCliente.size, 2)
    .setValues([...dimCliente.entries()].map(([k, v]) => [v, k]));

  abas.treinador.getRange(2, 1, dimTreinador.size, 2)
    .setValues([...dimTreinador.entries()].map(([k, v]) => [v, k]));

  abas.fato.getRange(2, 1, fatos.length, fatos[0].length).setValues(fatos);

  if (relTreinadores.length > 0) {
    abas.relTreinador.getRange(2, 1, relTreinadores.length, 2)
      .setValues(relTreinadores);
  }
}