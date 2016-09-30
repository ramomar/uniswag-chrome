/*
 Note that this script will run in an iframe with the url
 {http, https}://wildcard/App/Programa%20Analitico%20Nuevo%20Modelo/
 CalendarioAlumno/wfCalendarioEstructura.aspx
*/

const Endpoints = {
  dev:  'http://localhost:8080/assignments/callback',
  prod: 'https://uniswag.herokuapp.com/assignments/callback'
};

const Scraping = (function () {

  function extractEvents(eventsSource) {
    const rgx = /\[{.*]/g;
    return eval(eventsSource.match(rgx)[0]);
  }

  function makeAssignment(event) {
    return {
      title:   event.title,
      dueDate: moment(event.end)
    };
  }

  function isPending(assignment) {
    return assignment.dueDate.isAfter(new Date());
  }

  return {
    assignments: (eventsSource) =>
      extractEvents(eventsSource).map(makeAssignment),
    pendingAssignments: (eventsSource) =>
      extractEvents(eventsSource).map(makeAssignment).filter(isPending)
  }
}());

const Serialization = (function () {

  // psv: pipe separated values lol
  function assignmentAsPsv(assignment) {
    const dueDate = assignment.dueDate.format('YYYY-MM-DD[T]HH:mmZ');
    return `${assignment.title}|${dueDate}`;
  }

  function makeInputFromAssignment(assignment) {
    return $('<input>', {
      type: 'hidden',
      name: 'assignments',
      value: assignmentAsPsv(assignment)
    });
  }

  function makeInputFromSubjectName(subjectName) {
    return $('<input>', {
      type: 'hidden',
      name: 'subject',
      value: subjectName
    });
  }

  function makeForm(assignments, projectName, url) {
    const form = $('<form>', {
      action: url,
      method: 'POST',
      target: '_blank'
    });

    form.append(makeInputFromSubjectName(projectName));

    assignments
      .map(makeInputFromAssignment)
      .forEach(a => form.append(a));

    return form;
  }

  return {
    makeForm
  }
}());

const UI = (function () {

  function makeExportButton(onClick) {
    return $('<input>', {
      type:  'button',
      value: 'Exportar a Todoist',
      class: 'btn btn-danger',
      click: onClick
    });
  }

  function placeButton(onClick) {

    const header = $('.calendario-contenido-encabezado div').first();

    if (header.length > 0) {
      const btn = makeExportButton(onClick).css('margin-left', '20px');
      header.append(btn);
    } else {
      const btn       = makeExportButton(onClick);
      const container = $('<div class="calendario-contenido-encabezado">');

      container.append($('<div>').append(btn));
      $('.calendario-contenido').prepend(container);
    }
  }

  function askForSubjectName() {
    return window
      .prompt("¿Cómo se va a llamar el proyecto?", "Tareas de Nexus");
  }

  return {
    placeButton,
    askForSubjectName
  };
}());

const Heuristics = (function () {

  function nodeListToArray(list) {
    return [].slice.call(list);
  }

  function innerHtml(node) {
    return node.innerHTML;
  }

  function looksLikeCalendarScript(str) {
    return str.includes('events');
  }

  function searchEventsSource(scriptElements) {
    return nodeListToArray(scriptElements)
      .map(innerHtml)
      .filter(looksLikeCalendarScript)[0];
  }

  return {
    searchEventsSource
  };
}());

UI.placeButton(() => {

  const isDev = localStorage.getItem('dev') === 'dev';

  const url = isDev ? Endpoints.dev : Endpoints.prod;

  const scriptElements = document.getElementsByTagName('script');
  const eventsSource   = Heuristics.searchEventsSource(scriptElements);
  const assignments    = Scraping.pendingAssignments(eventsSource);
  const subjectName    = UI.askForSubjectName();
  const form           = Serialization.makeForm(assignments, subjectName, url);

  if (isDev) {
    console.log({subjectName});
    assignments.forEach(console.log);
    form.serializeArray().forEach(console.log);
  }

  form.submit();
});

