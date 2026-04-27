function isMesmoDia(data1, data2) {
  return data1.getFullYear() === data2.getFullYear() &&
         data1.getMonth() === data2.getMonth() &&
         data1.getDate() === data2.getDate();
}

function getAno(data) {
  return data.getFullYear();
}

function getMes(data) {
  return data.getMonth() + 1;
}

function getAnoMes(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

function getDiaSemana(data) {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  return dias[data.getDay()];
}

function getSemanaAno(data) {
  const primeiroDia = new Date(data.getFullYear(), 0, 1);
  const dias = Math.floor((data - primeiroDia) / (24 * 60 * 60 * 1000));
  return Math.ceil((dias + primeiroDia.getDay() + 1) / 7);
}