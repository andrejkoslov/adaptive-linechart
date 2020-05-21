document.addEventListener('DOMContentLoaded', function () {
    createCharts();
});

var isMobil = false;
var request;
var charts = [];

// Example time-series. Semicolon separated pairs "Unix-Timestamp/Value;Unix-Timestamp/Value;.."
// The values may be empty. The last element may be withoud value. It Indicate end of timespane
// of this line.
var arTimeSeries = [
    {
        name: 'Example one',
        data: '1565301600/-11.2;1565560800/-9;1565647200/-7.2;1565733600/-5.89;1565820000/-5.2;1565906400/-2.50;1566165600/-1.21;1566252000/0.20;1566338400/-2;1566424800/-4.5;1566511200/-6.2;1566770400/-8.3;1566856800/-10.0;1566943200/-11;1567029600/-13.8;1567116000/-15.8;1567461600/-12.9;1567548000/-8.9;1567634400/-8.94;1567720800/-10.96'
    },
    {
        name: 'Example Two',
        data: '1565301600/11.2;1565560800/6;1565647200/4;1565733600/2;1565820000/-2;1565906400/-3;1566165600/-4;1566252000/-6;1566338400/-7;1566424800/-8;1566511200/-8;1566770400/-5.5;1566856800/-3.6;1566943200/-0.6;1567029600/1.8;1567116000/3.8;1567461600/4.2;1567548000/5.4;1567634400/6.94;1567720800/7.96'
    },
    {
        name: 'Example Two',
        data: '1565301000/0;1565560200/-0.4;1565646600/-1.1;1565733000/-2;1565819400/-0.5;1565905800/-0.01;1566165000/0.2;1566252000/0.3;1566337800/2.2;1566424200/4.2;1566510600/5.2;1566779800/6.1;1566856200/7.4;1566942600/8;1567029000/8.2;1567115400/8.8;1567461000/9.2;1567547400/11.4;1567633800/12.94;1567720200/11.96'
    }
];

function createCharts () {

    // Create first chart in div id "charts"
    let lchart;
    
    lchart = new LineChart(document.getElementById('charts'),null, null, 'Example Chart-Line', null);
             
    for(let i=0; i < arTimeSeries.length; i++) {
        let line = {
            obj_name: 'Chart',
            par_name: arTimeSeries[i].name,
            values: arTimeSeries[i].data
        };
        lchart.addLine(line);
    }
            
    lchart.draw();

    charts.push(lchart);

    // Example convert CSV to time-series
    request = new XMLHttpRequest();
    request.open("GET","example.csv");
    request.addEventListener('load', function(event) {
        if (request.status == 200) {
           
            // Convert SCV to format suitable for chart.
            let arTimeSeries = scvToTimeSeries(request.responseText);
            
            // Create next chart in div id "charts"
            lchart =  new LineChart(document.getElementById('charts'),null, null, 'Example Chart-Line with data from CSV', null);
             
            for(let i=0; i < arTimeSeries.length - 1; i++) {
                let line = {
                    obj_name: 'Stock preis',
                    par_name: arTimeSeries[i].name,
                    values: arTimeSeries[i].data
                };
                lchart.addLine(line);
            }
            
            lchart.draw();

            charts.push(lchart);
        } else {

           console.warn("Request CSV failed status "+ request.statusText+ " Responce "+ request.responseText);
        }
     });

    request.send(); 
}




                        
                        