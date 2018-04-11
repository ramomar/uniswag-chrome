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

    function sessionAsPsv(searializableSession) {
      return `${searializableSession.longName}|` +
             `${searializableSession.shortName}|` +
             `${searializableSession.startTime}|` +
             `${searializableSession.endTime}|` +
             `${searializableSession.weekday}|` +
             `${searializableSession.classroom}|` +
             `${searializableSession.isLab ? 1 : 0}`;
      }
    }

    function makeInputFromSerializableSession(session) {
      return $('<input>', {
        type:  'hidden',
        name:  'sessions',
        value: sessionAsPsv(session)
      });
    }

    function makeInputFromCalendarName(calendarName) {
      return $('<input>', {
        type:  'hidden',
        name:  'calendar',
        value: calendarName
      });
    }

    function makeForm(searializableSessions, calendarName, url) {
      const form = $('<form>', {
        action: url,
        method: 'POST',
        target: '_blank'
      });

      form.append(makeInputFromCalendarName(calendarName));

      searializableSessions
        .map(makeInputFromSerializableSession)
        .forEach(s => form.append(s));

      return form;
    }

    return {
      makeForm
    };
  })();

  const Sessions = (function () {

    /*

    17:00 17:00 N1
    17:50 17:45 N2
    18:40 18:30 N3
    19:30 19:15 N4
    20:20 20:00 N5
    21:10 20:45 N6
    22:00 21:30

    We compute the correct start time as follows:

    startTime =
      startTime -
      MINUTES(nightShiftClassDuration - classDuration) * sessionNumber

      e.g.
      17:00 - 17:45  17:00 - (MINUTES(50 - 45) * 0) = 17:00
      17:45 - 18:30  17:50 - (MINUTES(50 - 45) * 1) = 17:45
      18:30 - 19:15  18:40 - (MINUTES(50 - 45) * 2) = 18:30
      19:15 - 20:00
      20:00 - 20:45
      20:45 - 21:30

    */

    const SESSION_DURATION_MINUTES = 50;

    function fixSessionTimes(session, nightShiftSessionDuration) {
      function toLocalTime(str) {
        const components = str.split(':');

        return { hours: components[0], minutes: components[1] };
      }

      const startTime = moment(toLocalTime(session.startTime));

      const notFirstNightShiftSession = startTime.hours() > 17 &&
        startTime.minutes() >= nightShiftSessionDuration;

      if (notFirstNightShiftSession) {
        const sessionNumber = startTime.hours() - 17;

        const shiftsMinutesDurationDifference =
          Math.abs(SESSION_DURATION_MINUTES - nightShiftSessionDuration);

        const minutesOffset = shiftsMinutesDurationDifference * sessionNumber;

        session.startTime =
          session.startTime.subtract(minutesOffset, 'minutes');

        session.endTime =
          session.startTime.clone().add(minutesOffset, 'minutes');
      }

      return undefined;
    }

    function scheduleToSessions(schedule, nightShiftClassDuration) {
      const sessions = schedule.map(course => {
        course.sessions.map(session => {
          return fixSessionTimes({
            longName:  course.longName,
            shortName: course.shortName,
            startTime: session.startTime,
            endTime:   session.endTime,
            weekday:   session.weekday,
            classroom: session.classroom,
            isLab:     session.isLab
          }, nightShiftClassDuration);
        });
      });

      return
    }

    return {
      scheduleToSessions
    };
  })();

  const UI = (function () {

    function makeExportButton(onClick) {
      return $('<input>', {
        type:  'button',
        value: Lang.exportButtonText,
        class: 'create-events-btn',
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
    const sessions = Sessions.scheduleToSessions(schedule);

    console.log(schedule);
  });
})();
