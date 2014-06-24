
  var fill = d3.scale.category20();
var donnees;


 

d3.csv("hollande.csv", function(d) {
  return {
    text: d.text, 
    size: +d.size
    };
  }, function(error, rows){
  donnees = rows;
	traitement();
});

function traitement(){
  d3.layout.cloud().size([1000, 1000])
      .words(donnees)
      .padding(5)
      .rotate(function() { return ~~ (Math.random()*2) * 90; })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();
}

  function draw(words) {
    d3.select("body").append("svg")
        .attr("width", 1000)
        .attr("height", 1000)
      .append("g")
        .attr("transform", "translate(500,500)")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
	  .on("click", function(d){
	      window.open('http://www.google.com/search?q='+d.text,'_blank');
})
.on("mouseover", function(){
	this.style.fontSize = 5 + parseInt(this.style.fontSize) ;})
	.on("mouseout", function(){
	this.style.fontSize = -5 + parseInt(this.style.fontSize) ;})
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
        
        
  }
  
 function updated(element)
{
    var idx=element.selectedIndex;
    var val=element.options[idx].value;
    var content=element.options[idx].innerHTML;
    if (content=="De Gaulle" ){
     document.location.href="degaullewordcloud.html";}
    
 }
