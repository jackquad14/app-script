function createScheduleTrigger() {
  // Remove old triggers (avoid duplication)
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === "syncCalendar") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger (every 30 minutes)
  ScriptApp.newTrigger("syncCalendar")
    .timeBased()
    .everyMinutes(30)
    .create();
}

function syncCalendar() {
  ensureAllSheets();
  hideTechnicalSheets();

  const currentSheet = getOrCreateSheet(CONFIG.SHEETS.CURRENT);
  const historySheet = getOrCreateSheet(CONFIG.SHEETS.HISTORY);

  // Ensure headers
  const currentHeaders = ensureHeader(currentSheet, HEADERS);
  const historyHeaders = ensureHeader(historySheet, HEADERS_HISTORY);

  const currentColMap = mapColumns(currentHeaders);
  const historyColMap = mapColumns(historyHeaders);

  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  const events = CalendarApp.getDefaultCalendar().getEvents(start, end);

  const currentData = currentSheet.getDataRange().getValues();
  const currentMap = {};

  // Map by ID
  for (let i = 1; i < currentData.length; i++) {
    const row = currentData[i];
    const id = row[currentColMap["ID"]];
    currentMap[id] = { row, index: i + 1, seen: false };
  }

  events.forEach(event => {
    const id = event.getId();

    const startEvent = event.getStartTime();
    const endEvent = event.getEndTime();
    const created = event.getDateCreated();
    const lastUpdated = event.getLastUpdated();

    const sameDay = isSameDay(startEvent, created);

    const hoursBefore = Math.round((startEvent - created) / (1000 * 60 * 60));

    let classification = "";
    if (sameDay) classification = "LAST_MINUTE";
    else if (hoursBefore < 24) classification = "SHORT_TERM";
    else classification = "PLANNED";

    const durationMin = (endEvent - startEvent) / 60000;

    const participants = event.getGuestList()
      .map(g => g.getEmail())
      .join(", ");

    const organizer = event.getCreators().join(", ");

    const dataObj = {
      "ID": id,
      "Title": event.getTitle(),
      "MeetingType": extractMeetingType(event.getTitle()),
      "Trainer": extractTrainers(event.getTitle()),
      "Start": startEvent,
      "End": endEvent,

      // New fields
      "Date": new Date(startEvent.getFullYear(), startEvent.getMonth(), startEvent.getDate()),
      "Year": getYear(startEvent),
      "Month": getMonth(startEvent),
      "YearMonth": getYearMonth(startEvent),
      "Week": getWeekOfYear(startEvent),
      "DayOfWeek": getDayOfWeek(startEvent),

      "CreatedAt": created,
      "LastUpdate": lastUpdated,
      "SameDay": sameDay ? "YES" : "NO",
      "HoursBefore": hoursBefore,
      "Classification": classification,
      "DurationMin": durationMin,
      "DurationHour": durationMin / 60,
      "Organizer": organizer,
      "Participants": participants
    };

    const newRow = buildRow(currentColMap, dataObj);
    const existing = currentMap[id];

    if (!existing) {
      // NEW
      currentSheet.appendRow(newRow);

      const historyRow = buildRow(historyColMap, {
        "LogDate": new Date(),
        "Type": "CREATED",
        ...dataObj
      });

      historySheet.appendRow(historyRow);

    } else {
      existing.seen = true;

      const oldRow = existing.row;

      const changes = compareChanges(currentColMap, oldRow, newRow, currentHeaders);
      const changed = changes.length > 0;

      if (changed) {
        const changeDescription = changes.map(c =>
          `${c.field}: "${c.from}" -> "${c.to}"`
        ).join(" | ");

        const historyRow = buildRow(historyColMap, {
          "LogDate": new Date(),
          "Type": "UPDATED",
          "Changes": changeDescription,
          ...dataObj
        });

        historySheet.appendRow(historyRow);

        currentSheet.getRange(existing.index, 1, 1, newRow.length)
          .setValues([newRow]);
      }
    }
  });

  // DELETED
  const idsToDelete = Object.keys(currentMap)
    .filter(id => !currentMap[id].seen)
    .sort((a, b) => currentMap[b].index - currentMap[a].index);

  idsToDelete.forEach(id => {
    const item = currentMap[id];

    const oldData = {};

    Object.keys(currentColMap).forEach(col => {
      oldData[col] = item.row[currentColMap[col]];
    });

    const historyRow = buildRow(historyColMap, {
      "LogDate": new Date(),
      "Type": "DELETED",
      ...oldData
    });

    historySheet.appendRow(historyRow);

    currentSheet.deleteRow(item.index);
  });

  createStarSchema();
}
