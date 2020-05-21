// Version 1.1.0
// The oject represent line-chart. Constructor create HTML code for the chart. The chart 
// uses external CSS styles .nowrap .linechart, .chart-title, .chart-live-data, .chart-legend,
// .chart-legent-item, .chart-legent-color. The chart uses global variable isMobil (Boolean). 
// If true show live data by mouse over. By click on item in legend called external function 
// processSelectLegendItem(chartId, amount-of-lines, parId). Only positive values allowed.
// Labels on axe-X and -Y will be created automaticaly. The chart can show maximal 10 lines
// in different colors.
// @consructor: 
// @param container - Reference to parent element for chart. If null use HTML BODY as parent element.
// @param chartId - String. Identifier for chart. Optional. If not defined use random integer.
// @param width - Integer. Width in pixel. Optional. Default use available width in parent element.
// @param title - String. Title of chart. Optional. If null don't create title.
// @param className - String. Class for div of chart. Optinal. Default "linechart"
class LineChart {
    constructor(container, chartId, width, title, className) {
        if(container == null)
            container = document.getElementsByTagName("BODY")[0]; 
        if(chartId == null)
            chartId = getRandomInt();
        if (className == null)
            className = 'linechart';
        if (width == null)
            width = container.clientWidth;
        // Create HTML elements for new chart. The chartId used in id of div as 'line_chart_x',
        // in id of canvas 'db_canvas_x', legend 'db_legend_x'.
        this.chartDiv = addNewElement(container, 'div', {
            class: className,
            id: 'chart_' + chartId,
            chart_id: chartId,
            style: 'float:left; width:' + width + 'px; padding-bottom:8px;'
        });
        // Create title if string for title not null.
        if (title != null) {
            this.title = addNewElement(this.chartDiv, 'label', {
                class: 'chart-title nowrap',
                style: 'width:' + (width - 20) + 'px; text-align:center; display:block; margin-left:10px; margin-top:10px',
            });
            this.title.innerHTML = title;
        } else {
            this.title = null;
        }
        // Calculate real width of canvas based on width of chart-div. Think about margin
        // of canvas 30 = 17(margin-left) + 13(margin-right)
        var canvasWidth = width - 30;
        // Set height of canvas based on width
        var canvasHeight = 300;
        if (isMobil) {
            canvasHeight = 220;
        } else {
            if (width < 200) {
                canvasHeight = 200;
            }
            else if (width < 300) {
                canvasHeight = 220;
            }
            else if (width < 400) {
                canvasHeight = 240;
            }
            else if (width < 500) {
                canvasHeight = 260;
            }
            else if (width < 600) {
                canvasHeight = 280;
            }
        }
        // Add canvas and save reference to this one.
        this.canvas = addNewElement(this.chartDiv, 'canvas', {
            id: 'chart_' + chartId+ '_canvas',
            width: canvasWidth,
            height: canvasHeight,
            style: 'margin: 15px 17px 3px 13px;'
        });
        // Used to show live data by mousemove over the canvas.
        this.canvas.dataset.chartId = chartId.toString();
        // Save reference to context.
        this.context = this.canvas.getContext('2d');
        // I don't know how it work, but this command disable/reduce antialiasing!
        // It works only if lines are 1 pixel! Need if canvas created or size changed
        // and before draw on canvas.
        this.context.translate(0.5, 0.5);
        // Create element to show data by mousemove and set default '-'.
        if (!isMobil) {
            // Add events processing for canvas and show live data (value and data-time)
            // By leave the canvas remove data.
            this.canvas.addEventListener("mouseout", function (event) {
                // Select element which show data.
                var element = document.getElementById('chart_' + this.dataset.chartId+'_livedata');
                if (element == null)
                    return;
                element.innerText = '-';
            });
            // By mousemove over canvas show value and date-time in special element.
            this.canvas.addEventListener('mousemove', function (event) {
                // Select element which show data.
                var element = document.getElementById('chart_' + this.dataset.chartId+'_livedata');
                if (element == null)
                    return;
                // If current position below axe-X or left of axe-Y no think to do.
                if (this.height - event.offsetY < this.dataset.paddingBottom || event.offsetX < this.dataset.paddingLeft) {
                    element.innerText = '-';
                    return;
                }
                // Calculate position on axe-X to value (return if invalid result) and reduce amount of decimal digits.
                var curVal = this.dataset.maxVal - event.offsetY / parseFloat(this.dataset.coefVal);
                if (isNaN(curVal)) {
                    element.innerText = '-';
                    return;
                }
                if (curVal < 100) {
                    curVal = curVal.toFixed(2);
                }
                else if (curVal < 200) {
                    curVal = curVal.toFixed(1);
                }
                else {
                    curVal = Math.round(curVal);
                }
                // Calculate position on axe-Y to data-time. If result invalid return.
                var curTs = parseInt(this.dataset.minTs) + Math.round((event.offsetX - parseInt(this.dataset.paddingLeft)) / parseFloat(this.dataset.coefTs));
                if (isNaN(curTs)) {
                    element.innerText = '-';
                    return;
                }
                // From Unix-Timestamp create data object that contains separate elements of data-time.
                curTs = new Date(curTs * 1000).separate();
                // Set current value and data-time.
                element.innerHTML = 'Date <b>' + curTs.mday + '.' + curTs.month + '.' + curTs.year + '</b> Time <b>' + curTs.hour + ':' + curTs.min + '</b> Value <b>' + curVal + '</b>';
            });
            addNewElement(this.chartDiv, 'div', {
                class: "chart-live-data",
                id: 'chart_' + chartId+ '_livedata',
                style: "margin-left: 12px; margin-right: 12px; margin-bottom: 4px; max-width:95%;",
                innerText: '-'
            });
        }
        // Add div for legend. Each item in the legend is separate sub-div.
        this.legendDiv = addNewElement(this.chartDiv, 'div', {
            class: 'chart-legend',
            id: 'chart_' + chartId+ '_legend'
        });
        // The number used in ID of DOM element for the chart
        this.chartId = chartId;
        // Array of objects that represent lines.
        this.lines = [];
        // Integer. Begin of time that show chart. Sec. Unix Time-stamp.
        this.minTs = 99999999999999;
        // Integer. End of time that show chart. Sec. Unix Time-stamp.
        this.maxTs = 0;
        // Minimal measuring value.
        this.minVal = Number.MAX_SAFE_INTEGER;
        // Maximal measuring value.
        this.maxVal = Number.MIN_SAFE_INTEGER;
        // Difference between two labels on axe Y. Real value, not a pix!
        this.axeYLabelStep = null;
        // Default and minimal distance (pixel) between labels on axe-y.
        this.axeYLabelHeight = 30;
        // Default and minimal distance (pixel) between labels on axe-x.
        this.axeXLabelWidth = 80;
        // Coefficient to convert time-stamp to coordinate X.
        this.coefTs = null;
        // Coefficient to convert values to coordinate Y.
        this.coefVal = null;
        // Padding in canvas where to place labels. Later adjust to real width of labels.
        this.padding = { left: 50, bottom: 35 };
        // Indicate selected in calender end-date. This parmeter used in SingleChart.
        this.endDate = null;
        // Average step. Seconds. If is valid number used to calculate step by drawing the chart. 
        // If NaN, not used. This variable may be set manual.
        this.avgStep = NaN;
        
    // End consctructor object LineChart.
    }

