document.addEventListener('DOMContentLoaded', function () {
    createCharts();
});

var isMobil = false;
var request;

// Example time-series. Semicolon separated pairs "Unix-Timestamp/Value;Unix-Timestamp/Value;.."
// The values may be empty. The last element may be withoud value. It Indicate end of timespane
// of this line.
var arTimeSeries = [
    {
        name: 'Open',
        data: '1565301600/138.6100;1565560800/137.0700;1565647200/136.0500;1565733600/136.3600;1565820000/134.3900;1565906400/134.8800;1566165600/137.8550;1566252000/138.2100;1566338400/138.5500;1566424800/138.6600;1566511200/137.1897;1566770400/134.9900;1566856800/136.3900;1566943200/134.8800;1567029600/137.2500;1567116000/139.1500;1567461600/136.6100;1567548000/137.3000;1567634400/139.1100;1567720800/140.0300'
    },
    {
        name: 'Hight',
        data: '1565301600/139.3800;1565560800/137.8600;1565647200/138.8000;1565733600/136.9200;1565820000/134.5800;1565906400/136.4600;1566165600/138.5500;1566252000/138.7100;1566338400/139.4935;1566424800/139.2000;1566511200/138.3500;1566770400/135.5600;1566856800/136.7200;1566943200/135.7600;1567029600/138.4400;1567116000/139.1800;1567461600/137.2000;1567548000/137.6900;1567634400/140.3837;1567720800/140.1800'
    },
    {
        name: ' Low',
        data:  '1565301600/136.4600;1565560800/135.2400;1565647200/135.0000;1565733600/133.6700;1565820000/132.2500;1565906400/134.7200;1566165600/136.8850;1566252000/137.2400;1566338400/138.0000;1566424800/136.2900;1566511200/132.8000;1566770400/133.9000;1566856800/134.6600;1566943200/133.5500;1567029600/136.9100;1567116000/136.2700;1567461600/135.7000;1567548000/136.4800;1567634400/138.7600;1567720800/138.2000'
    },
    {
        name: 'Close',
        data: '1565301600/137.7100;1565560800/135.7900;1565647200/138.6000;1565733600/133.9800;1565820000/133.6800;1565906400/136.1300;1566165600/138.4100;1566252000/137.2600;1566338400/138.7900;1566424800/137.7800;1566511200/133.3900;1566770400/135.4500;1566856800/135.7400;1566943200/135.5600;1567029600/138.1200;1567116000/137.8600;1567461600/136.0400;1567548000/137.6300;1567634400/140.0500;1567720800/139.1000' 
    }
];

function createCharts () {

    // Create first chart in div id "charts"
    let lchart =  new LineChart(document.getElementById('charts'),null, null, 'Example Chart-Line', null);
             
    for(let i=0; i < arTimeSeries.length; i++) {
        let line = {
            obj_name: 'Stock preis',
            par_name: arTimeSeries[i].name,
            values: arTimeSeries[i].data
        };
        lchart.addLine(line);
    }
            
    lchart.draw();

    // Example convert CSV to time-series
    request = new XMLHttpRequest();
    request.open("GET","example.csv");
    request.addEventListener('load', function(event) {
        if (request.status == 200) {
           
            //Convert SCV to format suitable for chart.
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
        } else {

           console.warn(request.statusText, request.responseText);
        }
     });

    request.send(); 
}




                        
                        