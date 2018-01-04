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
var interval = 0;
/* mapping from interval to years */
var int_range = {
    0: [0, 1967],
    1: [1968, 1980],
    2: [1981, 1997],
    3: [1998, 2016]
}

function sortBySet(wat) {
    console.log("sortBy ", wat);
    // maybe more of your code here ...
    sortBy = wat;
    //console.log(p3.stRate);
    // var emcol = [d3.rgb(0,0,0), d3.rgb(230,0,0), d3.rgb(255,230,0), d3.rgb(255,255,255)];
    // function lerp(w, [a,b]) {return (1.0-2)*a + w*b; }
    // var base_colormap =  d3.scaleLinear()
    //      .domain([0,1/3,2/3,1].map(w => lerp(w,[0,40000])))
    //      .range(emcol)
    // var base_colormap = function(d) {
    //   var scale = d3.scaleLinear().domain([0,30000])
    //   var phi = scale.range([0,Math.PI])(d);
    //   var hcl = d3.hcl(scale.range([330,0])(d),
    //                   23*Math.pow(Math.sin(phi),2),
    //                   scale.range([10,100])(d));
    //   return hcl;
    // }

    var IM_colormap = d3.scaleLinear().domain([0,1,2,32,500,15000,30000]).range([0, 1]);
    var IM_func = function(d) {return d3.scaleLinear().domain([0,1]).range([1,0])(d)};
    var IM_color = function (d) {return d3.hcl(330 * IM_func(d),
     23*Math.pow(Math.sin((Math.PI * d)),2), 10+90*d)};
    var base_colormap = IM_color(IM_colormap);

    var controls = []
    for (var i =0; i<= 30000; i += 1000) {
      controls.push(i);
    }

     var domain_array = [0,10,20,40,80,1000,15000,20000,25000,30000]
     var range_array = [0,0.05,0.2,0.5,1,2,10,1000,5000,15000,30000]
    //var domain_array = [0,5,10,40,80,1000,8000,15000,22000,25000,30000,40000]
    //var range_array = [0,0.05,0.2,0.5,1,2,5,10,1000,3000,15000,30000,40000]

    var intMap = d3.scaleLinear().domain(domain_array).range(range_array)

    var colormap = d3.scaleLinear().domain(controls.map(intMap)).range(controls.map(base_colormap))

    switch (sortBy) {
      case "mex":
         p3.stRate.sort(function(a, b){
           let arates = a.rates.filter(x => x.year <= int_range[interval][1] && x.year >= int_range[interval][0])
                              .map(x => x.rate);
           let brates = b.rates.filter(x => x.year >= int_range[interval][0] && x.year <= int_range[interval][1])
                              .map(x => x.rate);
           let amax = Math.max.apply(arates);
           let bmax = Math.max.apply(brates);
           return bmax - amax;
         });
         break;
      case "mean":
         p3.stRate.sort(function(a, b){
           let arates = a.rates.filter(x => x.year <= int_range[interval][1] && x.year >= int_range[interval][0])
                              .map(x => x.rate);
           let brates = b.rates.filter(x => x.year >= int_range[interval][0] && x.year <= int_range[interval][1])
                              .map(x => x.rate);
           let amean = arates.reduce(function(x, y) { return x + y; }) / arates.length;
           let bmean = brates.reduce(function(x, y) { return x + y; }) / brates.length;
           return bmean - amean;
         });
         break;
      default:
        p3.stRate.sort(function(a, b){
          if (a.state < b.state)
              return -1;
          if (a.state > b.state)
              return 1;
          return 0;
        });
        break;
    }
    let rows = d3.selectAll("#stateGrid")
                   .selectAll("g")
                     .data(p3.stRate)
                     .attr("id", row => row.state);
    rows.select("text").text(d => d.state);
    rows.selectAll("rect")
          .data(d => d.rates)
          .style("fill", function(d){
            return /*colormap(d.rate)*/ IM_color(IM_colormap(d.rate))});

    console.log(interval);
}

function colorBySet(wat) {
    console.log("colorBy ", wat);
    // maybe more of your code here ...

    var find = function(d) {
      return p3.usRate.filter(d => (d.year == d))[0].rate
    }
    if (wat == "diff")  {

    }
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
    p3.numStates = 51;
    // uncomment this to see structure of stRate Object
    // console.log("caseFinish: stRate=", p3.stRate);
    console.log("data");
    p3.int0 = p3.stRate.map(x => x.rates.filter(r => r.year <= 1967));
    p3.int1 = p3.stRate.map(x => x.rates.filter(r => r.year > 1967 && r.year <= 1980));
    p3.int2 = p3.stRate.map(x => x.rates.filter(r => r.year > 1980 && r.year <= 1997));
    p3.int3 = p3.stRate.map(x => x.rates.filter(r => r.year > 1997));
    //console.log(p3.int0);
   // console.log(p3.int1);
    //console.log(p3.int2);
    //console.log(p3.int3);
    console.log(p3.stRate);
}

function popRowFinish(d) {
    // console.log("popRowFinish: ", d);
    // maybe more of your code here ...

    return d; // keep this line
}

function popDataFinish(Data) {
    //console.log("popDataFinish: ", Data);
    p3.popData = Data;
    // maybe more of your code here ...

}

// maybe more of your code here ...


function finalFinish() {
    // This would be a good place to compute rate per-state per-year
    // maybe more of your code here ...

    var years = []
    var state_pop_lerps = {}
    var states = p3.stRate.map(i => i.state);
    //console.log(states);

    for (var i = 0; i<9; i++) {
      years[i] = (10*i) + 1930
    }

    for (var i = 0; i <= 50; i++) {
      //check if data is consistent
      if ((p3.popData[i].StateAbbr === p3.caseData[i].StateAbbr) &&
          (p3.popData[i].StateAbbr === p3.stRate[i].state)) {
            //console.log("sorted correctly")
      } else {
        console.log("error, data not sorted correctly")
      }

      //estimate population using lerp
      var state_pop_lerp = d3.scaleLinear().domain(years).range(years.map(y => p3.popData[i][y]));
      state_pop_lerps[p3.stRate[i].state] = state_pop_lerp;

      for (var j = 0; j<=86; j++) {
        var year = j + 1930
        if (p3.stRate[i].rates[j].year !== year) {
          console.log("stRate not consistent with years")
        }
        p3.stRate[i].rates[j].rate = 1000000 * p3.caseData[i][year] / state_pop_lerp(year);
      }
    }

    // for overall us

    for (var j = 0; j<=86; j++) {
      var year = j+1930
      if (p3.usRate[j].year !== year) {
        console.log("stRate not consistent with years")
      }
      var us_cases = p3.caseData.map(d => d[year]).reduce((a, b) => a +b, 0)
      var us_pop = states.map(i => state_pop_lerps[i](year)).reduce((a,b) => a+b, 0)

      p3.usRate[j] = {};
    	p3.usRate[j].year = year;
      p3.usRate[j].rate = 1000000 * us_cases / us_pop;
    }

  var us_rate_domain = d3.extent(p3.usRate.map(function(d) {return d.rate}));
  var scale = d3.scaleLinear().domain(us_rate_domain).range([p3.plotHght, 0]);
 /* let scale = function(yr) {
      if (yr <= 1967) {
          return d3.scaleLinear().domain([0, ]).range([]);
      } else if (yr <= 1980) {
          return d3.scaleLinear().domain().range();
      } else if (yr <= 1997) {
      } else return
  }*/
  d3.select("#plot-us")
    .datum(d => p3.usRate).transition(p3.transDur)
    .attr("d",
        d3.line().x(d => p3.plotXScale(d.year))
                .y(d => scale(d.rate))
       )
    .attr("stroke", "orange");


  d3.select("#plotUSG")
      .call(d3.axisLeft(scale))
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .text("Measles cases");

  d3.select("#plotUSG")
      .append("text")
      .attr("fill", "black")
      .attr("x", 60)
      .attr("y", 265)
      .text("Year");

  console.log(p3.usRate);

  for (let i = 0; i < p3.numStates; i++) {
      let stateData = p3.stRate[i];
      //let scale = d3.scaleLinear()
      //              .domain(d3.extent(stateData.rates.map(x => x.rate)))
      //              .range([0, 6000]);
      d3.select('#plot-' + stateData.state)
        .datum(d => stateData.rates).transition(p3.transDur)
        .attr("d",
            d3.line().x(d => p3.plotXScale(d.year))
                     .y(d => scale(d.rate))
        )
       .attr("stroke", d3.rgb(0,0,0,p3.plotOpac));
      //console.log(d3.extent(stateData.rates));

      //console.log(d3.extent(stateData.rates.map(x => x.rate)));
//      console.log(stateData.rates);
  }
  //d3.select('#plotsG")
   // .datum(d => p3.stRate)
   // .enter().append('hi');
  //console.log(p3.numStates);
  //console.log(p3.stRate);
}

function yearSelect(year) {
    // indicate the selected year
    d3.select("#stateMapY").text(year);
    // maybe more of your code here ...

    var state_rate = p3.stRate.map( function(d){
      return [d.state, d.rates[year-1930].rate];
    })

    //from p2 infant mortality colormap
    var base_colormap = function(d) {
      var scale = d3.scaleLinear().domain([0,30000])
      var phi = scale.range([0,Math.PI])(d);
      var hcl = d3.hcl(scale.range([330,0])(d),
                      23*Math.pow(Math.sin(phi),2),
                      scale.range([10,100])(d));
      return hcl;
    }
    // var IM_colormap = d3.scaleLinear().domain([0,30000]).range([0, 1]);
    // var IM_func = function(d) {return d3.scaleLinear().domain([0,1]).range([1,0])(d)};
    // var IM_color = function (d) {return d3.hcl(330 * IM_func(d),
    //  23*Math.pow(Math.sin((Math.PI * d)),2), 10+90*d)};
    // var base_colormap = IM_color(IM_colormap);

    //from p2 unemployment
    // var emcol = [d3.rgb(0,0,0), d3.rgb(230,0,0), d3.rgb(255,230,0), d3.rgb(255,255,255)];
    // function lerp(w, [a,b]) {return (1.0-2)*a + w*b; }
    // var base_colormap =  d3.scaleLinear()
    //      .domain([0,1/3,2/3,1].map(w => lerp(w,[0,40000])))
    //      .range(emcol)

    var controls = []
    for (var i =0; i<= 30000; i += 1000) {
      controls.push(i);
    }

    // var domain_array = [0,10,20,40,80,1000,15000,20000,25000,30000]
    // var range_array = [0,0.05,0.2,0.5,1,2,10,1000,5000,15000,30000]
    var domain_array = [0,5,10,40,80,1000,8000,15000,22000,25000,30000,40000]
    var range_array = [0,0.05,0.2,0.5,1,2,5,10,1000,3000,15000,30000,40000]

    var intMap = d3.scaleLinear().domain(domain_array).range(range_array)

    var colormap = d3.scaleLinear().domain(controls.map(intMap)).range(controls.map(base_colormap))

    d3.select("#stateGrid")
      .selectAll("g")
      .data(p3.stRate)
      .selectAll("rect")
      .data(d=>d.rates)
      .style("fill", function(d){return colormap(d.rate)});

    d3.selectAll(".stateHex")
      .data(p3.mapData)
      .transition(p3.transDur)
      .style("fill", function(d){
        if (colorBy =="value") {
          return colormap(state_rate.filter(function(x){
            return x[0] === d.StateAbbr
          })[0][1])
        } else if (colorby == "diff") {
          return colormap(state_rate.filter(function(x){
            return x[0] === d.StateAbbr
          })[0][1] - find(year))
        }
      })
}