    // Add data for new line. Automaticaly create new item in legend. 
    // @parameter lineData Object. The object represent data for one line in chart.
    // line.obj_name:"Proxy Server"
    // line.par_name:"CpuTotal"
    // line.par_id:"2452"
    // line.values: Example data-string "161111145730/3.48;161111145843/3.50;161111150013/""
    // @return Boolean. True if no problem detected. Else false.
    addLine (lineData) {
        if (lineData.values == null) {
            logger.error('Function LineChart.newLine(). DataString is null.');
            return false;
        }
            
        if (!isString(lineData.values)) {
            logger.error('Function LineChart.newLine(). DataString is not a string.');
            return false;
        }
        // Create new line object from part of backend's response. The  measuring data
        // placed in line.real
        var line = this._createLine(lineData);
        if (line == null) {
            logger.error('Function LineChart.newLine(). Function _createLine() return null.');
            return false;
        }
        // Add properties of line used to create legend.
        line.objName = lineData.obj_name;
        line.parName = lineData.par_name;
        line.parId = lineData.par_id;
        var color = this.colors[this.lines.length];
        // Reference to legend-item as dom-element. Set function called by click on element
        // to hide/show line on chart.
        if (isMobil) {
            line.legend = addNewElement(this.legendDiv, 'div', {
                class: 'chart-legend-item nowrap',
                id: 'chart_' + this.chartId + '_legend_' + lineData.par_id,
                style: 'max-width:' + (this.chartDiv.clientWidth - 20) + 'px;',
                onclick: 'processSelectLegendItem(' + this.chartId + ',' + this.lines.length + ',' + line.parId + ')',
                innerHTML: '<span class="chart-legend-color" style="background-color:' + color + '; color:' + color + ';">--</span>' + line.objName + ' / ' + line.parName
            });
        } else {
            line.legend = addNewElement(this.legendDiv, 'div', {
                class: 'chart-legend-item nowrap',
                id: 'chart_' + this.chartId + '_legend_' + lineData.par_id,
                style: 'max-width:' + (this.chartDiv.clientWidth - 20) + 'px;',
                onclick: 'processSelectLegendItem(' + this.chartId + ',' + this.lines.length + ',' + line.parId + ')',
                innerHTML: '<span class="chart-legend-color" style="background-color:' + color + '; color:' + color + ';">--</span>' + line.objName + ' / ' + line.parName
            });
        }
        // Put new line array of lines.
        this.lines.push(line);
        return true;
    }
    
