function obterOuCriarAba(nome) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName(nome);

  if (!aba) {
    aba = ss.insertSheet(nome);

    // 🔒 Oculta automaticamente se for técnica
    if (isAbaTecnica(nome)) {
      aba.hideSheet();
    }
  }

  return aba;
}

function isAbaTecnica(nome) {
  const abasTecnicas = [
    CONFIG.ABAS.FATO,
    CONFIG.ABAS.DIM_TEMPO,
    CONFIG.ABAS.DIM_TIPO,
    CONFIG.ABAS.DIM_TREINADOR,
    CONFIG.ABAS.DIM_CLIENTE,
    CONFIG.ABAS.FATO_TREINADOR
  ];

  return abasTecnicas.includes(nome);
}