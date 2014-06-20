var height=350;
var width=900;
var title="degrees";
var margins=13;
var legendarea=70;
var data_array = [4,-1,-1,-2,-3,10,-7,-9,-7,-15,-10,6]
var sort=1;

if (sort==1){
  
  sorted=sort_plus_index(data_array);
  indexes=sorted.indexes;
  data_array=sorted.values;

}


var posfactor = getpositivityfactor(data_array)

var maxvalue= Math.max(Math.abs(d3.min(data_array)),d3.max(data_array));

var colors = d3.scale.category20();

var step= (width-(width/20))/data_array.length;

var x = d3.scale.linear()
.domain([0,data_array.length])
.range([width/20,width]);

var y = d3.scale.linear()
.domain([0, maxvalue])
.range([0, height-margins-legendarea]);

if (posfactor==0){
var svg = d3.select("svg")
.attr("width",width)
.attr("height",height)
.style("background", "white");

 y = d3.scale.linear()
.domain([0, maxvalue])
.range([0, height/2-margins]);
  
var yAxisDomain = d3.scale.linear()
.domain([maxvalue, -maxvalue])
.range([0, height-2*margins]);

  
svg.selectAll('rect')
			.data(data_array)
			.enter()
				.append('rect')
					.style('fill', function(d,i) { return colors(i)})
					.attr('x', function(d,i) { return x(i) })
					.attr('y', function(d) { return d >= 0 ? (height/2-y(d)) : (height/2);})
					.attr('width', step)
					.attr('height', function(d) { return Math.abs(y(d)) })

svg.selectAll("values")
    .data(data_array)
    .enter()
    .append("text")
	.attr("class","values")
	.attr("dy", ".32em")
.attr("x", function(d,i) { return x(i)+step/2})
    .attr("font-size", '10px')
    .attr("y", function(d) { return d >= 0 ? (height/2-y(d)-5) : (height/2-y(d)+5);})
    .attr("text-anchor","middle")
    .style("fill", 'black')
    .style("opacity",1)
.text(function(d) {return (d % 1 === 0) ? d : d.toFixed(3)});



var xAxis = d3.svg.axis().scale(x).ticks(data_array.length).tickSize(1).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(yAxisDomain).ticks(30).tickSize(1).orient("left");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height/2 + ")")
	.attr("font-size", '10px')
    .call(xAxis)
	.selectAll("text")  
            .style("text-anchor", function(d,i) { 
              if (data_array[i]<0){
               		return "left" 
              }else{
                	return "end"
              }
            })
            .attr("dx", function(d,i) { 
              if (data_array[i]<0){
               		return "5em"
              }else{
                	return "0"
              }
            })
            .attr("dy", function(d,i) { 
              if (data_array[i]<0){
               		return step/2
              }else{
                	return step/2
              }
            })
            .attr("transform", function(d,i) { 
              if (data_array[i]<0){
               		return "translate(0,10)rotate(-90)" 
              }else{
                	return "translate(0,10)rotate(-90)"
              }
                });
 

svg.append("g")
    .attr("class", "y axis")
	.attr("transform", "translate(" + width/20+","+margins+") rotate(0,0,0) ")
    .attr("font-size", '10px')
	.call(yAxis);
}
else if (posfactor==1){
var svg = d3.select("svg")
.attr("width",width)
.attr("height",height)
.style("background", "white");

var yAxisDomain = d3.scale.linear()
.domain([posfactor*maxvalue, 0])
.range([0, height-margins-legendarea]);
  
svg.selectAll('rect')
			.data(data_array)
			.enter()
				.append('rect')
					.style('fill', function(d,i) { return colors(i)})
					.attr('x', function(d,i) { return x(i) })
					.attr('y', function(d) { return d >= 0 ? (height-legendarea-y(d)) : (height-legendarea);})
					.attr('width', step)
					.attr('height', function(d) { return Math.abs(y(d)) })

svg.selectAll("values")
    .data(data_array)
    .enter()
    .append("text")
	.attr("class","values")
	.attr("dy", ".32em")
.attr("x", function(d,i) { return x(i)+step/2})
    .attr("font-size", '10px')
.attr("y", function(d) { return (height-legendarea-y(d)-5)})
    .attr("text-anchor","middle")
    .style("fill", 'black')
    .style("opacity",1)
.text(function(d) {return (d % 1 === 0) ? d : d.toFixed(3)});



var xAxis = d3.svg.axis().scale(x).ticks(data_array.length).tickSize(1).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(yAxisDomain).ticks(15).tickSize(1).orient("left");

var zeroaxe= height-legendarea
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + zeroaxe + ")")
	.attr("font-size", '10px')
    .call(xAxis)
  		.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", '0' )
            .attr("dy", step/2)
            .attr("transform", function(d) {
                return "translate(0,-15) rotate(-65)" 
                });
 