    // Update data in chart and redraw this one again. All items in legend stay the same!
    // @parameter lines Array of objects of type SingleLine.
    // @return true if no problem detected else false.
    updateLines (lines) {
        if (lines == null) {
            logger.error('Function LineChart.updateLines(). Parameter lines is null.');
            return false;
        }
        if (!Array.isArray(lines)) {
            logger.error('Function LineChart.updateLines(). Parameter lines is not a array.');
            return false;
        }
        // Reset to default some parameters of chart.
        this.lines = [];
        this.minTs = 99999999999999;
        this.maxTs = 0;
        this.minVal = 999999999999999;
        this.maxVal = 0;
        this.axeYLabelStep = null;
        this.coefTs = null;
        this.coefVal = null;
        // Process lines. Each new line add to array of lines.
        for (var i in lines) {
            var line = this._createLine(lines[i]);
            if (line != null) {
                this.lines.push(line);
            }
        }
        this.draw();
        return true;
    }

    // Create line from object that represent one line of backend's response. Only measuring
    // values >= 0 supported! If found one negative value return null and output error in logger.
    // If data-string is empty, create line with flag isEmpty=true. The function also update some
    // variables of chart minTs, maxTs, minVal, maxVal.
    // Example data-string "161111145730/3.48;161111145843/;161111150013/"
    // Each element separated by ";" in each element time-stamp separated from value by "/".
    // Value may be empty! Always in last item the element without value. It indicate only
    // where is end of time-period.
    _createLine (lineData) {
        // Create object empty line.
        var line = new SingleLine(lineData);
         
        // Flag. True if value of all items are NaN. In this case set min/max 0/1
        var isAllNaN = true;
        
        // If data-string is empty, return line with flag isEmpty=true.
        if (lineData.values.length == 0)
            return line;
        
        // Split in array and loop over all elements.
        var ar = lineData.values.split(";");

        // Variable used by efficiently loop over big array.
        var arLen = ar.length;
        for (var i = 0; i < arLen; ++i) {
            
            var item = ar[i].split('/');
            
            if (item[0] == "") {
                logger.warn('LineChart._createLine(). Item ' + i + ' time-stamp is empty.');
                continue;
            }

            if (isNaN(item[0])) {
                logger.warn('LineChart._createLine(). Item ' + i + ' contains invalid time-stamp "' + item[0] + '".');
                continue;
            }

            var elem = { ts: null, val: null };
            elem.ts = parseInt(item[0]);
            elem.val = parseFloat(item[1]);
            
            line.real.push(elem);

            // If value is valid number, update min/max and set false isAllNaN.
            if (!isNaN(elem.val)) {
                
                // Update mininal value. Positive and negative values process differently.
                if(elem.val < 0) {

                    if(Math.floor(elem.val * 1.1) < this.minVal) {
                        this.minVal = Math.floor(elem.val * 1.1);
                    }
                    
                } else {
                    
                    if(Math.floor(elem.val * 0.9) < this.minVal)  {
                        this.minVal = Math.floor(elem.val * 0.9);
                    }
                }

                // Update maximal value.
                if (Math.ceil(elem.val * 1.1) > this.maxVal) {
                    this.maxVal = Math.ceil(elem.val * 1.1);
                }

                isAllNaN = false;
            }

            // Update min/max time-stamp
            if (elem.ts < this.minTs)
                this.minTs = elem.ts;
            if (elem.ts > this.maxTs)
                this.maxTs = elem.ts;
        }
        
        // If line is empty skip next operations.
        if (line.real.length == 0)
            return line;
        line.isEmpty = false;
        // Adjust min/max values if both 0 or all values NaN
        if ((this.maxVal == 0 && this.minVal == 0) || isAllNaN) {
            this.minVal = 0;
            this.maxVal = 1;
        }
        // Calculate padding. This area used for labels. Both are type of object TextMetrics.
        var minValText = this.context.measureText(this.minVal.toString());
        var maxValText = this.context.measureText(this.maxVal.toString());
        // Set place for label using biggest value.
        if (minValText.width < maxValText.width) {
            this.padding.left = Math.round(maxValText.width) + 23;
        } else {
            this.padding.left = Math.round(minValText.width) + 23;
        }
        return line;
    }    