/* getInterval(): utility function that returns the interval of a given year */
function getInterval(year) {
    if (year <= 1967)
      return 0;
    else if (year <= 1980)
      return 1;
    else if (year <= 1997)
      return 2;
    else return 3;
}

/* scaleInt(): given an interval,
   returns a linear scale for data
   in the given range */
function scaleInt(interval) {
  let domain;
  let min, max, range;
//  console.log(min);
//  console.log(max);
//  console.log("range");
  switch (interval) {
       case 0:
          //range = p3.int0.map(x => x.map(r => r.rate).filter(r => r > 0))
             //        .map(x => d3.extent(x));
         // min = Math.max.apply(null, range.map(x => x[0]));
         // max = Math.min.apply(null, range.map(x => x[1]));
          domain = [0, 20000];
          break;
       case 1:
         // range = p3.int1.map(x => x.map(r => r.rate).filter(r => r > 0))
           //          .map(x => d3.extent(x));
         // min = Math.max.apply(null, range.map(x => x[0]));
         // max = Math.min.apply(null, range.map(x => x[1]));
          domain = [0, 6000];
          break;
       case 2:
         // range = p3.int2.map(x => x.map(r => r.rate).filter(r => r > 0))
         //            .map(x => d3.extent(x));
         // min = Math.max.apply(null, range.map(x => x[0]));
         // max = Math.min.apply(null, range.map(x => x[1]));
          domain = [0, 500];
          break;
       default:
         // range = p3.int3.map(x => x.map(r => r.rate).filter(r => r > 0))
           //          .map(x => d3.extent(x));
         // min = Math.max.apply(null, range.map(x => x[0]));
        //  max = Math.min.apply(null, range.map(x => x[1]));
          domain = [0, 200];
          break;
   }
   return d3.scaleLinear()
            .domain(domain)
            .range([p3.plotHght, 0]);
}
/* onMouse() is called with mousedown (downward part of click) and
 mousemove events. The first argument is what element was under the cursor
 at the time, and the second argument is the XY position of the cursor
 within that element, which can used (if "plot" == IDspl[0]) to recover,
 via p3.plotXScale the corresponding year */
function onMouse(ID, xy) {
    var IDspl = ID.split("-"); // splits ID string at "-"s into array
    console.log("onMouse: ", ID, IDspl, xy, d3.event.type);
    // maybe more of your code here ...
    let state = IDspl[1];
    let year;
    // use plot clicks to select year
    if (IDspl[0] === "plot") {
      year = Math.round(p3.plotXScale.invert(xy[0]));
	   p3.yearSelect(year);
    } else if (IDspl[0] === "grid") {
      year = +IDspl[2];
  	   p3.yearSelect(year);
      p3.searchLink(IDspl[2],IDspl[1]);
    }
    interval = getInterval(year);
   // clear previous grid selection
   d3.selectAll(".stateHex")
       .attr("stroke-width", 0);
   // clear previous plot selection
   d3.select("#plotsG")
       .selectAll("path")
         .attr("stroke", d3.rgb(0,0,0,p3.plotOpac));
   if (state != 'bkgd') {
       // show current selection in plot
       d3.select("#plot-" + state)
           .attr("stroke", d3.rgb(0,0,255,1));
      // show current selection in map
      d3.select("#hex-" + state)
          .selectAll(".stateHex")
             .attr("stroke", "blue")
             .attr("stroke-opacity", 1)
             .attr("stroke-width", 5);
   }
    // responding to changes in intervals
    for (let i = 0; i < p3.numStates; i++) {
        let stateData = p3.stRate[i];
        d3.select('#plot-' + stateData.state)
          .datum(d => stateData.rates).transition(p3.transDur)
          .attr("d",
              d3.line().x(d => p3.plotXScale(d.year))
                       .y(d => scaleInt(interval)(d.rate))
          )
    }
   sortBySet(sortBy);
   console.log(sortBy);
   p3.searchLink(IDspl[2],IDspl[1]);
   console.log(IDspl[2],IDspl[1])
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
