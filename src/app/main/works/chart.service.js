(function () {
  'use strict';
  angular.module('app.works').service('ChartService', ChartService);

  /** @ngInject */
  function ChartService($log) {
    this.makeDataForChart = makeDataForChart;
    this.initChart = initChart;


    function initChart() {
      return {
        mainChart: {
          config: {
            refreshDataOnly: true,
            deepWatchData: true
          },
          options: {
            chart: {
              type: 'multiBarChart',
              color: ['#b3e5fc','#03a9f4'],
              height: 420,
              margin: {
                top: 8,
                right: 16,
                bottom: 32,
                left: 32
              },
              clipEdge: true,
              groupSpacing: 0.3,
              reduceXTicks: false,
              stacked: false,
              duration: 250,
              x: function (d) {
                return d.x;
              },
              y: function (d) {
                return d.y;
              },
              yAxis: {
                tickFormat: function (d) {
                  return d;
                }
              },
              legend: {
                margin: {
                  top: 8,
                  bottom: 32
                }
              },
              controls: {
                margin: {
                  top: 8,
                  bottom: 32
                }
              },
              tooltip: {
                gravity: 's',
                classes: 'gravity-s'
              }
            }
          },
          data: [
            {
              key: 'Cotizado',
              values: []
            },
            {
              key: 'Consumido',
              values: []
            }
          ]
        }
      };
    }

    function makeDataForChart(quotesSummary, dailyReportsSummary) {
      var data = {
        hour_assigned: {
          "key": "Imputado",
          "values": []
        },
        quoted: {
          "key": "Cotizado",
          "values": []
        }
      };

      _.forEach(quotesSummary.employee_areas, function (e) {
        _.forEach(e.specialities, function (s) {
          data.hour_assigned.values.push({
            x: e.name + ' (' + s.name + ')',
            y: 0
          });

          data.quoted.values.push({
            x: e.name + ' (' + s.name + ')',
            y: s.value
          });
        });
      });

      var value = null;
      _.forEach(dailyReportsSummary.employee_areas, function (e) {
        _.forEach(e.specialities, function (s) {
          value = _.find(data.hour_assigned.values, function (o) {
            return o.name == e.name + '/' + s.name;
          });

          if (value == null){
            data.hour_assigned.values.push({
              x: e.name + ' (' + s.name + ')',
              y: Math.round((s.value/60)*100)/100
            });

            data.quoted.values.push({
              x: e.name + ' (' + s.name + ')',
              y: 0
            });
          }else {
            value.y = Math.round((s.value/60)*100)/100;
          }
        });
      });

      $log.debug('data', data);

      return [
        {
          key: data.quoted.key,
          values: data.quoted.values
        },
        {
          key: data.hour_assigned.key,
          values: data.hour_assigned.values
        }
      ];
    }
  }

})();