    // Clear all on graphic. Legend stay visible.
    clear () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw graphic with all elements.
    draw () {
        // Update coefficient for values and time-stamps only if line is not empty.
        this.coefTs = (this.canvas.width - this.padding.left) / (this.maxTs - this.minTs);
        this.coefVal = (this.canvas.height - this.padding.bottom) / (this.maxVal - this.minVal);
        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Return true if all lines in the chart are empty.
        if (this.isEmpty())
            return;
        // Draw axe-x and labels with values
        this._drawAxeX();
        // Draw axe-y and time-labels
        this._drawAxeY();
        // Draw each line separate.
        for (var i = 0; i < this.lines.length; i++) {
            this.drawLine(i);
        }
        // Refresh data need to show live-data
        this.canvas.dataset.minTs = this.minTs.toString();
        this.canvas.dataset.coefTs = this.coefTs.toString();
        this.canvas.dataset.maxVal = this.maxVal.toString();
        this.canvas.dataset.coefVal = this.coefVal.toString();
        this.canvas.dataset.paddingLeft = this.padding.left.toString();
        this.canvas.dataset.paddingBottom = this.padding.bottom.toString();
    }    

    // Set new size E.g. if size of parent panel changed.
    resize(difWidth, difHeight) {
        //if(!angular.isNumber(difWidth) || !angular.isNumber(difHeight)) return;
        this.canvas.width = this.canvas.width + difWidth;
        this.canvas.height = this.canvas.height + difHeight;
        this.context.translate(0.5, 0.5);
    }

