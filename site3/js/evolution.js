
// La variable globaldata pourra être chargée depuis un fichier csv/json par exemple. 
var globaldata = [{mot: "hollande", debat: [20, 10 , 15, 5]},
		  {mot: "securite", debat : [12, 5, 18, 20]}
		 ];

//Il faut avoir "styleoratoire" pour la fenetre qui montre la complexite : 

globaldata.push({mot: "styleoratoire", debat: [20.39, 15, 10, 5, 4]});

function getMot( mot){
    var i =0 ;
    for(i=0; i<globaldata.length ; i++){
	if(globaldata[i].mot === mot){
	    return globaldata[i];
	}
    }
};

function fun1(notredata){

  var margin = { "top": 30, "right": 0, "bottom": 40, "left": 120 };

  var width = 500,
      height = 220 - margin.top - margin.bottom;

  var maxTrailerLength = 152100;

  var frameTipHeight = 110,
      frameMosaicColumns = 10;

  var barHeight = 8,
      missingSectionHeight = 25;

  var formatDouble = d3.format("02d"),
      formatSeconds = function(d) { }
      formatTimecode = function(d) { 
	  if(d==0) {
	      return "1988";
	  } else if(d==1000) {
	      return "1995";
	  } else if(d==2000) {
	      return "2002";
	  } else {
	      return "2007";
	  }  
      };
    
    var style = (notredata.mot === "styleoratoire");

    var file = "donneesMots.json";
    if(style){
	file = "donnees3.json"
    }
//Taille différente selon le graphe : 
    var maxdom = 0 ; 
    if(style){
	maxdom=5000;    
    }
    else{
	maxdom=4000;
    }

 var trailerScale = d3.scale.linear()
      .domain([0, maxdom])
      .range([0, 500]);
    
    d3.json(file, function(error, movies) {
	
	console.log(movies);
	if(!style){

	    movies[0].name += notredata.mot ;	
	    
	    var i = 0 ; 
	    for(i=0; i<4 ; i++){
		movies[0].trailer.shots[i].match_ms = notredata.debat[i];
	    }
	}

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
        notredata.freq = -1;
      }
    });

    var sections = [
      {label: "", ms: sectionDuration},
      {label: "", ms: sectionDuration * 2},
      {label: "ordonnee", ms: sectionDuration * 3}
    ];

    var movieScale = d3.scale.linear()
        .domain([1,movieLength ,0 ])
        .range([(height + missingSectionHeight / 2), 0, height]);

    var xAxis = d3.svg.axis()
        .scale(trailerScale)
        .tickSize(5)
        .tickSize(15)
        .tickValues([0, 30000, 60000, 90000,120000])
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
        .range(["#a20f79","#a20f79", "#a20f79", "#a20f79"]);

    var frameTipWidth = movieData.trailer.thumb_width;

    var stage = movie.append("div")
        .classed("stage", true);

    var svg = stage.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var annotationPointers = svg.selectAll(".annotation-pointer")
        .data(function(d) { return d.annotations; })
      .enter().append("g")
        .classed("annotation-pointer", true)
        .attr("transform", function(d) { return "translate(" + trailerScale(d.trailer_ms) + "," + (0) + ")"; });

    annotationPointers.append("line")
        .attr("y1", height + missingSectionHeight + 10)
        .attr("y2", function(d) { return movieScale(d.movie_ms) + barHeight; });

    annotationPointers.append("path")
        .attr("x", -1.5)
        .attr("y", function(d) { return movieScale(d.movie_ms) + barHeight; })
        .attr("d", function(d) {
          var y = movieScale(d.movie_ms) + barHeight;
          return "M -3 " + (y + 3) + " L 0 " + y + " L 3 " + (y + 3);
        })
        .attr("width", 3)
        .attr("height", 3);

    stage.append("div")
        .classed("annotations", true)
        .style("left", margin.left + "px")
      .selectAll(".annotation")
        .data(function(d) { return d.annotations; })
      .enter().append("div")
        .classed("annotation", true)
        .text(function(d) { return d.text; })
        .style("width", function(d) { return d.width + "px"; })
        .style("left", function(d) { return trailerScale(d.trailer_ms) + d.offset + "px"; })
        .style("top", height + margin.top + missingSectionHeight + 10 + "px");

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
        .text("Frequence d'utilisation");

 svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
      .append("text")
        .attr("x", 7)
        .attr("y", 0)
        .text("50");

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
        .attr("transform", function(d) { return "translate(0," + movieScale(d.ms-1000) + ")"; });

    sectionMarkers.append("rect")
        .attr("x", trailerScale(0))
        .attr("y", -height / 3)
        .attr("width", width + margin.right)
        .attr("height", height / 3)
        .style("fill", function(d) { return color(d.ms -1000); });

    sectionMarkers.append("line")
        .classed("section-line", true)
        .attr("x1", -margin.left)
        .attr("x2", width + margin.right);

    sectionMarkers.append("text")
        .classed("label", true)
        .attr("y", -height / 6)
        .attr("dy", ".35em")
        .attr("x", -15)
        .text(function(d) { return d.label; });

    var missingSection = yAxis.append("g")
        .attr("class", "missing-section")
        .attr("transform", "translate(0," + height + ")");

    missingSection.append("text")
        .text("Annee")
        .attr("y", missingSectionHeight / 2)
        .attr("dy", "0.4em")
        .attr("x", width)

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
		.on("click", function(d){window.open('http://perso.telecom-paristech.fr/~mifsud/PafGit/site3/debat_mots.html');})
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

};

var motAffiche = window.location.hash.slice(1) ;

if(motAffiche.length === 0){
    fun1(getMot("styleoratoire"));
}
else{
    fun1(getMot(motAffiche));
}