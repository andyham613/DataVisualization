/*
  You do your work for Project 3 in this file, within the regions
  indicated below.  Comments throughout give details.
*/

/* module syntax directly copied from d3.v4.js */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.p3 = global.p3 || {})));
}(this, (function (exports) { 'use strict';

const transDur = 500; // if using transitions
const hexWidth = 39.5; // size of hexagons in US map
const txtWidth = 20; // width of state label on each row of grid
const plotOpac = 0.25; // opacity of plots
const plotStrokeWidth = 2.5; // width of stroke for drawing plot

var sortBy = "alpha"; // in synch with index.html
var colorBy = "value"; // in synch with index.html

// these are set by index.html
var popYears; // array of years for which there is population data
var caseYears; // array of all years for which we have case counts
var mapData; // data from hex map file
var popData; // (processed) data from population file
var caseData; // (processed) data from measles case counts
var plotWdth, plotHght; // dimensions of rectangle in which plots are drawn
var plotXScale; // linear scale for mapping years to position

// these are set by index.html, but
// YOU HAVE TO COMPUTE AND FILL IN THE CORRECT VALUES
var stRate; // per-state rate of measles per 1 million people
var usRate; // national average rate of measles per 1 million people

// little utility for making link to google search for measles
// in given year and state. If no state is passed, "US" is used.
// The year and state are made to be required in the search results
// by enclosing them in (escaped) quotes.
function searchLink(year, state) {
    state = state ? state : "US";
    return ("<a href=\"https://www.google.com/search?q="
            + "measles" + "+%22" + year + "%22+%22" + state + "%22"
            + "\" target=_blank>measles " + year + " " + state + "</a>");
}

/* ------------------------- do not change anything above this line */

/* YOUR CODE HERE. The functions already here are called by index.html,
   you can see what they do by uncommenting the console.log() */

var sel_yr = 1955; //selected year
var sel_st = null;

var interval;

function mean(rates, start, end)
{
    var sum = 0;
    rates.forEach(function(y)
        {if ((y.year >= start) && (y.year <= end)) sum = sum + y.rate;})
    //console.log("rate: ", sum/(end - start + 1))
    return (sum/(end - start + 1))
}




function sortBySet(wat) {

    if (wat == "alpha") {
        sortBy = "alpha";
        }
    else if (wat == "mean") {
        sortBy = "mean";

    }
    else if (wat == "mex") {
        sortBy = "mex";
    }

}

//(value) rate colormap
  var cmap = {}
  cmap.rpoints = [0, 1, 2, 34, 250, 14000, 29560] //control points for measles rates
  cmap.scale = d3.scaleLinear().domain(cmap.rpoints)
                              .range([0, 0.3, 0.4, 0.5, 0.6, 0.85, 1]) //scale control points to [0,1]
  var lin_h = function(r) {return d3.scaleLinear().domain([0,1]).range([330,0])(r)}
  cmap.c = function (r) {return d3.hcl(lin_h(r), 23*Math.pow(Math.sin((Math.PI*r)),2), 10+(90*r))}

//diff colormap
  var diff = {}
  diff.rpoints = [-5932, 0, 27355]
  diff.scale = d3.scaleLinear().domain(diff.rpoints)
                                .range([0, 0.5, 1]) //scale from min, max (rate - national averate) rates to (0, 0.5, 1)
  diff.c = d3.scaleLinear() //yellow --> grey --> blue
                              .domain([0, 0.5, 1])
                              .range([d3.rgb(51,51,255), d3.rgb(115,115,115), d3.rgb(255,204,0)])

function colorBySet(wat) {
    var find = function(year) {
    return p3.usRate.filter(y => (y.year == year))[0].rate
  }
    if (wat == "diff") {
        colorBy = "diff"
        d3.select("#stateGrid").attr("transform", "translate(0,5)");
            d3.select("#stateGrid").selectAll("g")
              .data(p3.stRate) // the per-state data join
              .selectAll("rect")
              .data(d => d.rates) // the within-state per-year data join
              .style("fill", function(d)
                {return diff.c(diff.scale(d.rate - p3.usRate.filter(y => (y.year == d.year))[0].rate))})
    }
    else if (wat == "value") {
        colorBy = "value"
            d3.select("#stateGrid").attr("transform", "translate(0,5)");
            d3.select("#stateGrid").selectAll("g")
              .data(p3.stRate) // the per-state data join
              .selectAll("rect")
              .data(d => d.rates) // the within-state per-year data join
              .style("fill", function(d) {return cmap.c(cmap.scale(d.rate)); })

    }
    var state_rate = p3.stRate.map( function(d){
      return {"state": d.state, "rate" : d.rates[sel_yr - 1930].rate};
    });
    d3.selectAll(".stateHex")
      .data(p3.mapData)
      .transition(p3.transDur)
      .style("stroke-opacity", function(d) {
            if(d.StateAbbr == sel_st){
                return 1;
            } else{return 0;}
      })
      .style("stroke-width", 3)
      .style("stroke", "white")
      .style("fill", function(d){
        if (colorBy == "value") {
            return cmap.c(cmap.scale(state_rate.filter(s => (s.state == d.StateAbbr))[0].rate));
        }
        if (colorBy == "diff") {
            return diff.c(diff.scale(state_rate.filter(s => (s.state == d.StateAbbr))[0].rate - find(sel_yr)))
        }
      });
}


function caseRowFinish(d) {
    //console.log("caseRowFinish: ", d);
    // maybe more of your code here ...

    return d; // keep this line
}

function caseDataFinish(Data) {
    //console.log("caseDataFinish: Data=", Data);
    p3.caseData = Data;
    // initialize the per-state and US rate data arrays;
    // your code will compute correct rates
    p3.stRate = Data.map(row => ({
         state: row.StateAbbr,
         rates: Data.columns
                  .filter(y => !isNaN(y)) // keep only the (numeric) years
                  .map(y => ({year: +y, rate: 0})) // initialize to zero
         })
    );

    p3.usRate = p3.stRate[0].rates.map(y => y);
    // maybe more of your code here ...

}

function popRowFinish(d) {
    // console.log("popRowFinish: ", d);
    // maybe more of your code here ...

    return d; // keep this line
}

function popDataFinish(Data) {
    // console.log("popDataFinish: ", Data);
    p3.popData = Data;
    // maybe more of your code here ...

}

// maybe more of your code here ...


function finalFinish() {
    var floor = function(yr) {return Math.floor(yr/10)*10}; //round year down to nearest 10
    var ceil = function(yr) {return Math.ceil(yr/10)*10}; //round year up to nearest 10
    //given a year and a state abbreviation, returns the lerped population
    var lerp_pop = function(yr, abbr)
        {if (yr >= 2010)
            return d3.scaleLinear()
                    .domain([2000, 2010])
                    .range([p3.popData.filter(s => (s.StateAbbr == abbr))[0][2000],
                        p3.popData.filter(s => (s.StateAbbr == abbr))[0][2010]])(yr)
        else
            return d3.scaleLinear()
                .domain([floor(yr), ceil(yr)])
                .range([p3.popData.filter(s => (s.StateAbbr == abbr))[0][floor(yr)],
                        p3.popData.filter(s => (s.StateAbbr == abbr))[0][ceil(yr)]])(yr)}

    //given a year and a state abbreviation, returns the number of measles cases
    var cases = function(yr, abbr)
    {return p3.caseData.filter(s => (s.StateAbbr == abbr))[0][yr]}

    var sum_cases = function(yr)
    {
        var sum = 0;
        p3.caseData.forEach(function(s) { sum += s[yr]})
        return sum;
    }

    var sum_pop = function(yr)
    {
        var sum = 0;
        p3.popData.forEach(s => sum += lerp_pop(yr, s.StateAbbr));
        return sum;
    }

    //for each state, for each year, correctly updates the rate
    p3.stRate
        .forEach(s => s.rates
            .forEach(new_r => new_r.rate =
                1000000 * cases(new_r.year, s.state)/lerp_pop(new_r.year, s.state)));

    p3.usRate = p3.usRate.map(function(y)
        {return y =
            {"rate" : 1000000 * (sum_cases(y.year))/(sum_pop(y.year)),
            "year" : y.year}})



}


function yearSelect(year) {
    // indicate the selected year
    var find = function(yr) {
        return p3.usRate.filter(y => (y.year == yr))[0].rate
    }

    d3.select("#stateMapY").text(year);
    d3.select("#stateMapLink").html(p3.searchLink(year, sel_st));
    //given the selected year, creates an array of (STATE: rate)
    var state_rate = p3.stRate.map( function(d){
      return {"state": d.state, "rate" : d.rates[year - 1930].rate};
    });

    d3.selectAll(".stateHex")
      .data(p3.mapData)
      .transition(p3.transDur)
      .style("stroke-opacity", function(d) {
            if(d.StateAbbr == sel_st){
                return 1;
            } else{return 0;}
      })
      .style("stroke-width", 3)
      .style("stroke", "white")
      .style("fill", function(d){
        if (colorBy == "value") {
            return cmap.c(cmap.scale(state_rate.filter(s => (s.state == d.StateAbbr))[0].rate));
        }
        if (colorBy == "diff") {
            return diff.c(diff.scale(state_rate.filter(s => (s.state == d.StateAbbr))[0].rate - find(year)))
        }
      });

      var min_max = function(start, end) {
        var max = 0;
        var min = 100000000000;
        p3.stRate.forEach
            (s => s.rates.forEach
                (function(r) {
                    if (r.year >= start && r.year <= end) {
                        if (r.rate > max) {
                            max = r.rate;
                        }
                        if (r.rate < min) {
                            min = r.rate
                        }
                    }
                }))
        return [min, max]
      }

      var usRateExtent;
      var scaledExtent;
      var plotYScale;

      //set y scale based on interval
      if (year >= 1930 && year <= 1967) {
        interval = 0;
        usRateExtent = d3.extent(p3.usRate.map(function(d) {return d.rate}));
        plotYScale = d3.scaleLinear().domain(usRateExtent).range([p3.plotHght, 0]);
        d3.select("#plot-us")
            .datum(function(d) {return p3.usRate}).transition(p3.transDur)
            .attr("d",
                d3.line()
                    .x(d => p3.plotXScale(d.year))
                    .y(d => plotYScale(d.rate)))
            .style("stroke", "orange")
            .style("stroke-width", plotStrokeWidth);

        for(var i = 0; i < 50; i++) {

            var stRateExtent = d3.extent(p3.stRate[i].rates.map(function(d) {return d.rate}));
          //  console.log("strt int 0", stRateExtent)
            var stateScale = d3.scaleLinear().domain(stRateExtent).range([p3.plotHght, 0]);
            d3.select("#plot-" + p3.stRate[i].state)
                .datum(function(d) {return p3.stRate[i].rates})
                .transition(p3.transDur)
                .attr("d",
                    d3.line()
                        .x(function(d) {return p3.plotXScale(d.year)})
                        .y(d => stateScale(d.rate)))
            .style("stroke",
                function(d) {
                    if (sel_st != null) {
                        if (sel_st == p3.stRate[i].state) {
                            return d3.rgb(0,0,255,1);
                        }
                        else {
                            return d3.rgb(0,0,0,p3.plotOpac)
                        }
                    }})
            .style("stroke-width", plotStrokeWidth)
        }

        d3.select("#plotUSG")
          .call(d3.axisLeft(plotYScale))
          .append("text")
          .attr("fill", "black")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .text("Measles Rates");
        d3.select("#plotUSG")
          .append("text")
          .attr("fill", "black")
          .attr("x", 60)
          .attr("y", 265)
          .text("Year");

    // *******we couldn't figure out how to sort the grid rows and override what was already on the screen. *****
    // if we do "d3.select("#stateGrid").selectAll("g").remove()" and then do the following, it works, but doesn't respond to other sortBys

    // if (sortBy == "mean") {
    // console.log("4 interval is: ", interval)
    // console.log("5 SORTING BY MEAN: ", sortBy)

    // var temp = p3.stRate.map(function(s) {return s});
    // temp = temp.sort(function(s1, s2) {return (mean(s2.rates, 1930, 1930) - mean(s1.rates, 1930, 1930))}); //descending
    // d3.select("#stateGrid").selectAll("g").remove();
    // var lineHght = 0.98*d3.select("#stateGrid").attr("height")/51; // 51=50 states + DC
    // var stWdth = (d3.select("#stateGrid").attr("width")-p3.txtWidth)/p3.caseYears.length;
    // d3.select("#stateGrid").attr("transform", "translate(0,5)");
    // var gridRows = d3.select("#stateGrid").selectAll("g")
    //   .data(temp) // the per-state data join
    //   .enter().append("g")
    //   .attr("id", row => "grid-" + row.state)
    //   .attr("height", lineHght);
    // gridRows.attr("transform", (d, i) => "translate(" + p3.txtWidth + "," + (i)*lineHght + ")" );
    // gridRows.append("text")
    //   .attr("class", "stateGridID")
    //   .text(d => d.state);
    // gridRows.selectAll("rect")
    //   .data(d => d.rates) // the within-state per-year data join
    //   .enter().append("rect")
    //   .attr("x", (d,i) => i*stWdth)
    //   .attr("y", -2) // hack, to roughly vertically center state IDs with rects
    //   .attr("width", stWdth).attr("height", lineHght)
    //   .attr("class", "stateGrid")
    //   .attr("id", function(d,i) { return d3.select(this.parentNode).attr("id") + "-" + d.year; })
    //   .style("fill", function(d) {return cmap.c(cmap.scale(d.rate)); }) // initialize to gray

    // d3.select("#stateGrid").attr("transform", "translate(0,5)");
    //         d3.select("#stateGrid").selectAll("g")
    //           .data(temp) // the per-state data join
    //           .append("text")
    //               .attr("class", "stateGridID")
    //               .text(d => d.state)
    //           .selectAll("rect")
    //           .data(d => d.rates) // the within-state per-year data join
    //           .style("fill", function(d) {return cmap.c(cmap.scale(d.rate)); })
    //}

      }
      else if (year >= 1968 && year <= 1980) {
        interval = 1;
        plotYScale = d3.scaleLinear().domain(min_max(1968, 1980)).range([p3.plotHght, 0]);
        d3.select("#plot-us")
            .datum(function(d) {return p3.usRate}).transition(p3.transDur)
            .attr("d",
                d3.line()
                    .x(d => p3.plotXScale(d.year))
                    .y(d => plotYScale(d.rate)))
            .style("stroke", "orange")
            .style("stroke-width", plotStrokeWidth);

        for(var i = 0; i < 50; i++) {
            var stRateExtent = min_max(1968, 1980)
         //   console.log("stRateExtent (interval 1)", stRateExtent)
            var stateScale = d3.scaleLinear().domain(stRateExtent).range([p3.plotHght, 0]);
            d3.select("#plot-" + p3.stRate[i].state)
                .datum(function(d) {return p3.stRate[i].rates})
                .transition(p3.transDur)
                .attr("d",
                    d3.line()
                        .x(function(d) {return p3.plotXScale(d.year)})
                        .y(d => stateScale(d.rate)))
            .style("stroke",
                function(d) {
                    if (sel_st != null) {
                        if (sel_st == p3.stRate[i].state) {
                            return d3.rgb(0,0,255,1);
                        }
                        else {
                            return d3.rgb(0,0,0,p3.plotOpac)
                        }
                    }})
            .style("stroke-width", plotStrokeWidth)
        }

        d3.select("#plotUSG")
          .call(d3.axisLeft(plotYScale))
          .append("text")
          .attr("fill", "black")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .text("Cases of Measles");
        d3.select("#plotUSG")
          .append("text")
          .attr("fill", "black")
          .attr("x", 60)
          .attr("y", 265)
          .text("Year");

      }
      else if (year >= 1981 && year <= 1997) {
        interval = 2;
        plotYScale = d3.scaleLinear().domain(min_max(1981, 1997)).range([p3.plotHght, 0]);
        d3.select("#plot-us")
            .datum(function(d) {return p3.usRate}).transition(p3.transDur)
            .attr("d",
                d3.line()
                    .x(d => p3.plotXScale(d.year))
                    .y(d => plotYScale(d.rate)))
            .style("stroke", "orange")
            .style("stroke-width", plotStrokeWidth);

        for(var i = 0; i < 50; i++) {
            var stRateExtent = min_max(1981, 1997)
         //   console.log("stRateExtent (2)", stRateExtent)
            //var stRatescaledE = stRateExtent.map(d => Math.pow(d, 7/8)*2)
            var stateScale = d3.scaleLinear().domain(stRateExtent).range([p3.plotHght, 0]);
            d3.select("#plot-" + p3.stRate[i].state)
                .datum(function(d) {return p3.stRate[i].rates})
                .transition(p3.transDur)
                .attr("d",
                    d3.line()
                        .x(function(d) {return p3.plotXScale(d.year)})
                        .y(d => stateScale(d.rate)))
            .style("stroke",
                function(d) {
                    if (sel_st != null) {
                        if (sel_st == p3.stRate[i].state) {
                            return d3.rgb(0,0,255,1);
                        }
                        else {
                            return d3.rgb(0,0,0,p3.plotOpac)
                        }
                    }})
            .style("stroke-width", plotStrokeWidth)
        }

        d3.select("#plotUSG")
          .call(d3.axisLeft(plotYScale))
          .append("text")
          .attr("fill", "black")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .text("Cases of Measles");
        d3.select("#plotUSG")
          .append("text")
          .attr("fill", "black")
          .attr("x", 60)
          .attr("y", 265)
          .text("Year");
      }
      else {
        //scaledExtent = usRateExtent.map(d => Math.pow(d, 7/8)*2)
        interval = 3;
        plotYScale = d3.scaleLinear().domain(min_max(1998, 2016)).range([p3.plotHght, 0]);
        d3.select("#plot-us")
            .datum(function(d) {return p3.usRate}).transition(p3.transDur)
            .attr("d",
                d3.line()
                    .x(d => p3.plotXScale(d.year))
                    .y(d => plotYScale(d.rate)))
            .style("stroke", "orange")
            .style("stroke-width", plotStrokeWidth);

        for(var i = 0; i < 50; i++) {
            var stRateExtent = min_max(1998, 2016)
         //   console.log("stRateExtent:", stRateExtent)
            var stateScale = d3.scaleLinear().domain(stRateExtent).range([p3.plotHght, 0]);
            d3.select("#plot-" + p3.stRate[i].state)
                .datum(function(d) {return p3.stRate[i].rates})
                .transition(p3.transDur)
                .attr("d",
                    d3.line()
                        .x(function(d) {return p3.plotXScale(d.year)})
                        .y(d => stateScale(d.rate)))
            .style("stroke",
                function(d) {
                    if (sel_st != null) {
                        if (sel_st == p3.stRate[i].state) {
                            return d3.rgb(0,0,255,1);
                        }
                        else {
                            return d3.rgb(0,0,0,p3.plotOpac)
                        }
                    }})
            .style("stroke-width", plotStrokeWidth)
        }

        d3.select("#plotUSG")
          .call(d3.axisLeft(plotYScale))
          .append("text")
          .attr("fill", "black")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .text("Cases of Measles");
        d3.select("#plotUSG")
          .append("text")
          .attr("fill", "black")
          .attr("x", 60)
          .attr("y", 265)
          .text("Year");
      }




}

/* onMouse() is called with mousedown (downward part of click) and
 mousemove events. The first argument is what element was under the cursor
 at the time, and the second argument is the XY position of the cursor
 within that element, which can used (if "plot" == IDspl[0]) to recover,
 via p3.plotXScale the corresponding year */
function onMouse(ID, xy) {
    var IDspl = ID.split("-"); // splits ID string at "-"s into array
    //console.log("onMouse: ", ID, IDspl, xy, d3.event.type);
    // maybe more of your code here ...
    var stateSelected = sel_st;
    var year = sel_yr;

    // use plot clicks to select year
    //mousedown
    if(d3.event.type == "mousedown") {
        if(IDspl[0] == "plot") {
            year = Math.round(p3.plotXScale.invert(xy[0]));
            if(IDspl == "us" || stateSelected == IDspl[1]) {
                stateSelected = null;
            } else {
                stateSelected = IDspl[1];
            }
        } else if (IDspl[0] == "grid") {
            year = +IDspl[2];
            p3.searchLink(IDspl[2], IDspl[1]);
            if(IDspl == "us" || stateSelected == IDspl[1]) {
                stateSelected = null;
            } else {
                stateSelected = IDspl[1];
            }
        }
        else if(IDspl[0] == "hex") {
            if(IDspl == "us" || stateSelected == IDspl[1]) {
                stateSelected = null;
            } else {
                stateSelected = IDspl[1];
            }
        }
    //mousemove
    } else if(d3.event.type == "mousemove") {
        if(IDspl[0] == "plot") {
            year = Math.round(p3.plotXScale.invert(xy[0]));
        }
        else if (IDspl[0] == "grid") {
            year = +IDspl[2];
            p3.searchLink(IDspl[2], IDspl[1]);
        }
    }
   p3.searchLink(IDspl[2], IDspl[1]);
   //console.log(IDspl[2],IDspl[1])
   sel_st = stateSelected;
   sel_yr = year;
   p3.yearSelect(year);
   //console.log(stateSelected, year)

}

/* ------------------------- do not change anything below this line */

exports.hexWidth = hexWidth;
exports.txtWidth = txtWidth;
exports.plotOpac = plotOpac;
exports.plotStrokeWidth = plotStrokeWidth;
exports.transDur = transDur;
exports.sortBySet = sortBySet;
exports.colorBySet = colorBySet;
exports.popRowFinish = popRowFinish;
exports.caseRowFinish = caseRowFinish;
exports.popDataFinish = popDataFinish;
exports.caseDataFinish = caseDataFinish;
exports.mapData = mapData;
exports.popData = popData;
exports.caseData = caseData;
exports.stRate = stRate;
exports.usRate = usRate;
exports.searchLink = searchLink;
exports.plotWdth = plotWdth;
exports.plotHght = plotHght;
exports.plotXScale = plotXScale;
exports.popYears = popYears;
exports.finalFinish = finalFinish;
exports.yearSelect = yearSelect;
exports.onMouse = onMouse;
Object.defineProperty(exports, '__esModule', { value: true });
})));