    // Draw axe X and labels.
    _drawAxeX () {
        // Draw axe X
        this.context.strokeStyle = this.colorDefault;
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(this.padding.left, this.canvas.height - this.padding.bottom);
        this.context.lineTo(this.canvas.width, this.canvas.height - this.padding.bottom);
        this.context.stroke();
        // Calculate suitable step between labels on axe-x.
        // Average distance between labels in minutes
        var stepTs = Math.round(this.axeXLabelWidth / this.coefTs / 60);
        // Variable use by loop over array.
        var arLen;
        // Select from available steps best suitable.
        arLen = this.stepsX.length - 1;
        for (var i = 0; i < arLen; i++) {
            if (stepTs > this.stepsX[i] && stepTs < this.stepsX[i + 1]) {
                stepTs = this.stepsX[i];
                break;
            }
        }
        // Convert step in minutes to seconds.
        stepTs = stepTs * 60;
        // Calculate time-stamp of first label
        //  Get time of day of minimal time-stamp
        var tsLabel = this._getBeginOfDayFromUnixTs(this.minTs);
        var isFound = false;
        // Limit time-stamp of minimal label to current time.
        // Time-stamp of first label can't be bigger as as current time.
        var tsNow = new Date().getTime() / 1000;
        while (tsLabel < tsNow) {
            if (tsLabel > this.minTs) {
                isFound = true;
                break;
            }
            tsLabel += stepTs;
        }
        // Create array of labels width coordinate-X and time-stamp for label.
        var labels = [];
        var posX, labelStr;
        while (tsLabel < this.maxTs) {
            posX = this._convertTs2PosX(tsLabel);
            labelStr = this._formatTsForLabel(tsLabel, (this.maxTs - this.minTs));
            labels.push({ X: posX, str: labelStr });
            tsLabel = tsLabel + stepTs;
        }
        // Begin draw vertical label-lines and help-lines.
        this.context.beginPath();
        // Color for label-lines and help-lines.
        this.context.strokeStyle = '#e6e6e6';
        // Distance between label-line and help-line.
        var halfStep = Math.round(stepTs * this.coefTs / 2);
        // For all lines position Y is the same
        var posY = this.canvas.height - this.padding.bottom;
        arLen = labels.length;
        for (var i = 0; i < arLen; i++) {
            this.context.moveTo(labels[i].X, 0);
            this.context.lineTo(labels[i].X, posY);
            // Help-line between two labels
            if (labels[i].X - halfStep > this.padding.left + 2) {
                this.context.moveTo(labels[i].X - halfStep, 0);
                this.context.lineTo(labels[i].X - halfStep, posY);
            }
        }
        // Last help-line after last label if not outside canvas
        if (labels[i - 1] != null) {
            if (labels[i - 1].X + halfStep <= this.canvas.width) {
                this.context.moveTo(labels[i - 1].X + halfStep, 0);
                this.context.lineTo(labels[i - 1].X + halfStep, posY);
            }
        }
        this.context.stroke();
        // Type labels on axe-x
        this.context.font = "12px arial";
        arLen = labels.length;
        for (i = 0; i < arLen; i++) {
            // Print first part of label Hour:Min
            this.context.fillText(labels[i].str.hm, labels[i].X - 17, (posY + 17));
            // The second part of label (Day.Mon) print only by first label at label by begin of day.
            if (i == 0) {
                this.context.fillText(labels[i].str.dm, labels[i].X - 17, (posY + 32));
            }
            else {
                if (labels[i].str.dm != labels[i - 1].str.dm) {
                    this.context.fillText(labels[i].str.dm, labels[i].X - 17, (posY + 32));
                }
            }
        }
        this.context.closePath();
    }

