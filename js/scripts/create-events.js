/*
 Note that this script will run in an iframe with the url
 {http, https}://deimos.dgi.uanl.mx/cgi-bin/wspd_cgi.sh/control.p*
 */

(function () {

  const Lang = {
    exportButtonText: 'Crear horario en Calendar',
    buttonQuestion:   '¿Cuantos minutos dura la clase en el horario nocturno?'
  };

  const Endpoints = {
    dev:  'http://localhost:8080/calendar',
    prod: ''
  };

  const Scraping = (function () {

    function extractCourses(coursesSource) {
      function makeCourse(names) {
        return { shortName: names[0], longName: names[1] };
      }

      function groupCourseNames(sbjs) {
        if (sbjs.length === 0) {
          return [];
        }
        else {
          return [].concat(
            [sbjs.slice(0, 2)],
            groupCourseNames(sbjs.slice(2))
          );
        }
      }

      const courses = [].slice.call(coursesSource).map(e => e.innerHTML);

      return groupCourseNames(courses).map(makeCourse);
    };

    function extractSchedule(coursesSource, scheduleSource) {
      function extractCells() {
        function extractTime(str) {
          return str
            .match(/(([\d]{1,2}\s*?):\s*?([\d]{1,2}))\s*(p\.m|pm|a\.m|am)/g);
        }

        const rows = [].slice.call(scheduleSource.children).slice(1);

        const cells     = rows.map((row, rowIndex) => {
          const columns = [].slice.call(row.children);

          return columns.map((column, columnIndex) => {
            return {
              row:    rowIndex,
              column: columnIndex,
              html:   column.innerHTML,
              time:   extractTime(columns[0].innerHTML)
            };
          });
        });

        // We flatten the cells array
        return [].concat.apply([], cells);
      }

      const courses = extractCourses(coursesSource);
      const cells   = extractCells();

      return courses.map((course) => {
        function extractSessions() {
          function to24Hours(timeString) {
            function containsPm(str) {
              const rgx =  /(p\.m|pm)/g;
              return (rgx.exec(str) !== null) ? true : false;
            }

            // This thing only matches pm hours, it should return 4 groups
            // first group complete match e.g 2:00 pm or 2:00pm
            // second group hours 2
            // third group minutes 00
            // and fourth group should be pm|am|p.m|a.m
            const rgx = /([\d]{1,2}\s*?):\s*?([\d]{1,2})\s*(p\.m|pm|a\.m|am)/g;
            const res = rgx.exec(timeString);

            let hour      = parseInt(res[1], 10);
            const minutes = res[2];
            const match   = res[3];

            if (hour < 12 && containsPm(match)) {
              hour += 12;
            }
            else if (hour === 12 && !containsPm(match)) {
              hour = 0;
            }

            return hour + ":" + minutes;
          }

          function extractGroupAndClassroom(str) {
            const rgx    = /(?:<br>)(\d+)(?:<b>\s\/\s<\/b>)(\w+)/g;
            const result = rgx.exec(str);

            return { group: result[1], classroom: result[2] };
          }

          const sessions = cells.filter(c => c.html.includes(course.shortName));

          return sessions.map(session => {
            const { group, classroom } = extractGroupAndClassroom(session.html);

            return {
              weekday:   session.column,
              turn:      session.row + 1,
              group:     group,
              classroom: classroom,
              isLab :    session.html.includes('LB'),
              startTime: to24Hours(session.time[0]),
              endTime:   to24Hours(session.time[1])
            };
          });
        }

        const sessions = extractSessions();

        return {
          longName:  course.longName,
          shortName: course.shortName,
          sessions:  sessions,
          frequency: sessions.length
        };
      });
    }

    return {
      extractSchedule
    };
  })();

  const Serialization = (function () {

    function sessionAsPsv(courseNames, session) {
      return `${courseNames.longName}|${courseNames.shortName}|` +
             `${session.startTime}|${session.endTime}|${session.weekday}|` +
             `${session.classroom}|${session.isLab ? 1 : 0}`;
      }
    }





  })();

  const UI = (function () {

    function makeExportButton(onClick) {
      return $('<input>', {
        type:  'button',
        value: Lang.exportButtonText,
        class: 'export-btn', // TODO: review class name
        click: onClick
      });
    }

    function placeButton(onClick) {
      const btn       = makeExportButton(onClick);
      const container = $('<td>');

      container.append(btn);
      $('#id_rpPnlEst td').first().prepend(container);
    }

    function askForNightShiftSessionDuration(defaultNightShiftDuration) {
      return window.prompt(Lang.buttonQuestion, defaultNightShiftDuration);
    }

    return {
      placeButton,
      askForNightShiftSessionDuration
    };
  }());

  UI.placeButton(() => {

    const coursesSource =
      document.querySelectorAll("[align=left][valign=MIDDLE]");
    const scheduleSource =
      document.getElementById("id_divEncRep").parentNode;
    const schedule = Scraping.extractSchedule(coursesSource, scheduleSource);

    console.log(schedule);
  });
})();