svg.append("g")
    .attr("class", "y axis")
	.attr("transform", "translate(" + width/20+","+margins+") rotate(0,0,0) ")
    .attr("font-size", '10px')
	.call(yAxis);
}

else{
var svg = d3.select("svg")
.attr("width",width)
.attr("height",height)
.style("background", "white");
  
var yAxisDomain = d3.scale.linear()
.domain([0, posfactor*maxvalue])
.range([legendarea, height-margins]);
    
svg.selectAll('rect')
			.data(data_array)
			.enter()
				.append('rect')
					.style('fill', function(d,i) { return colors(i)})
					.attr('x', function(d,i) { return x(i) })
					.attr('y', function(d) { return d >= 0 ? (legendarea-y(d)) : (legendarea);})
					.attr('width', step)
					.attr('height', function(d) { return Math.abs(y(d)) })

svg.selectAll("values")
    .data(data_array)
    .enter()
    .append("text")
	.attr("class","values")
	.attr("dy", ".32em")
.attr("x", function(d,i) { return x(i)+step/2})
    .attr("font-size", '10px')
    .attr("y", function(d) { return (legendarea-y(d)+5);})
    .attr("text-anchor","middle")
    .style("fill", 'black')
    .style("opacity",1) 
.text(function(d) {return (d % 1 === 0) ? d : d.toFixed(3)});



var xAxis = d3.svg.axis().scale(x).ticks(data_array.length).tickSize(1).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(yAxisDomain).ticks(15).tickSize(1).orient("left");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + legendarea + ")")
	.attr("font-size", '10px')
    .call(xAxis)
   .selectAll("text")  
              .style("text-anchor", "left")
              .attr("dx", "6em")
              .attr("dy", step/2-6)
              .attr("transform", function(d) {
                  return "rotate(-65)" 
                  });

svg.append("g")
    .attr("class", "y axis")
	.attr("transform", "translate(" + width/20+","+0+") rotate(0,0,0) ")
    .attr("font-size", '10px')
	.call(yAxis);
}

svg.append("text")
	.attr("class","texts")
	.attr("dy", ".32em")
.attr("x", width/2)
    .attr("font-size", '20px')
    .attr("y", height-13)
    .attr("text-anchor","middle")
    .style("fill", 'black')
    .style("opacity",1)
.text(title);
  

function getpositivityfactor(data_array){
  var positivity=null;
  var negativity=null;
  for (var i = 0; i < data_array.length; i++) {
    if (data_array[i]!=0){
        if (data_array[i]>0){
            positivity=data_array[i];
        }else{
              negativity=data_array[i];
        }
    }
    // Do something with element i.
  }
  var booleanval=0;
  if (positivity==null && negativity!=null){booleanval=-1}
  if (positivity!=null && negativity==null){booleanval=1}
  return booleanval;
}

function sort_plus_index(test){
    var test_with_index= [];
    for (var i in test) {
      test_with_index.push([test[i], i]);
  }
  test_with_index.sort(function(a,b) {
    return b[0] - a[0]
  });
  var indexes = [];
  test = [];
  for (var j in test_with_index) {
      test.push(test_with_index[j][0]);
      indexes.push(test_with_index[j][1]);
      }
  return {
      'indexes': indexes,
      'values': test
    };
}