    // Calculate coordinates for labels on axe Y. Distance between labels approximately 40px.
    // Draw axe Y, labels and help-lines (the line between two labels). For labels use place
    // in chart.padding.left. Draw one help-line at label and second line between labels.
    _drawAxeY () {
        // No think to do if coefficients are null. May be the chart contains only one
        // empty line (without measuring-data). In this case don't need draw axes.
        if (this.coefTs == null || this.coefVal == null)
            return;
        // Variable used by efficiently loop over big array.
        var arLen;
        // How much labels with default height fit into current axe Y.
        var labelsAmount = (this.canvas.height - this.padding.bottom) / this.axeYLabelHeight;
        // Find optimal step between labels based. First calculate exact step. In second step
        // (in loop) find optimal value of step using basic values in array steps.
        this.axeYLabelStep = (this.maxVal - this.minVal) / labelsAmount;
        // Find optimal value of step
        var c = 1;
        var isFound = false;
        var minStep, maxStep;
        while (c < 100000000000) {
            for (var i = 0; i < (this.stepsY.length - 1); i++) {
                minStep = this.stepsY[i] * c;
                maxStep = this.stepsY[i + 1] * c;
                if (minStep <= this.axeYLabelStep && this.axeYLabelStep <= maxStep) {
                    this.axeYLabelStep = maxStep;
                    isFound = true;
                    break;
                }
            }
            if (isFound)
                break;
            c = c * 10;
        }
        // Find value of first label. It is not chart.minVal! It is next
        // suitable value. Consider that chart.MinVal may be negative.
        var labelMinVal = 0;
        if (this.minVal < 0) {
            while (labelMinVal > this.minVal) {
                if (labelMinVal <= this.minVal)
                    break;
                labelMinVal -= this.axeYLabelStep;
            }
        } else if (this.minVal > 0) {
            while (labelMinVal < this.maxVal) {
                if (labelMinVal >= this.minVal)
                    break;
                labelMinVal += this.axeYLabelStep;
            }
        }
        // Create array of labels. Each item in array contains {value:value, Y:position-Y}
        // It will be used to draw labels and help-lines. The loop limit to 33 labels to
        // prevent infinite loop.
        var axeY = [];
        i = 0;
        var labelPosY, labelValue;
        while (i < 33) {
            labelValue = labelMinVal + (this.axeYLabelStep * i);
            // If step less as 1, format values of label to two decimal digits
            if (this.axeYLabelStep < 1 || this.axeYLabelStep == 2.5)
                labelValue = labelValue.toFixed(2);
                labelPosY = this._convertVal2PosY(labelValue);
                if (labelPosY < 0)
                    break;
                var label = { value: labelValue, Y: labelPosY };
                axeY.push(label);
                i++;
        }
        // Begin drawing.
        this.context.lineWidth = 1;
        this.context.beginPath();
        // Draw axe-Y
        this.context.strokeStyle = this.colorDefault;
        this.context.moveTo(this.padding.left, 0);
        this.context.lineTo(this.padding.left, this.canvas.height - this.padding.bottom);
        this.context.stroke();
        // Create horizontal label-lines and help-lines. Begin from bottom.
        this.context.beginPath();
        // Color for label-lines and help-lines. Gray 90%
        this.context.strokeStyle = '#e6e6e6';
        // Position Y for help-lines. (The line between two help-lines)
        var helpLinePosY;
        arLen = axeY.length;
        for (i = 0; i < arLen; i++) {
            // Draw help-line between labels
            helpLinePosY = axeY[i].Y + Math.round(this.coefVal * this.axeYLabelStep / 2);
            if (helpLinePosY < this.canvas.height - this.padding.bottom) {
                this.context.moveTo(this.padding.left, helpLinePosY);
                this.context.lineTo(this.canvas.width, helpLinePosY);
            }
            // Create help-line where label defined. Skip if help-line on axe X.
            if (axeY[i].Y >= this.canvas.height - this.padding.bottom)
                continue;
            this.context.moveTo(this.padding.left, axeY[i].Y);
            this.context.lineTo(this.canvas.width, axeY[i].Y);
        }
        // If possible create help-line after last top label
        helpLinePosY = axeY[axeY.length - 1].Y - Math.round(this.coefVal * this.axeYLabelStep / 2);
        if (helpLinePosY > 0) {
            this.context.moveTo(this.padding.left, helpLinePosY);
            this.context.lineTo(this.canvas.width, helpLinePosY);
        }
        // Draw all created lines
        this.context.stroke();
        // Draw labels on axe Y
        this.context.font = "12px arial";
        this.context.strokeStyle = this.colorDefault;
        // Print labels on left site of axe Y and under the line.
        // The position defined left bottom corner of text-box.
        arLen = axeY.length;
        for (i = 0; i < arLen; i++) {
            this.context.fillText(axeY[i].value, 0, axeY[i].Y + 10);
        }
    }

