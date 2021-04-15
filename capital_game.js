// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.




// $( document ).ready(function() {
//   var country_capital_pairs = pairs;
//   var table = document.getElementById("Table");
//   var index = Math.floor(Math.random()*pairs.size())
//   var country = country_capital_pairs[index]["country"]
//   var capital = country_capital_pairs[index]["capital"]
  
// });


var used = Array(1000).fill(0);
var rightAnswer;
var Question;
var country_used = [];
var capital_used = [];
var type = [];
var on = 0;
cor = 0;
wro = 0;

//Delete row function
 $(document).on('click', 'button', function () {
     var indexRow = this.parentNode.parentNode.rowIndex;
     console.log(indexRow,typeof(indexRow))
     if(indexRow!=1 && typeof (indexRow) !== "undefined"){
     	_class = document.getElementById("Table").rows[indexRow].className;
     	console.log(_class);
     	if(_class=="wrong"){
     		wro-=1;
     		if(wro==0){
     			$("#Table tbody tr.init").show();
     			on=0;
     		}
     	}
     	else{
     		cor-=1;
     		if(cor==0){
     			$("#Table tbody tr.init").show();
     			on=0;
     		}
     	}
     	document.getElementById("Table").deleteRow(indexRow);
     }
     console.log(cor,wro);
 });
//End of delete row function

//Checking answer
inputText = document.getElementById("cac");
inputText.addEventListener("keyup", function(event) {
  		if (event.keyCode === 13) {
   			event.preventDefault();
   			document.getElementById("checkans").click();
  	}
});

function addRight(country,capital){ //adding row of correct answer
	var table = document.getElementById("Table");
	var row = table.insertRow(-1);
	var cell1 = row.insertCell(0);
	cell1.innerHTML = country;
	var cell2 = row.insertCell(1);
	cell2.innerHTML = capital;
	var cell3 = row.insertCell(2);
	cell3.innerHTML = "<i class='fas fa-circle'></i> <button class = 'del'>Remove</button>";
	row.className = "correct";
	reload()
}
function addWrong(country,ans){ // adding row of wrong answer
	var table = document.getElementById("Table");
	var row = table.insertRow(-1);
	var cell1 = row.insertCell(0);
	cell1.innerHTML = country;
	var cell2 = row.insertCell(1);
	cell2.innerHTML = ans;
	cell2.className = "wrong_mid";
	var cell3 = row.insertCell(2);
	cell3.innerHTML = rightAnswer+ "<button class = 'del'>Remove</button>";
	cell3.className = "wrong_right";
	row.className = "wrong";
	reload()
}

function valid(x){ //eliminate previous and after space of user inputs
	var l = 0;
	for(l;x[l]==" " && l<x.length;l++){

	}
	var r = x.length-1;
	for(r;x[r]==" " && r>=0;r--){

	}
	if(r==-1){
		return "";
	}
	return x.substring(l,r+1);
}

function checkandrefresh(){ //main function of checking answer
	var ans = document.getElementById("cac").value;
	document.getElementById("cac").value = "";
	rightAnswer.toString();
	tmp = rightAnswer.split("");
	tmp[0].toLowerCase();
	var rightAnswer2 = tmp.join('');
	ans = valid(ans);
	if(ans=="")
		return;
	rightAnswer.toUpperCase();
	ans.toUpperCase();
	if(on==0){
		$("#Table tbody tr.init").hide();
		on=1;
	}
	if(ans == rightAnswer2 && ans == rightAnswer){
		addRight(Question,rightAnswer);
		cor+=1;
		var x = document.getElementById("filter_select").value;
		if(x=="Wrong"){
			display_wrong();
		}
	} 
	else{
		addWrong(Question,ans);
		wro+=1;
		var x = document.getElementById("filter_select").value;
		if(x=="Correct"){
			display_correct();
		}
	}

}
//End of checking answer


//Random question generation
function reload(){
	var table = document.getElementById("Table");
	var country;
	var capital;
	while(1!=0){
		var index = Math.floor(Math.random()*pairs.length);
		if(used[index]!=0){
			continue;
		}
		country = String(pairs[index]["country"]);
		capital = String(pairs[index]["capital"]);
		Question = country;
		rightAnswer = capital;
		used[index] = 1;
		break;
	}
	console.log(country,capital);
    document.getElementById("pr2__country").innerHTML = country;
}
//End of Random question generation

//Search bar autocomplete
var capitals = [];
for(var i=0;i<pairs.length;i++){
	capitals.push(pairs[i]["capital"]);
}

$("#cac").autocomplete({
	source:function(req, responseFn) {
        var re = $.ui.autocomplete.escapeRegex(req.term);
        var matcher = new RegExp( "^" + re, "i" );
        var a = $.grep( capitals, function(item,index){
            return matcher.test(item);
        });
        responseFn( a );
    },
	minLength: 2,
	delay: 0
});
//End of Search bar autocomplete


// Fillter All/Correct/Wrong
function display_correct(){
	if(cor == 0){
		$("#Table tbody tr.init").show();
	}
	else{
		$("#Table tbody tr.init").hide();
	}
	$("#Table tbody tr.correct").show();
	$("#Table tbody tr.wrong").hide();
}

function display_wrong(){
	if(wro == 0){
		$("#Table tbody tr.init").show();
	}
	else{
		$("#Table tbody tr.init").hide();
	}
	$("#Table tbody tr.wrong").show();
	$("#Table tbody tr.correct").hide();
}

function display_all(){
	if(cor+wro==0){
		$("#Table tbody tr.init").show();
		return;
	}
	$("#Table tbody tr").show();
	$("#Table tbody tr.init").hide();
}

function Change(){
	var x = document.getElementById("filter_select").value;
	if(x=="All"){
		display_all();
	}
	if(x=="Wrong"){
		display_wrong();
	}
	if(x=="Correct"){
		display_correct();
	}
}
//End of filter


