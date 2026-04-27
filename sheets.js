// 🔹 Garante header
function garantirHeader(sheet, headers) {
  const primeiraLinha = sheet.getRange(1, 1, 1, headers.length).getValues()[0];

  const vazio = primeiraLinha.every(c => !c);

  if (vazio) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return headers;
  }

  return primeiraLinha;
}

function garantirTodasAbas() {
  Object.values(CONFIG.ABAS).forEach(nome => {
    obterOuCriarAba(nome);
  });
}

// 🔹 Cria mapa de colunas
function mapearColunas(headers) {
  const mapa = {};
  headers.forEach((h, i) => {
    mapa[h] = i;
  });
  return mapa;
}

// 🔹 Monta linha baseada no header
function montarLinha(mapa, dados) {
  const linha = new Array(Object.keys(mapa).length).fill("");

  Object.keys(dados).forEach(campo => {
    if (mapa[campo] !== undefined) {
      linha[mapa[campo]] = dados[campo];
    }
  });

  return linha;
}

function obterOuCriarAba(nome) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName(nome);

  if (!aba) {
    aba = ss.insertSheet(nome);
  }

  return aba;
}

function ocultarAbasTecnicas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.values(CONFIG.ABAS).forEach(nome => {

    const aba = ss.getSheetByName(nome);
    if (!aba) return;

    const ehTecnica = isAbaTecnica(nome);

    if (ehTecnica && !aba.isSheetHidden()) {
      aba.hideSheet();
    }
  });
}