    // Draw one line on existing graphic. Used afte add new line.
    // @param lineIndex Number. Index of line in array this.lines[]
    drawLine (lineIndex) {
        // Create local reference to processed line.
        var line = this.lines[lineIndex];
        if (line == null) {
            logger.error("Function LineChart.drawLine(lineId). The line with ID " + lineIndex + " not found!");
            return;
        }
        // If line is empty or flag hidden is true return.
        if (line.isEmpty == true || line.real.length == 0 || line.hidden)
            return;
        // Array with position of points X/Y used to draw line.
        var pos = [];
        // Used to detect items with the same position X.
        var lastX = -1;
        // Temporary array used to calculate average values.
        var avgY = [];
        // Variable used by efficiently loop over big array.
        var arLen;
        // Array contains result of calculating average values or if empty replace by
        // reference to real data. So by calculating position X/Y used the same array.
        var lineData = [];
        // If average-step is a number, calculate average values.
        if (!isNaN(this.avgStep)) {
            // Variable contains end-time (Unix Time-Stamp) of current average step.
            // At begin set to begin of day of first item. In next step calculate
            // first suitable time-point.
            var avgNextPoint = this._getBeginOfDayFromUnixTs(line.real[0].ts);
            while (avgNextPoint < line.real[0].ts) {
                avgNextPoint += this.avgStep;
            }
            arLen = line.real.length;
            for (var x = 0; x < arLen; x++) {
                if (line.real[x].ts < avgNextPoint) {
                    avgY.push(line.real[x].val);
                } else {
                    // If item don't belong to the same time-range, make time-point
                    // bigger till suitable value. To prevent endless loop limit to
                    // 100 times.
                    var maxCounter = 0;
                    while (line.real[x].ts > (avgNextPoint + this.avgStep)) {
                        avgNextPoint += this.avgStep;
                        maxCounter++;
                        if (maxCounter > 1000) {
                            logger.warn("drawLine(). Can't calculate average values for this line. " + new Date(line.real[x].ts * 1000).formatISOLocal() + '/' + line.real[x].val);
                            return;
                        }
                    }
                    // Create item for this time-range.
                    var item = { ts: avgNextPoint, val: getAvgValue(avgY, 2) };
                    // Add resulting item to array with avg-data.
                    lineData.push(item);
                    // Reset temporary array.
                    avgY = [];
                    // Add next value to temporary array
                    avgY.push(line.real[x].val);
                    // Set next time-point
                    avgNextPoint += this.avgStep;
                }
            }
            // If temporary array not empty, add rest to result.
            if (avgY.length > 0) {
                var item = { ts: avgNextPoint, val: getAvgValue(avgY, 2) };
                lineData.push(item);
            }
        }
        // Clean temporary array
        avgY = [];

        // If array with average values is empty set reference to real-data instead.
        if (lineData.length == 0)
            lineData = line.real;

        // Prepare position x/y for points/items in line.
        arLen = lineData.length;
        for (var i = 0; i < arLen; i++) {

            // Create empty point/item in line.
            var item = { X: NaN, Y: NaN };
            
            // Convert time-stamp to coordinate X
            item.X = this._convertTs2PosX(lineData[i].ts);

            // Convert value to coordinate Y
            if (!isNaN(lineData[i].val)) 
                item.Y = this._convertVal2PosY(lineData[i].val);

            // By items with the same position X calculate average value.
            if (item.X == lastX) {
                avgY.push(item.Y);
                continue;
            } else {
                lastX = item.X;
                if (avgY.length > 0 && i > 0) {
                    avgY.push(pos[pos.length - 1].Y);
                    pos[pos.length - 1].Y = getAvgValue(avgY, 2);
                    avgY = [];
                }
            }
            // Save new item in array used to draw line.
            pos.push(item);
        }
        // Begin draw line
        this.context.strokeStyle = this.colors[lineIndex];
        this.context.lineWidth = 1;
        this.context.beginPath();
        // Set first position to first valid measuring value
        arLen = pos.length;
        for (i = 0; i < arLen; i++) {
            if (!isNaN(pos[i].Y)) {
                this.context.moveTo(pos[i].X, pos[i].Y);
                i++;
                break;
            }
        }
        while (i < arLen) {
            if (!isNaN(pos[i].Y)) {
                this.context.lineTo(pos[i].X, pos[i].Y);
                i++;
            } else {
                this.context.stroke();
                i++;
                while (i < pos.length) {
                    if (!isNaN(pos[i].Y)) {
                        i++;
                        break;
                    }
                    i++;
                }
            }
        }
        this.context.stroke();
    }
    
    // Return true if all lines are empty
    isEmpty () {
        var isEmpty = true;
        for (var i = 0; i < this.lines.length; i++) {
            if (!this.lines[i].isEmpty) {
                isEmpty = false;
            }
        }
        return isEmpty;
    }

    // Calculate from time-stamp position X using coefficient for axe X and available width.
    _convertTs2PosX (ts) {
        return (this.canvas.width - Math.round((this.maxTs - ts) * this.coefTs));
    }

    // Calculate from measuring value position Y using coefficient for axe Y and available height.
    // Return rounded integer.
    _convertVal2PosY (val) {
        return (Math.round((this.maxVal - val) * this.coefVal));
    }
    
