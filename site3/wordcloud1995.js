
  var fill1 = d3.scale.category20();
var donnees1;

d3.csv("hollande.csv", function(d) {
  return {
    text: d.text, 
    size: +d.size
    };
  }, function(error, rows){
	donnees1 = rows;
	traitement1();
});

function traitement1(){
  d3.layout.cloud().size([1000, 1000])
      .words(donnees1)
      .padding(5)
      .rotate(function() { return ~~ (Math.random()*2) * 90; })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw1)
      .start();
}

  function draw1(words) {
    d3.select("#wc1995").append("svg")
        .attr("width", 1000)
        .attr("height", 1000)
      .append("g")
        .attr("transform", "translate(500,500)")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill1", function(d, i) { return fill1(i); })
        .attr("text-anchor", "middle")
	.on("mouseover", function(){
	this.style.fontSize = 5 + parseInt(this.style.fontSize) ;})
	.on("mouseout", function(){
	this.style.fontSize = -5 + parseInt(this.style.fontSize) ;})
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }

