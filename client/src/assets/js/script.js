var myTemplate = $.templates("#calendarTmpl");
const weekStart = moment().startOf("week");

function loadCalendar() {
  const days = [];
  for (let i = 0; i <= 6; i++) {
    //ou 6
    days.push({
      name: weekStart.isoWeekday(i + 1).format("ddd"),
      day: moment(weekStart).date(),
      today: moment(weekStart).format("ll") == moment().format("ll"),
    });
  }

  var app = {
    month: weekStart.format("MMMM YYYY"),
    days: days,
  };

  var html = myTemplate.render(app);
  $("#calendar").html(html);
}

loadCalendar();

$("#calendar").on("click", ".prev", function () {
  weekStart.subtract(1, "w");
  loadCalendar();
});

$("#calendar").on("click", ".next", function () {
  weekStart.add(1, "w");
  loadCalendar();
});
