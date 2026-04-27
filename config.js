const CONFIG = {
  ABAS: {
    ATUAL: "AGENDA_ATUAL",
    HIST: "HISTORICO",

    // ⭐ MODELO ESTRELA
    FATO: "FATO_REUNIOES",
    DIM_TEMPO: "DIM_TEMPO",
    DIM_TIPO: "DIM_TIPO",
    DIM_TREINADOR: "DIM_TREINADOR",
    DIM_CLIENTE: "DIM_CLIENTE",
    FATO_TREINADOR: "FATO_REUNIAO_TREINADOR"
  }
};

const HEADERS = [
  "ID",
  "Tipo Reunião",
  "Título",
  "Treinador",
  "Início",
  "Fim",
  "Data",
  "Ano",
  "Mês",
  "Ano-Mês",
  "Semana",
  "Dia Semana",
  "Criado em",
  "Última atualização",
  "Mesmo dia",
  "Horas antecedência",
  "Classificação",
  "Duração (M)",
  "Duração (H)",
  "Organizador",
  "Participantes"
];

const HEADERS_HIST = [
  "Data Log",
  "Tipo",
  "Alterações",
  ...HEADERS
];