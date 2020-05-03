## adaptive-linechart

This is small library to draw charts in browser. It automaticaly create legend and labels for axe-x and -y depend on 
available place (with/height) and supplied data. Maximal 10 lines. Current version process only positive values.

You can adjust layout of chart, thats's why the name is "adaptive ...". The chart uses external CSS styles .nowrap 
.linechart, .chart-title, .chart-live-data, .chart-legend, .chart-legent-item, .chart-legent-color. The chart uses 
global variable isMobil (Boolean). If true, show live data by "mouse-over". By click on item in legend called external
function **processSelectLegendItem(chartId, amount-of-lines, parameter-id)**. 

Chart accept data as time-series in format (string) "Unix-Timestamp/Value;Unix-Timestamp/Value;..". Additional (chart-util) 
supplied function to convert CSV (with header) to time-series.

The library use own simple logger that write messate to console. If need you can rewrite this object and redirect messages
 to another target.

## Example

The example example create chart with 3 lines in parent element with ID 'charts':
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

## Public methods

+ **LineChart(container, chartId, witdh, title, clasName)** - create object of type LineChart and create HTML code for the chart.
    - **container** - Reference to parent element for chart. If null use BODY as parent element.
    - **chartId** - Integer. Identifier for chart. Optional. If not defined use random integer.
    - **width** - Integer. Width in pixel. Optional. Default use available width in parent element.
    - **title** - String. Title of chart. Optional. If null don't create title.
    - **className** - String. Class for div of chart. Optional. Default "linechart"

+ **addLine(lineData)** - add data for new line and automaticaly create new item in legend. Return true if no problem detected, else false.
    - **lineData** - The object represent data for one line in chart.
        - **obj_name** - String. Name of object related to the chart. Used in legend.
        - **par_name** - String. Name of parameter that represent current line. Used in legend.
        - **par_id** - Integer. Optional. Id of this line. May be used to request data from backend.
        - **values** - String. Time-series in format "Unix-Timestamp/Value;Unix-Timestamp/Value;.."

+ **draw()** - draw graphic. Skeep lines if properties hidden=true or isEmpty=true.

+ **clear()** - clear graphic. Legend stay visible.

+  **resize(difWidth, difHeight)** - set new size. E.g. if size of parent element is changed.
    - **difWidth** - Signed integer. Difference in width.
    - **difHeight** - Signet integer. Difference in height.

+ **isEmpty ()** Return true if all lines are empty

## Utility

+ **scvToTimeSeries(csv)** - Process CSV and return array of objects {name: "Name of serie", data: "Unix-Timestamp/Value;Unix-Timestam/Value"}. 
  Assume first column contains data-time as string. CSV may contains many columns. Name of serie take from header. Values may be empty. 
  This function need package Moment.js https://momentjs.com

## License

[MIT](https://opensource.org/licenses/MIT) © Andrej Koslov
