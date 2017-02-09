/*
 Note that this script will run in an iframe with the url
 {http, https}://deimos.dgi.uanl.mx/cgi-bin/wspd_cgi.sh/control.p*
 */

const Lang = {
  exportButtonText: 'Crear carpetas en Drive',
  buttonQuestion:   '¿Cómo se va a llamar la carpeta en donde se crearán las carpetas de tus materias?'
};

const Endpoints = {
  dev:  'http://localhost:8080/folders',
  prod: 'https://uniswag.herokuapp.com/folders'
};

const Scraping = (function () {

    function isShortNameCell(index) {
      return index % 2 === 0;
    }

    function extractParentFolderName(parentFolderNameSource) {

      function makeParentFolderName(str) {
        const components = str.replace('&nbsp;', '').split(/-|\s/);

        return components[0].substr(0, 3) + '-' +
          components[1].substr(0, 3) + ' ' +
          components[2];
      }

      const nameSource =
        [].slice.call(parentFolderNameSource).map(e => e.innerHTML)[0];

      return makeParentFolderName(nameSource);
    }

    function extractSubjects(subjectsSource) {
      return [].slice.call(subjectsSource)
        .filter((e, idx) => isShortNameCell(idx))
        .map(e => e.innerHTML);
    }

    return {
      extractSubjects,
      extractParentFolderName
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

  function makeInputFromParentFolderName(parentFolderName) {
    return $('<input>', {
      type: 'hidden',
      name: 'parentFolderName',
      value: parentFolderName
    });
  }

  function makeForm(subjects, parentFolderName, url) {
    const form = $('<form>', {
      action: url,
      method: 'POST',
      target: '_blank'
    });

    form.append(makeInputFromParentFolderName(parentFolderName));

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

  function askForParentFolderName(defaultParentFolderName) {
    return window.prompt(Lang.buttonQuestion, defaultParentFolderName);
  }

  return {
    placeButton,
    askForParentFolderName
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
    const parentFolderNameSource = document.getElementsByClassName('rpSdLbVlr');

    const subjects =
      Scraping.extractSubjects(subjectsSource);
    const defaultParentFolderName =
      Scraping.extractParentFolderName(parentFolderNameSource);
    const parentFolderName =
      UI.askForParentFolderName(defaultParentFolderName);
    const form =
      Serialization.makeForm(subjects, parentFolderName, url);

    if (parentFolderName) {
      if (isDev) {
        console.log(subjects);
        subjects.forEach(console.log);
        form.serializeArray().forEach(console.log);
      }

      form.appendTo('body');
      form.submit();
    }

  });
}
