
(function() {
  var margin = { "top": 30, "right": 0, "bottom": 40, "left": 120 };

  var width = 950 - margin.left - margin.right,
      height = 220 - margin.top - margin.bottom;

  var maxTrailerLength = 152100;

  var frameTipHeight = 110,
      frameMosaicColumns = 10;

  var barHeight = 8,
      missingSectionHeight = 25;

  var trailerScale = d3.scale.linear()
      .domain([0, maxTrailerLength])
      .range([0, width]);

  var formatDouble = d3.format("02d"),
      formatSeconds = function(d) { return Math.round(d / 1000) + " sec"; }
      formatTimecode = function(d) { return formatDouble(d / 6e4 | 0) + ":" + formatDouble((d / 1e3 | 0) % 60); };

  d3.json("donnees.json", function(error, movies) {

    var movie = d3.select("#g-graphic").selectAll(".movie")
        .data(movies)
      .enter().append("div")
        .attr("class", "movie");

    movie.append("h3")
        .text(function(d) { return d.name; });

    movie.append("p")
        .classed("intro", true)
        .html(function(d) { return d.intro; });

    movie.each(renderMovie);

    d3.selectAll(".x.axis g text")
        .style("text-anchor", "start")
        .attr("x", 7)
        .attr("y", -7)

    d3.selectAll(".x.axis .tick.minor")
        .attr("y2", -4)

    createLightbox();

  });

  function renderMovie(movieData, i) {
    var movie = d3.select(this),
        movieLength = movieData.movie_length_ms; //movieData.bounds_ms[1] - movieData.bounds_ms[0]
        sectionDuration = movieLength / 3,
        trailerData = movieData.trailer,
        time_ms = trailerData.trailer_length_ms,
        shotsData = trailerData.reviewed_shots || trailerData.shots;

    shotsData.slice().reverse().forEach(function(shot) {
      shot.length_ms = time_ms - (time_ms = shot.start_ms);
      if (shot.missing || shot.suppress) {
        shot.match_ms = -1;
      }
    });

    var sections = [
      {label: "Beginning of film", ms: sectionDuration},
      {label: "Middle", ms: sectionDuration * 2},
      {label: "End", ms: sectionDuration * 3}
    ];

    var movieScale = d3.scale.linear()
        .domain([-1, 0, movieLength])
        .range([(height + missingSectionHeight / 2), 0, height]);

    var xAxis = d3.svg.axis()
        .scale(trailerScale)
        .tickSize(5)
        .tickSize(15)
        .tickValues([0, 30000, 60000, 90000, 120000])
        .orient("top")
        .tickSubdivide(3)
        .tickFormat(formatSeconds);

    var line = d3.svg.line()
        .x(function(d) { return movieScale(d.x); })
        .y(function(d) { return d.y; })
        .interpolate("cardinal");

    var scatterLine = d3.svg.line()
        .x(function(d) { return trailerScale(d.start_ms); })
        .y(function(d) { return movieScale(d.match_ms); })
        .interpolate("step-after");

    var color = d3.scale.threshold()
        .domain([0,sectionDuration, sectionDuration * 2])
        .range(["#ccc","#fd9226", "#fa4f43", "#a20f79"]);

    var frameTipWidth = movieData.trailer.thumb_width;

    var stage = movie.append("div")
        .classed("stage", true);

    var svg = stage.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    svg.append("path")
        .datum(shotsData.filter(function(d) { return !d.suppress && !d.missing; }))
        .attr("class", "scatterline")
        .attr("d", scatterLine);

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
      .append("text")
        .attr("x", 7)
        .attr("y", -22)
        .text("Start of trailer \u2192");

    var frameLabel = svg.selectAll(".x.axis g:first-of-type text")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .datum(null)
        .style("display", "none");

    var yAxis = svg.append("g")
        .attr("class", "y axis");

    yAxis.append("line")
        .classed("baseline", true)
        .attr("x1", -margin.left)
        .attr("y1", movieScale(0))
        .attr("x2", width + margin.right)
        .attr("y2", movieScale(0));

    yAxis.append("line")
        .classed("separator", true)
        .attr("y1", -margin.top)
        .attr("y2", height + missingSectionHeight);

    var sectionMarkers = yAxis.selectAll(".section-marker")
        .data(sections)
      .enter().append("g")
        .classed("section-marker", true)
        .attr("transform", function(d) { return "translate(0," + movieScale(d.ms) + ")"; });

    sectionMarkers.append("rect")
        .attr("x", trailerScale(0))
        .attr("y", -height / 3)
        .attr("width", width + margin.right)
        .attr("height", height / 3)
        .style("fill", function(d) { return color(d.ms - 1); });

    sectionMarkers.append("line")
        .classed("section-line", true)
        .attr("x1", -margin.left)
        .attr("x2", width + margin.right);

    sectionMarkers.append("text")
        .classed("label", true)
        .attr("y", -height / 6)
        .attr("dy", ".35em")
        .attr("x", -15)
        .style("fill", function(d) { return color(d.ms - 1); })
        .text(function(d) { return d.label; });

    var missingSection = yAxis.append("g")
        .attr("class", "missing-section")
        .attr("transform", "translate(0," + height + ")");

    missingSection.append("text")
        .text("Not in film")
        .attr("y", missingSectionHeight / 2)
        .attr("dy", "0.4em")
        .attr("x", -15)

    missingSection.append("line")
        .classed("section-line", true)
        .attr("y1", missingSectionHeight)
        .attr("y2", missingSectionHeight)
        .attr("x1", -margin.left)
        .attr("x2", width + margin.right);

    var cut = svg.selectAll(".cut")
        .data(shotsData)
      .enter().append("g")
        .attr("class", "cut")
        .on("mouseover", setFrame)
        .on("mouseout", resetFrame);

    cut.filter(function(d) { return true/*!d.suppress*/; }).append("rect")
        .classed("bar", true)
        .attr("data-id", function(d, i) { return i; })
        .attr("width", function(d) {
          return Math.max(trailerScale(d.length_ms) - 1, 1);
        })
        .attr("height", barHeight)
        .attr("rx", 1)
        .attr("y", function(d) {
          return movieScale(d.match_ms || 0) - barHeight / 2;
        })
        .attr("x", function(d) { return trailerScale(d.start_ms); })
        .attr("fill", function(d) { return color(d.match_ms || 0); });

    cut.append("rect")
        .classed("bar-hover", true)
        .attr("width", function(d) { return trailerScale(d.length_ms); })
        .attr("height", height + missingSectionHeight - 1)
        .attr("y", 1)
        .attr("x", function(d) { return trailerScale(d.start_ms); });

    setFrame(movieData, movieData.key_frame);
    resetFrame();

    function setFrame(d, i) {
      frameLabel
          .classed("frame-label", true)
          .style("display", null)
          .text(formatTimecode(d.start_ms))
          .attr("x", Math.max(6, Math.min(width - frameLabel.node().getComputedTextLength() - 6, trailerScale(d.start_ms))));

      svg.selectAll(".x.axis text")
          .style("opacity", function(t) { return Math.abs(d.start_ms - t) < 10000 ? 0 : null; });

      movie.select(".thumbnail-image")
          .style("left", -Math.round(movieData.trailer.thumb_width * (i % frameMosaicColumns) + 2) + "px")
          .style("top", -Math.round(Math.floor(i / frameMosaicColumns) * frameTipHeight + 2) + "px");

      movie.select(".play")
          .style("opacity", 0);
    }

    function resetFrame() {
      svg.selectAll(".x.axis text")
          .style("opacity", null);

      frameLabel
          .style("display", "none");

      movie.select(".play")
          .style("opacity", 0.5);
    }
  }

  function createLightbox() {
    var w = 720,
        h = 405,
        padding = 20;

    var lb = d3.select("#g-graphic").append("div")
        .classed("lightbox", true)
        .style("display", "none")
        .on("click", hideLightbox);

    var lbContent = lb.append("div")
        .style("position", "absolute")
        .style("left", "50%")
        .style("top", "50%");

    var lbFrame = lbContent.append("div")
        .style("width", w + padding * 2 + "px")
        .style("height", h + padding * 2 + "px")
        .style("position", "absolute")
        .style("left", (-(w + padding * 2)/ 2) + "px")
        .style("top", (-(h + padding * 2) / 2) + "px")
        .style("background-color", "black");

    lbFrame.append("div")
        .attr("id", "trailersVideoPlayerContainer")
        .style("width", w + "px")
        .style("height", h + "px")
      .append("iframe")
        .attr("width", w)
        .attr("height", h)
        .attr("frameborder", 0)
        .property("allowfullscreen", true)
        .style("position", "absolute")
        .style("left", padding + "px")
        .style("top", padding + "px");

    lbFrame.append("a")
        .attr("class", "g-close-button")
        .text("Close")
  }

  function showLightbox(d) {
    if (d3.event.metaKey || d3.event.altKey) return;

    d3.select(".lightbox")
        .style("display", "block")
      .select("iframe")
        .attr("src", "http://www.youtube.com/embed/" + d.youtube + "?rel=0&autoplay=1");

    d3.event.preventDefault();
  }

  function hideLightbox(d) {
    d3.select(".lightbox")
        .style("display", "none")
      .select("iframe")
        .attr("src", "about:blank");
  }

})();
