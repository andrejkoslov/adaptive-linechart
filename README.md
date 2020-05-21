## adaptive-linechart :chart_with_upwards_trend:

This is a small library to draw charts in the browser. Why is it "adaptive"? Because it automaticaly
adjust chart to available size depend on min/max values on and timespan. Additional you 
can adjust the layout of the chart. The chart uses the external CSS styles .nowrap .linechart, 
.chart-title, .chart-live-data, .chart-legend, .chart-legend-item, .chart-legend-color. 

Maximal 10 lines. Since version 1.1.0 allowed negative and positive values in randge from 
-9007199254740991 till 9007199254740991. The chart uses the global variable isMobil (Boolean). If
true, live data are shown by "mouse-over". By clicking on any item in the legend an external
function will be executed **processSelectLegendItem(chartId, amount-of-lines, parameter-id)**

The chart accepts data as time-series in the format (string) "Unix-Timestamp/Value;Unix-Timestamp/Value;..".
Additional (chart-util) supplied function to convert CSV (with header) to time-series.

The library uses its own simple logger that writes messages to the console. If needed, you can
rewrite this object and redirect messages to another target.

## Example

This example creates a chart with 3 lines in parent element with ID 'charts':
```js
var arTimeSeries = [
    {
        name: 'Open',
        data: '1565301600/138.6100;1565560800/137.0700;1565647200/136.0500;1565733600/136.3600;1565820000/134.3900'
    },
    {
        name: 'Hight',
        data: '1565301600/139.3800;1565560800/137.8600;1565647200/138.8000;1565733600/136.9200;1565820000/134.5800'
    },
    {
        name: ' Low',
        data:  '1565301600/136.4600;1565560800/135.2400;1565647200/135.0000;1565733600/133.6700;1565820000/132.2500'
    },
];

var lchart =  new LineChart(document.getElementById('charts'),null, null, 'Example Chart-Line', null);

for(let i=0; i < arTimeSeries.length; i++) {
        let line = {
            obj_name: 'Stock preis',
            par_name: arTimeSeries[i].name,
            values: arTimeSeries[i].data
        };
        lchart.addLine(line);
    }
            
lchart.draw();
```

[Live example](http://www.softdorado.com/adaptive-linechart/)

## Public methods

**`LineChart(container, chartId, width, title, className)`** - create an object of type LineChart 
and create HTML code for the chart.
- **container** - Reference to parent element for chart. If null: use BODY as parent element.
- **chartId** - String. Identifier for chart. Optional. If not defined use random integer.
- **width** - Integer. Width in pixel. Optional. Default use available width in parent element.
- **title** - String. Title of chart. Optional. If null: don't create title.
- **className** - String. Class for div of chart. Optional. Default "linechart".

**`addLine(lineData)`** - add data for a new line and automatically create a new item in the legend. 
Return true if no problem detected, otherwise false.

**`lineData`** - The object represents data for one line in the chart.
- **obj_name** - String. Name of object related to the chart. Used in legend.
- **par_name** - String. Name of the parameter that represents the current line. Used in legend.
- **par_id** - Integer. Optional ID of this line. May be used to request data from backend.
- **values** - String. Time-series in format "Unix-Timestamp/Value;Unix-Timestamp/Value;.."

**`draw()`** - draw graphic. Skip lines if properties hidden=true or isEmpty=true.

**`clear()`** - clear graphic. Legend stays visible.

**`resize(difWidth, difHeight)`** - set a new size. E.g. if the size of parent element is changed.
- **difWidth** - Signed integer. Difference in width.
- **difHeight** - Signed integer. Difference in height.

**`isEmpty()`** Return true if all lines are empty

## Utility

**`scvToTimeSeries(csv)`** - process CSV and return array of objects 

`{name: "Name of serie", data: "Unix-Timestamp/Value;Unix-Timestamp/Value"}`. 

Assume the first column contains data-time as string. The CSV may contain many columns. Name of 
serie taken from header. Values may be empty. This function needs the package [Moment.js](https://momentjs.com)

## Contact

If you have any questions, please contact me `adaptive-linechart@my.mail.de`

## License

[MIT](https://opensource.org/licenses/MIT) © Andrej Koslov

