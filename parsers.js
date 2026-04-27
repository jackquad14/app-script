function extrairTreinadores(titulo) {
  if (!titulo) return "";

  const txt = titulo.toUpperCase();

  // dicionário (sinônimos → nome padrão)
  const mapa = {
    "JACKELINE": "Jackeline",
    "JAQUELINE": "Jackeline",
    "JACKLINE": "Jackeline",
    "J.D": "Jackeline",
    "YASMIN": "Yasmin",
    "YASMIM": "Yasmin",
    "JACKSON": "Jackson",
    "JACKCSON": "Jackson",
    "J.C": "Jackson",
    "RYAN": "Ryan",
    "EZEQUIEL": "Ezequiel",
    "JEAN": "Jean"
  };

  const encontrados = new Set();

  Object.keys(mapa).forEach(chave => {
    if (txt.includes(chave)) {
      encontrados.add(mapa[chave]);
    }
  });

  return [...encontrados].join(", ");
}

function extrairTipoReuniao(titulo) {
  if (!titulo) return "";

  const txt = titulo.toUpperCase();

  // dicionário (palavra-chave → tipo padrão)
  const mapa = {
    "EMISS": "EMISSÃO NF",
    "PLANO": "PLANOS",
    "CRONOGRAMA": "CRONOGRAMA",
    "ALINH": "ALINHAMENTO",
    "COMODATO": "COMODATO",
    "ESTOQUE": "ESTOQUE",
    "INTEGRA": "INTEGRACAO",
    "FINANCEI": "FINANCEIRO",
    "TRIBUT": "TRIBUTÁRIO",
    "CONTA AZUL": "CONTA AZUL",
    "APRES": "APRESENTAÇÃO",
    "FATURAM": "FATURAMENTO NF",
    "ANALISE FISCAL": "ANÁLISE FISCAL",
    "ANÁLISE FISCAL": "ANÁLISE FISCAL",
    "MIGRAÇÃO": "MIGRAÇÃO",
    "DUVIDAS": "DUVIDAS",
    "NOTAS FISCAIS": "NF",
    "TREINAMENTO NF": "NF",
    "AJUSTE CAIXA": "AJUSTE CAIXA",
    "MUDANÇA DE REGIME": "MUDANÇA DE REGIME",
  };

  const encontrados = new Set();

  Object.keys(mapa).forEach(chave => {
    if (txt.includes(chave)) {
      encontrados.add(mapa[chave]);
    }
  });

  return [...encontrados].join(", ");
}

function extrairCliente(titulo) {
  if (!titulo) return "SEM CLIENTE";

  const txt = titulo.toUpperCase();

  const mapa = {
    "FIBRAS DO RIOS": "Fibras do Rios",
    "FIBRAS RIOS": "Fibras do Rios",
    "WEB NET": "Web Net",
    "CANAÃ": "Canaã",
    "ONIX": "Onix",
    "PORTAL NET": "Portal Net",
    "4L FIBRA": "4L Fibra"
  };

  for (const chave in mapa) {
    if (txt.includes(chave)) {
      return mapa[chave];
    }
  }

  return "SEM CLIENTE";
}