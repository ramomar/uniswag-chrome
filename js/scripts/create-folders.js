/*
 Note that this script will run in an iframe with the url
 {http, https}://deimos.dgi.uanl.mx/cgi-bin/wspd_cgi.sh/control.p*
 */

const Lang = {
  exportButtonText: 'Crear carpetas en Drive'
};

const Endpoints = {
  dev:  'http://localhost:8080/folders',
  prod: 'https://uniswag.herokuapp.com/folders'
};

const Scraping = (function () {

    function isShortNameCell(index) {
      return index % 2 === 0;
    }

    function extractRootFolderName(rootFolderNameSource) {

      function makeRootFolderName(str) {
        const components = str.replace('&nbsp;', '').split(/-|\s/);

        return components[0].substr(0, 3) + '-' +
          components[1].substr(0, 3) + ' ' +
          components[2];
      }

      const nameSource =
        [].slice.call(rootFolderNameSource).map(e => e.innerHTML)[0];

      return makeRootFolderName(nameSource);
    }

    function extractSubjects(subjectsSource) {
      return [].slice.call(subjectsSource)
        .filter((e, idx) => isShortNameCell(idx))
        .map(e => e.innerHTML);
    }

    return {
      extractSubjects,
      extractRootFolderName
    };
}());

const Serialization = (function () {

  function makeInputFromSubject(subject) {
    return $('<input>', {
      type: 'hidden',
      name: 'subjects',
      value: subject
    });
  }

  function makeInputFromRootFolderName(rootFolderName) {
    return $('<input>', {
      type: 'hidden',
      name: 'rootFolderName',
      value: rootFolderName
    });
  }

  function makeForm(subjects, rootFolderName, url) {
    const form = $('<form>', {
      action: url,
      method: 'POST',
      target: '_blank'
    });

    form.append(makeInputFromRootFolderName(rootFolderName));

    subjects
      .map(makeInputFromSubject)
      .forEach(s => form.append(s));

    return form;
  }

  return {
    makeForm
  };
})();

const UI = (function () {

  function makeExportButton(onClick) {
    return $('<input>', {
      type: 'button',
      value: Lang.exportButtonText,
      class: 'export-btn',
      click: onClick
    });
  }

  function placeButton(onClick) {
    const btn       = makeExportButton(onClick);
    const container = $('<td>');

    container.append(btn);
    $('#id_rpPnlEst td').prepend(container);
  }

  return {
    placeButton
  };
}());

const Heuristics = (function () {
  function isScheduleFrame() {
    return [].slice.call($('.rpTtlSub'))
      .some(e => e.innerHTML.includes('Consulta de Horario'));
  }

  return {
    isScheduleFrame
  };
})();


if (Heuristics.isScheduleFrame()) {

  UI.placeButton(() => {

    const isDev = localStorage.getItem('dev') === 'dev';

    const url = isDev ? Endpoints.dev : Endpoints.prod;

    const subjectsSource =
      document.querySelectorAll('[align=left][valign=MIDDLE]');
    const rootFolderNameSource = document.getElementsByClassName('rpSdLbVlr');

    const subjects       = Scraping.extractSubjects(subjectsSource);
    const rootFolderName = Scraping.extractRootFolderName(rootFolderNameSource);
    const form           = Serialization.makeForm(subjects,rootFolderName, url);

    if (isDev) {
      console.log(subjects);
      subjects.forEach(console.log);
      form.serializeArray().forEach(console.log);
    }

    form.submit();
  });
}
