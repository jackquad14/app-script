function compararMudancas(mapaCol, linhaAntiga, novaLinha, headers) {
  const mudancas = [];

  // 🔹 Campos que DEVEM ser comparados
  const camposComparar = new Set([
    "Título",
    "Início",
    "Fim",
    "Última atualização",
    "Participantes"
  ]);

  headers.forEach(coluna => {

    // 🔹 agora só processa se estiver na lista
    if (!camposComparar.has(coluna)) return;

    const idx = mapaCol[coluna];
    if (idx === undefined) return;

    let antigo = linhaAntiga[idx];
    let novo = novaLinha[idx];

    // 🔹 normalização geral
    antigo = normalizarValor(antigo);
    novo = normalizarValor(novo);

    if (antigo !== novo) {
      mudancas.push({
        campo: coluna,
        de: antigo,
        para: novo
      });
    }
  });

  return mudancas;
}

function normalizarValor(valor) {
  if (valor === null || valor === undefined) return "";

  // datas
  if (valor instanceof Date) {
    return valor.getTime();
  }

  // strings com espaços
  if (typeof valor === "string") {
    return valor.trim();
  }

  return valor;
}