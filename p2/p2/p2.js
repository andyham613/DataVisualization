/*
  You do your work for Project 2 in this file, within the region
  indicated below.  Comments throughout give details.

  The information exported from this "p2" (see bottom) are:
  p2.transDur: duration of transitions (in ms)
  p2.hexWidth: per-state hexagon size
  p2.circRad: radius of circles use to indicate states in bivarate maps
  p2.cmlSize: width=height of colormap legend picture
  p2.rowFinish: function called for each datum (row of .csv) by d3.csv()
  p2.dataFinish: function called once at the end data read by d3.csv()
  p2.choiceSet: function called with radioButton changes

  Note that index.html sets:
  p2.usData: data as read by d3.csv() and post-processed by p2.dataFinish()
  p2.cmlContext, p2.cmlImage: canvas context and image for colormap legend

  Beyond that, how you set this up is entirely up to you, and what you
  put in here, is up to you.  New functions or variables that are created
  by rowFinish or dataFinish, that are used by choiceSet, should be in the
  "p2" namespace (their names should started with "p2." e.g. "p2.helper")
*/

/* module syntax directly copied from d3.v4.js */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.p2 = global.p2 || {})));
}(this, (function (exports) { 'use strict';

// the marks in the colormap legend should transition() with this duration
const transDur = 500;
const hexWidth = 60; // size of hexagons in US map
const circRad = 5; // size of circle marks in bivariate map
const cmlSize = 210; // width and height of picture of colormap

/* ------------------------- Do not change anything above this line */

/* ALL YOUR WORK GOES IN HERE: the three important functions (rowFinish,
  dataFinish and choiceSet), as well as any other variables or utility
  functions you want to help implement those three functions. All the comments
  (including this) are tips/hints that you can erase if you want. */

  p2.area = [];
  p2.unemployment = [];
  p2.employment = [];
  p2.obesity = [];
  p2.infantMortality = [];
  p2.pl2012 = [];
  p2.pl2016 = [];
  p2.mensEarnings = [];
  p2.womensEarnings = [];
  p2.mensEarningsES = [];
  p2.womensEarningsES = [];
  p2.genderEarningsES = [];
  p2.mensEarningsER = [];
  p2.womensEarningsER = [];
  p2.genderEarningsER = [];
  p2.VT = [];
  p2.pl2012_bv = [];
  p2.pl2016_bv = [];
  p2.obama = [];
  p2.romney = [];
  p2.clinton = [];
  p2.trump = [];

function rowFinish(d) {
    /* compute here the information about each state that will be needed for
       visualization later (e.g. unemployment rate)) */
    d.area = +d.Area;

    d.employed = +d.Employed;
    d.laborForce = +d.LaborForce;
    d.unemployment = 100 - 100 * (d.employed/d.laborForce);

    d.population = +d.Population;
    d.employment = 100 * (d.Employed/d.Population);

    d.obesity = +d.Obesity;
    d.infantMortality = + d.InfantMortality;

    d.obama = +d.Obama;
    d.romney = +d.Romney;
    d.pl2012 = d.obama / (1 + d.romney + d.obama);

    d.clinton = +d.Clinton;
    d.trump = +d.Trump;
    d.pl2016 = d.clinton / (1 + d.trump + d.clinton);

    d.mensEarnings = +d.MenEarning;
    d.womensEarnings = +d.WomenEarning;
    return d;  // keep this line, or else data becomes empty
}

function dataFinish(data) {
    /* compute here, with the help of one or more "data.map(function(d) {
       ... })", per-state information that can only be computed once all the
       data has read in (e.g. the political leaning variable). Also, learn
       here (once) the extents (the min-to-max range, as learned by
       d3.extent()) for variables that need to be displayed with the colormap
       and indicated in the colormap legend.  Then, create some convenient and
       uniform way to refer to the information needed for every variable
       display: e.g. how to retrieve that variable from each element of the
       data array, the min-to-max extent (as from d3.extent()) of that
       variable, and which colormap to use. */



       /*Setting up all the elements of the basic data */
       //Does area. I break up the area by percentages and scale by log because of how massive the discrepancies are
       p2.area.minmax = d3.extent(data.map(function(d) {return d.area;}));
       p2.area.colormap = d3.scaleLinear().domain(p2.area.minmax).range([0,1]);
       p2.area.pixelScale = d3.scaleLinear().domain([0, 1]).range(p2.area.minmax);
       p2.area.colormap_legend = d3.scaleSqrt().domain([0,1]).range([0,1]);

       p2.area.color = d3.scaleLinear().domain([0, .001, .01, .06, .2, .3]).range([
        d3.hsl("#000000"), d3.hsl("#0d0d0d"), d3.hsl("#595959"), d3.hsl("#8c8c8c"), d3.hsl("#e6e6e6"), d3.hsl("#ffffff")]);



       //Calculates the unemployment color map
       p2.unemployment.minmax = d3.extent(data.map(function(d) {return d.unemployment;}));
       p2.unemployment.colormap = d3.scaleLinear().domain(p2.unemployment.minmax).range([0,1]);
       p2.unemployment.colormap_legend = d3.scaleLinear().domain([0,1]).range([0,1]);
       p2.unemployment.color = d3.scaleLinear().domain([0, 1/3, 2/3, 1])
                                 .range([d3.rgb(0, 0, 0), d3.rgb(230,0,0), d3.rgb(255,230,0), d3.rgb(255, 255, 255)]);


       //calculates the employment color map
       p2.employment.minmax = d3.extent(data.map(function(d) {return d.employment;}));
       p2.employment.colormap = d3.scaleLinear().domain(p2.employment.minmax).range([0,1]);
       p2.employment.colormap_legend = d3.scaleLinear().domain([0,1]).range([0,1]);
       p2.employment.color = d3.scaleLinear().domain([0, 1/3, 2/3, 1])
                               .range([d3.rgb(255, 255, 255), d3.rgb(255,230,0), d3.rgb(230,0,0), d3.rgb(0, 0, 0)]);



       //Calculates the color map for obesity based on the given request
       p2.obesity.minmax = d3.extent(data.map(function(d) {return d.obesity;}));
       p2.obesity.colormap = d3.scaleLinear().domain(p2.obesity.minmax).range([0,1]);
       p2.obesity.colormap_legend = d3.scaleLinear().domain([0,1]).range(p2.obesity.minmax);
       var h = function(a1, a2, a3) {return d3.hsl(a1, a2, a3);};
       p2.obesity.color = d3.scaleQuantize().domain([0,1])
       .range([h(110, .60, .80), h(135, .40, .70), h(150, .24, .60),
               h(165, .12, .50), h(180, .0, .40), h(195, .12, .50),
               h(210, .24, .60), h(225, .40, .70), h(240, .60, .8)]);


       //calculates the color map for infant mortality using the assigned math functions
       p2.infantMortality.minmax = d3.extent(data.map(function(d) {return d.infantMortality;}));
       p2.infantMortality.colormap = d3.scaleLinear().domain(p2.infantMortality.minmax).range([0, 1]);
       p2.infantMortality.colormap_legend = d3.scaleLinear().domain(p2.infantMortality.minmax).range(p2.infantMortality.minmax);
       var infantMortality_func = function(d) {return d3.scaleLinear().domain([0,1]).range([1,0])(d)};
       p2.infantMortality.color = function (d) {return d3.hcl(330 * infantMortality_func(d),
        23*Math.pow(Math.sin((Math.PI * d)),2), 10+90*d)};



       //pl2012 color and colormap implementation
       p2.pl2012.minmax = d3.extent(data.map(function(d) {return d.pl2012;}));
       p2.pl2012.colormap = d3.scaleLinear().domain([0,1]).range([0,1]);
       p2.pl2012.colormap_help = d3.scaleLinear().domain([0,1]).range(p2.pl2012.minmax);
       var min_color = d3.hcl(d3.rgb(210, 0, 0));
       var max_color = d3.hcl(d3.rgb(0, 0, 210));
       //returns the proper hue


       var h = function(d) {
         if(d < 0.5) {
           return min_color.h;
         } else {
          return max_color.h;
       }};
       //ranges from min luminance to the max luminance
       var c_bool = function(d) {
         if(d > 0.5) {
           return max_color.c;
         } else {
          return min_color.c;
       }};
       //ranges from 0 to 100
       var cscl = function(pl) {
         return c_bool(pl) * (1 - (Math.pow((1 - (Math.abs(pl - 0.5))/0.5), 4) ))};
      //scales from the min luminance to the max luminance
       var l = function(d) {
         return d3.scaleLinear().domain([0, 1]).range([min_color.l, max_color.l])(d);
       };

       p2.pl2012.color = function(d) {return d3.hcl(h(d), cscl(d), l(d))};



       //pl2016 color information, uses a lot of the previous 2012 stuff
       p2.pl2016.minmax = d3.extent(data.map(function(d) {return d.pl2016;}));
       p2.pl2016.colormap = d3.scaleLinear().domain([0,1]).range([0,1]);
       p2.pl2016.color = function(d) {return d3.hcl(h(d), cscl(d), l(d))};


        //Implementation of ES Gender income Bivariate
       p2.mensEarnings.minmax = d3.extent(data.map(function(d) {return d.mensEarnings;}));
       p2.womensEarnings.minmax = d3.extent(data.map(function(d) {return d.womensEarnings;}));
       var overallMax = Math.max(p2.mensEarnings.minmax[1], p2.womensEarnings.minmax[1]);
       var L = function(dmen, dwomen) {
        return 30 + 45 * ((dmen + dwomen) / overallMax);
       };
       var B = function(dmen, dwomen) {
        return 230 * ((dmen - dwomen) / overallMax);
       };
       p2.genderEarningsES.colormap = d3.scaleLinear().domain(0, Math.max(overallMax))
                                        .range(0, Math.max(overallMax));
       p2.genderEarningsES.color = function(dmen, dwomen) {return d3.lab(L(dmen, dwomen), 0, B(dmen, dwomen))};


       //Implementation of ER Gender Income, with necessary math
       p2.mensEarningsER = data.map(function(d) {
          return d.mensEarnings / p2.mensEarnings.minmax[1];
        });
       p2.womensEarningsER = data.map(function(d) {
          return d.womensEarnings / p2.womensEarnings.minmax[1];
        });
       var erm = function (dmen) {
        return (dmen - p2.mensEarnings.minmax[0]) /
               (p2.mensEarnings.minmax[1] - p2.mensEarnings.minmax[0]);
       };
       var erw = function(dwomen) {
        return (dwomen- p2.womensEarnings.minmax[0]) /
               (p2.womensEarnings.minmax[1] - p2.womensEarnings.minmax[0]);
       };
       var L_er = function (dmen, dwomen) {
        return 30 + 45 * (erw(dwomen) + erm(dmen));
       };
       var B_er = function (dmen, dwomen) {
        return 230 * (erm(dmen) - erw(dwomen));
       }
       p2.mensEarningsER.colormap_menER = d3.scaleLinear().domain([0,1]).range(p2.mensEarnings.minmax);
       p2.womensEarningsER.colormap_womenER = d3.scaleLinear().domain([0,1]).range(p2.womensEarnings.minmax);

       p2.mensEarningsER.colormap = d3.scaleLinear().domain([0,1]).range([0,1]);

       p2.genderEarningsER.colormap = d3.scaleLinear().domain(0, overallMax).range(0, overallMax);
       p2.genderEarningsER.color = function(dmen, dwomen) {
        return d3.lab(L_er(dmen, dwomen), 0, B_er(dmen, dwomen))};



        //Does the math we've been told to do for 2012 in order to create the bivariate color map
        p2.obama.minmax = d3.extent(data.map(function(d) {return d.obama;}));
        p2.romney.minmax = d3.extent(data.map(function(d) {return d.romney;}));
        var VT = data.map(function(d) {
          return Math.max(d.clinton + d.trump, d.obama + d.romney);
        });
        p2.VT.minmax = d3.extent(data.map(function(d) {
          return Math.max(d.clinton + d.trump, d.obama + d.romney);
        }));
        var VF = function(dObama, dRomney) {
          return (dObama + dRomney) / p2.VT.minmax[1]};
        var VA = function(dObama, dRomney) {
          return (1 - Math.pow((1 - VF(dObama, dRomney)), 3))};
        p2.pl2012.colormap_obama = d3.scaleLinear().domain([0,1]).range(p2.obama.minmax);
        p2.pl2012.colormap_romney = d3.scaleLinear().domain([0,1]).range(p2.romney.minmax);
        p2.pl2012_bv.color = function(dObama, dRomney, d2) {
          var temp = d3.hcl(p2.pl2012.color(d2));
          return d3.hcl(temp.h, (VA(dObama, dRomney) * temp.c), VA(dObama, dRomney)*temp.l + ((-100*VA(dObama, dRomney) + 100)))};


        //Does the necessary math for the 2016 bivariate map, same as 2012
        p2.clinton.minmax = d3.extent(data.map(function(d) {return d.clinton;}));
        p2.trump.minmax = d3.extent(data.map(function(d) {return d.trump;}));
        var WF = function(dClinton, dTrump) {
          return (dClinton + dTrump) / p2.VT.minmax[1]};
        var WA = function(dClinton, dTrump) {
          return (1 - Math.pow((1 - WF(dClinton, dTrump)), 3))};
        p2.pl2016.colormap_clinton = d3.scaleLinear().domain([0,1]).range(p2.clinton.minmax);
        p2.pl2016.colormap_trump = d3.scaleLinear().domain([0,1]).range(p2.trump.minmax);
        p2.pl2016_bv.colormap = d3.scaleLinear().domain(0, p2.VT.minmax[1]).range(0, 1);
        p2.pl2016_bv.color = function(dClinton, dTrump, d2) {
          var temp = d3.hcl(p2.pl2016.color(d2));
          return d3.hcl(temp.h, WA(dClinton, dTrump) * temp.c, WA(dClinton, dTrump)*temp.l + ((-100*WA(dClinton, dTrump) + 100)));
        };



}

function choiceSet(wat) {
    /* is this a univariate map? */
    var uni = (["AR", "EM", "UN", "OB", "IM", "VU", "WU"].indexOf(wat) >= 0);
    //var bi = (["VB", "WB", "ES", "ER"].indexOf(wat) >= 0);

    var t = d3.transition()
    .duration(p2.transDur)
    .ease(d3.easeLinear);

    //first step: draw out the US map with colors. Switches on the value of wat and performs
    //very similar actions with slightly different data and functions.
    //I select the us map and then, with transition t set above, return the color of the colormap
    //of the data. In some of the bivariate cases I just return the color. Also draws the colormap
    //legend, often employing the separate colormap_legend. I get the color at each pixel with the
    //colormap legend and the color function and then draw the color/rest of the data
    //draws the colormap legend
    if(wat == "AR") {
              var i = 0;
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){
        return p2.area.color(p2.area.colormap(d.area))});

      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
               var color = d3.rgb(p2.area.color(p2.area.colormap(p2.area.colormap.invert(i/p2.cmlSize))))

               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + p2.area.minmax[0] + "</text>")
      d3.select("#xmaxlabel").html("<text>" + p2.area.minmax[1] + "</text>")
      d3.select("#yminlabel").html("<text>" + "" + "</text>")
      d3.select("#ymaxlabel").html("<text>" + "" + "</text>")
      var dataToCml = d3.scaleLinear().domain(p2.area.minmax).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 0.5)
        .attr("ry", p2.cmlSize/4)
        .attr("cx", function(d) {return dataToCml(d.area);})
        .attr("cy", p2.cmlSize/2);
    }

    else if(wat == "EM") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){ return p2.employment.color(p2.employment.colormap(d.employment))});

      for (var j=0, k=0; j < p2.cmlSize; j++) {
        for (var i=0; i < p2.cmlSize; i++) {
          var color = d3.rgb(p2.employment.color(p2.employment.colormap(p2.employment.colormap.invert(i / p2.cmlSize))));
          p2.cmlImage.data[k++] = color.r;
          p2.cmlImage.data[k++] = color.g;
          p2.cmlImage.data[k++] = color.b;
          p2.cmlImage.data[k++] = 255;
        }
      }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.2f")(p2.employment.minmax[0]) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.2f")(p2.employment.minmax[1]) + "</text>");
      d3.select("#yminlabel").html("<text>" + "</text>");
      d3.select("#ymaxlabel").html("<text>" + "</text>");
      var dataToCml = d3.scaleLinear().domain(p2.employment.minmax).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 0.5)
        .attr("ry", p2.cmlSize/4)
        .attr("cx", function(d) {return dataToCml(d.employment);})
        .attr("cy", p2.cmlSize/2);
    }

    else if(wat == "UN") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
        .transition(t)
        .style("fill", function(d){ return p2.unemployment.color(p2.unemployment.colormap(d.unemployment))});

      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
               var color = d3.rgb(p2.unemployment.color(p2.unemployment.colormap(p2.unemployment.colormap.invert(i / p2.cmlSize))));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.2f")(p2.unemployment.minmax[0]) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.2f")(p2.unemployment.minmax[1]) + "</text>");
      d3.select("#yminlabel").html("<text>" + "" + "</text>")
      d3.select("#ymaxlabel").html("<text>" + "" + "</text>")
      var dataToCml = d3.scaleLinear().domain(p2.unemployment.minmax).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 0.5)
        .attr("ry", p2.cmlSize/4)
        .attr("cx", function(d) {return dataToCml(d.unemployment);})
        .attr("cy", p2.cmlSize/2);
    }

    else if (wat == "OB") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){ return p2.obesity.color(p2.obesity.colormap(d.obesity))});
      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
               var color = d3.rgb(p2.obesity.color(p2.obesity.colormap(p2.obesity.colormap.invert(i / p2.cmlSize))));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(p2.obesity.minmax[0]) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(p2.obesity.minmax[1]) + "</text>");
      d3.select("#yminlabel").html("<text>" + "" + "</text>")
      d3.select("#ymaxlabel").html("<text>" + "" + "</text>")
      var dataToCml = d3.scaleLinear().domain(p2.obesity.minmax).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 0.5)
        .attr("ry", p2.cmlSize/4)
        .attr("cx", function(d) {return dataToCml(d.obesity);})
        .attr("cy", p2.cmlSize/2);
    }

    else if(wat == "IM") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){
        return p2.infantMortality.color(p2.infantMortality.colormap(d.infantMortality))});

      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
               var color = d3.rgb(p2.infantMortality.color(p2.infantMortality.colormap(p2.infantMortality.colormap.invert(i / p2.cmlSize))));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(p2.infantMortality.minmax[0]) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(p2.infantMortality.minmax[1]) + "</text>");
      d3.select("#yminlabel").html("<text>" + "" + "</text>")
      d3.select("#ymaxlabel").html("<text>" + "" + "</text>")
      var dataToCml = d3.scaleLinear().domain(p2.infantMortality.minmax).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 0.5)
        .attr("ry", p2.cmlSize/4)
        .attr("cx", function(d) {return dataToCml(d.infantMortality);})
        .attr("cy", p2.cmlSize/2);
    }

    else if(wat == "VU") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function (d) {
        return p2.pl2012.color(p2.pl2012.colormap(d.pl2012));});
      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
               var color = d3.rgb(p2.pl2012.color(p2.pl2012.colormap((i / p2.cmlSize))));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(1) + "</text>");
      d3.select("#yminlabel").html("<text>" + "" + "</text>")
      d3.select("#ymaxlabel").html("<text>" + "" + "</text>")
      var dataToCml = d3.scaleLinear().domain([0,1]).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 0.5)
        .attr("ry", p2.cmlSize/4)
        .attr("cx", function(d) {return dataToCml(d.pl2012);})
        .attr("cy", p2.cmlSize/2);
    }
    else if(wat == "WU") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function (d) {
        return p2.pl2012.color(p2.pl2012.colormap(d.pl2016));});
      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
               var color = d3.rgb(p2.pl2016.color(p2.pl2016.colormap(i / p2.cmlSize)));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(1) + "</text>");
      d3.select("#yminlabel").html("<text>" + "" + "</text>")
      d3.select("#ymaxlabel").html("<text>" + "" + "</text>")
      var dataToCml = d3.scaleLinear().domain([0,1]).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 0.5)
        .attr("ry", p2.cmlSize/4)
        .attr("cx", function(d) {return dataToCml(d.pl2016);})
        .attr("cy", p2.cmlSize/2);
    }
    else if(wat == "VB") {
      var VF = function(dObama, dRomney) {
        return (dObama + dRomney) / p2.VT.minmax[1]};
      var VA = function(dObama, dRomney) {
        return (1 - Math.pow((1 - VF(dObama, dRomney)), 3))};
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){ return p2.pl2012_bv.color(d.obama, d.romney, d.pl2012)});
      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
            var temp2 = p2.pl2012.colormap(i / p2.cmlSize);
            var temp_obama = p2.pl2012.colormap_obama(p2.pl2012.colormap.invert(1 - j / p2.cmlSize));
            var temp_romney = p2.pl2012.colormap_romney(p2.pl2012.colormap.invert(1 - j / p2.cmlSize));
            var color = d3.hcl(p2.pl2012_bv.color(temp_obama, temp_romney, temp2));
               if(j < 1) {}
               var color = d3.rgb(p2.pl2012_bv.color(temp_obama, temp_romney, temp2));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(1) + "</text>");
      d3.select("#yminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>")
      d3.select("#ymaxlabel").html("<text>" + d3.format(",.1f")(1) + "</text>")
      var dataToCml = d3.scaleLinear().domain([0,1]).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 4.5)
        .attr("ry", 4.5)
        .attr("cx", function(d) {return dataToCml(d.pl2012);})
        .attr("cy", function(d) {return p2.cmlSize - dataToCml(VA(d.obama,d.romney));});
    }
    else if(wat == "WB") {
      var WF = function(dClinton, dTrump) {
        return (dClinton + dTrump) / p2.VT.minmax[1]};
      var WA = function(dClinton, dTrump) {
        return (1 - Math.pow((1 - WF(dClinton, dTrump)), 3))};
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){ return p2.pl2016_bv.color(d.clinton, d.trump, d.pl2016)});
      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
             var temp2 = p2.pl2016.colormap(i / p2.cmlSize);
             var temp_clinton = p2.pl2016.colormap_clinton(p2.pl2016.colormap.invert(1 - j / p2.cmlSize));
             var temp_trump = p2.pl2016.colormap_trump(p2.pl2016.colormap.invert(1 - j / p2.cmlSize));
             var color = d3.hcl(p2.pl2016_bv.color(temp_clinton, temp_trump, temp2));
               if(j < 1) {}
               var color = d3.rgb(p2.pl2016_bv.color(temp_clinton, temp_trump, temp2));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(1) + "</text>");
      d3.select("#yminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>")
      d3.select("#ymaxlabel").html("<text>" + d3.format(",.1f")(1) + "</text>")
      var dataToCml = d3.scaleLinear().domain([0,1]).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 4.5)
        .attr("ry", 4.5)
        .attr("cx", function(d) { return dataToCml(d.pl2016);})
        .attr("cy", function(d) { return p2.cmlSize - dataToCml(WA(d.clinton,d.trump));});
    }
    else if(wat == "ES") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){ return p2.genderEarningsES.color(d.mensEarnings, d.womensEarnings)});

      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
            var temp_menES = p2.mensEarningsER.colormap_menER(i / p2.cmlSize);
            var temp_womenES = p2.womensEarningsER.colormap_womenER(1 - j / p2.cmlSize);
               var color = d3.rgb(p2.genderEarningsER.color(temp_menES, temp_womenES));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }

      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(69) + "</text>");
      d3.select("#yminlabel").html("<text>" + d3.format(",.1f")(0) + "</text>")
      d3.select("#ymaxlabel").html("<text>" + d3.format(",.1f")(69) + "</text>")
      var dataToCml = d3.scaleLinear().domain([0,69]).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 4.5)
        .attr("ry", 4.5)
        .attr("cx", function(d) {return dataToCml(d.mensEarnings);})
        .attr("cy", function(d) { return p2.cmlSize - dataToCml(d.womensEarnings);});
    }


    else if(wat == "ER") {
      d3.select("#mapUS").selectAll("path").data(p2.usData)
      .transition(t)
      .style("fill", function(d){ return p2.genderEarningsER.color(d.mensEarnings, d.womensEarnings)});

      for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
            var temp_menER = p2.mensEarningsER.colormap_menER(i / p2.cmlSize);
            var temp_womenER = p2.womensEarningsER.colormap_womenER(1 - j / p2.cmlSize);
               var color = d3.rgb(p2.genderEarningsER.color(temp_menER, temp_womenER));
               p2.cmlImage.data[k++] =  color.r;
               p2.cmlImage.data[k++] =  color.g;
               p2.cmlImage.data[k++] =  color.b;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }

      p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
      d3.select("#xminlabel").html("<text>" + d3.format(",.1f")(39) + "</text>");
      d3.select("#xmaxlabel").html("<text>" + d3.format(",.1f")(69) + "</text>");
      d3.select("#yminlabel").html("<text>" + d3.format(",.1f")(30) + "</text>")
      d3.select("#ymaxlabel").html("<text>" + d3.format(",.1f")(60) + "</text>")
      var dataToCml = d3.scaleLinear().domain(p2.mensEarnings.minmax).range([0,p2.cmlSize]);
      d3.select("#cmlMarks")
        .selectAll("ellipse")
        .data(p2.usData)
        .attr("rx", 4.5)
        .attr("ry", 4.5)
        .attr("cx", function(d) {return dataToCml(d.mensEarnings);})
        .attr("cy", function(d) {return 4.5 - p2.mensEarnings.minmax[1] +  p2.cmlSize - dataToCml(d.womensEarnings);});
    }






    /* 0) based on "wat", get all the information (created in dataFinish())
       about how to visualize "wat" */

    /* 1) apply colormap to the states in #mapUS.  Be sure to use a transition
       of duration p2.transDur.  Try starting with:
       d3.select("#mapUS").selectAll("path").data(p2.usData) ... and set the
       color with .style("fill", function(d){ return ... color ...; })*/


    /* 2) reset pixels of cmlImage.data, by traversing it via (see index.html):
       for (var j=0, k=0; j < p2.cmlSize; j++) {
           for (var i=0; i < p2.cmlSize; i++) {
               p2.cmlImage.data[k++] =  ... red (from 0 to 255) ... ;
               p2.cmlImage.data[k++] =  ... green ... ;
               p2.cmlImage.data[k++] =  ... blue ... ;
               p2.cmlImage.data[k++] =  255; // opacity
           }
       }
       For the univariate colormaps, only compute the colormap values for the
       first row, and then on subsequent rows just copy the values from
       previous row. Finally, redisplay image with:
       p2.cmlContext.putImageData(p2.cmlImage, 0, 0);
       Transitions on canvases are more work, so it is okay for this colormap
       image to change suddenly (w/out transition of duration p2.transDur) */

    /* 3) Update the labels at the corners of the colormap with
       d3.select("#xminlabel").html("<text>" + x0 + "</text>"); where x0 is
       the minimum value shown along the X axis of the colormap, and similarly
       for the other three labels (xmaxlabel, yminlabel, ymaxlabel). The
       labels should show the range of the "wat" values that are being
       colormapped.  For univariate maps, set xminlabel and yminlabel to show
       the range, and set yminlabel and ymaxlabel to an empty string.  For
       bivariate maps, set all labels to show the X and Y ranges. */

    /* 4) update (with a transition of duration p2.transDur) the attributes of
       the #cmlMarks ellipses to display the appropriate set of per-state
       marks over the colormap legend.  For univariate maps, set:
           rx = 0.5         (e.g. .attr("rx", 0.5))
           ry = p2.cmlSize/4
           cx = ... position to indicate data value ...
           cy = p2.cmlSize/2
       For bivariate maps, set:
           rx = p2.circRad
           ry = p2.circRad
           cx = ... position to indicate data value along X ...
           cy = ... position to indicate data value along Y ... */

}

/* ------------------------- Do not change anything below this line */

exports.hexWidth = hexWidth;
exports.transDur = transDur;
exports.circRad = circRad;
exports.cmlSize = cmlSize;
exports.rowFinish = rowFinish;
exports.dataFinish = dataFinish;
exports.choiceSet = choiceSet;
Object.defineProperty(exports, '__esModule', { value: true });
})));