    // Convert unix time-stamp to object that contains two elements. This object used as label on 
    // Axe-X. Result is dependet on difference. By small difference in first line show hour:min,
    // second line day.mon. By difference between 3-180 days in first line show day.mon in second
    // line yaer. By difference > 180 days in first line show month in second line yaer. Day and 
    // month in format DD.MM always two digits. Hours and minutes in format HH:MM always two digits.
    // @param ts Number. Unix-time-stamp.
    // @param tsdif Number. Difference between first and last timestamp
    // @return Object. The object used to create labels on axe-x.
    _formatTsForLabel (ts, tsdif) {
        let date = new Date(ts * 1000);
        
        // Recalculate difference from seconds to days.
        tsdif = tsdif / (3600 * 24);

        let yaer = date.getFullYear();

        let mon = date.getMonth() + 1;
        if (mon < 10)
            mon = '0' + mon.toString();

        let mday = date.getDate();
        if (parseInt(mday) < 10)
            mday = '0' + mday.toString();

        let hours = date.getHours();
        if (parseInt(hours) < 10)
            hours = '0' + hours;

        let min = date.getMinutes();
        if (parseInt(min) < 10)
            min = '0' + min.toString();

        let result = {};
        if(tsdif < 3) {
            result = { dm: mday + '.' + mon, hm: hours + ':' + min };

        } else if(tsdif >= 3 && tsdif < 180) {
            result = { dm: yaer, hm: mday+ '.'+ mon };

        } else {
            result = { dm: yaer, hm: ' '+ mon};
        }

        return result;
    }
    
    // Calculate begin of day in seconds from unix time-stamp in seconds.
    // @param ts {number} unix time-stamp in seconds
    // @return {Number}
    _getBeginOfDayFromUnixTs (ts) {
        var result = new Date(ts * 1000);
        result = new Date(result.getFullYear(), result.getMonth(), result.getDate());
        result.setMinutes(59);
        result.setSeconds(59);
        result.setMilliseconds(1000);
        return result.getTime() / 1000;
    }

    // Set of colors used to draw lines
    colors = [
        '#0044CC', // Blue 65%,
        '#008000', // Green
        '#FF8533', // Orange
        '#6A6A6A', // Black 25%
        '#C71585', // MediumVioletRed
        '#8B4513', // SaddleBrowx
        '#1E90FF', // DodgerBlue
        '#FF4500', // OrangeRed
        '#00FF00', // Lime
        '#8A2BE2'  // BlueViolet
    ]
        
    // Default color used in some elements
    colorDefault = '#657585';
        
    // Array of possible steps on axe-Y.
    stepsX = [2, 5, 10, 15, 20, 30, 60, 90, 2*60, 4*60, 5*60, 6*60, 12*60, 24*60, 2*24*60, 3*24*60, 4*24*60, 
        5*24*60, 7*24*60, 10*24*60, 15*24*60, 20*24*60, 30*24*60, 45*24*60, 60*24*60, 90*24*60, 120*24*60];
        
    // Array of minimal steps for axe-X
    stepsY = [0.01, 0.02, 0.05, 0.1];
    
    // End class LineChart
}

// The object represent line that used in charts. 
// @constructor:
// @param lineData Object. The object represent data of one line in chart.
//     obj_name - String. The string used as label for th line. object_name + parameter_name.
//     par_id - String. Optional. May be used to request data from database.
//     par_name - Srtring. The string used as label  for th line. object_name + parameter_name.
//     values - String. Semicolon separated pairs "Unix-Timestamp/Value;Unix-Timestamp/Value;.."
//          The values may be empty! The last element should be withoud value!!! It Indicate 
//          end of timespane of this line. Example :
//          "161111145820/3.36;161111145880/3.42;161111145940/3.50;161111146000/3.58;161111146060/3.48,;161111146120/3.08;161111146120/"
class SingleLine {
    constructor(lineData) {
        this.parId = lineData.par_id;     // This Id may be used to request data from database.
        this.parName = lineData.par_name; // Name of parameter representing this line. E.g "CPU Total"
        this.objName = lineData.obj_name; // Name of object where belong this parameter. E.g. "Proxy server"
        this.real = []; // Empty array for pairs ts/val. "ts" is unix time-stamp, "val" is measuring value.
                        // Fill with data later, because need update min/max parsmeter of chart.
        this.isEmpty = true; // Flag indicate that line contains no data.
        this.hidden = false; // Property uses to hide line in chart by click on legend item.
    }
}

// Version 
LineChart.prototype.Version = "1.1.0";

