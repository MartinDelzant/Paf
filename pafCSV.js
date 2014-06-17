var donnees;
var newText = '';

d3.csv("TestCSVPaf.csv", function(d) {
  return {
      mots: d.Mots, 
      nboccurences: +d.NbOccurences // convert "Length" column to number
  };
}, function(error, rows) {
    donnees = rows;
    console.log(rows);
    traitement();
});

function traitement() {
    for (i = 0; i < donnees.length; i++) {
	newText += donnees[i].mots +  ' : ' + donnees[i].nboccurences + '\n';
    }
    var text = document.getElementById("csv")
    text.style.fontSize = "20px";
    text.innerHTML = newText;
}


