
// declaring variables

window.pairs = [];
window.coordinates = [];
var used =  Array(1000).fill(0);
var countries = [];
var database = firebase.database;
var capitals = [];
var numChild = 0;
// getting data from csv file

$(document).ready(function() {
	$.ajax({
		url: 'https://cs374.s3.ap-northeast-2.amazonaws.com/country_capital_geo.csv',
		dataType: 'text',
	}).done(function(data) {

/*----------------------------------Starting After the page is ready-----------------------------------------------*/
		gettingFunction(data)
		// done getting data

		function gettingFunction(data) {
			// console.log(data);
			var rows = data.split('\r\n');
			for (var singleRow = 1; singleRow < rows.length; singleRow ++) {
				var dataRow = rows[singleRow].split(',');
				pairs.push({
					"country" : dataRow[0],
					"capital" : dataRow[1]
				});
				coordinates.push({
					"country" : dataRow[0],
					"coordinates" : [dataRow[2],dataRow[3]],
				});
				capitals.push(dataRow[1]);
			}
		}

		// checking whether there is a previous data or nothing when reloading the page
		firebase.database().ref().once("value").then(function(snapshot){
			child = snapshot.val().child;
			console.log("There are ",child," countries on the board");
			if(child == 0){
				displayQuestion();
				firebase.database().ref().update({
					right: 0,
					wrong: 0,
					child: 1,
				});
			}
			else{
				firebase.database().ref('ques/').once('value').then(function(snapshot){
					lng = snapshot.val().lng;
					lat = snapshot.val().lat;
					map.setCenter([lng,lat]);
					document.getElementById('pr2__country').innerHTML = '<p id = "quescountry" style = "margin: 0;">'+snapshot.val().country+'</p>';
				});
				firebase.database().ref('ans/').once('value').then(function(snapshot){
					var ok = 0;	
					snapshot.forEach(function(childSnapshot){
						ok = 1;
						numChild++;
						var country = childSnapshot.val().country;
						var capital = childSnapshot.val().capital;
						var ans = childSnapshot.val().ans;
						var key = childSnapshot.key;
						firebase.database().ref('ans/' + key).update({
							ver: 0
						});
						addRow(country,capital,ans);
					});	
					if(ok == 1) $("#pr2_table tbody tr.init").hide();
				});
			}
		});


/*------------------------------------------------------------------------------------------------------------*/

	});
});


//adding the row base on the given information
function deleteRow(row){
	console.log(row);
}

//adding the row base on the given information
function addRow(country,capital,ans){
	$("#pr2_table tbody tr.init").hide();
	Ans = ans.toLowerCase();
	Capital = capital.toLowerCase();
	var table = document.getElementById("pr2_table");
	var row = table.insertRow(-1);
	var cell1 = row.insertCell(0);
	cell1.innerHTML = '<p id = "country" style = "margin: 0;">'+country+'</p>';
	var cell2 = row.insertCell(1);
	cell2.className = (Ans == Capital) ? "correct" : "wrong_mid";
	cell2.innerHTML = (Ans == Capital) ? capital : ans;
	var cell3 = row.insertCell(2);
	cell3.innerHTML = '<div><p id = "row-captial" style = "margin: 0;">'+capital+'</p>' + "<button id = 'del'>Remove</button></div>";
	cell3.className = (Ans == Capital) ? "correct_right" : "wrong_right";
	row.className = (Ans == Capital) ? "correct" : "wrong";
	row.id = "ansRow";
	numChild++;
	firebase.database().ref().once('value').then(function(snapshot){
		firebase.database().ref().update({
			child: snapshot.val().child + 1
		});
		var Ans = ans.toLowerCase();
		var Capital = capital.toLowerCase();
		var add = ((Ans == Capital) ? 1 : 0);
		firebase.database().ref().update({
			right: snapshot.val().right + add,
			wrong: snapshot.val().wrong + 1 - add,
		});
	});
	firebase.database().ref('ques/').once('value').then(function(general){
		firebase.database().ref('ans/').push({
			country: country,
			capital: capital,
			ans: ans,
			lng: general.val().lng,
			lat: general.val().lat,
			ver: 1,
		});
	});
}

function processInput() {

	userInput = document.getElementById('pr2_input').value;
	if(userInput == "")
		return;
	firebase.database().ref('ques/').once('value').then(function(general){
		country = general.val().country;
		capital = general.val().capital;
		addRow(country,capital,userInput);
		firebase.database().ref('command/').push({
			type: "Add",
			ans: userInput,
			country: country,
			capital: capital,
		});
		displayQuestion();	
		document.getElementById('pr2_input').value = "";
		$("#pr2_table tbody tr.init").hide();
	});
}


function displayQuestion() {
	var numCountries = pairs.length;
	var country, capital, coor;					
	while(1) {
		var index = Math.floor(Math.random()*numCountries);
		if(used[index]!=0){
			continue;
		}
		used[index] = 1;
		country = pairs[index].country;
		capital = pairs[index].capital;
		coor = coordinates[index].coordinates;
		break;
	}
	document.getElementById('pr2__country').innerHTML = '<p id = "quescountry" style = "margin: 0;">'+country+'</p>';
	console.log('New country information: ',country, capital, coor[0], coor[1]);
	// showMap(coor[0],coor[1],4,"satellite-streets-v11");
	firebase.database().ref('ques/').set({
		country: country,
		capital: capital,
		lng: coor[0],
		lat: coor[1],
	});
	map.setCenter([coor[0],coor[1]]);
}



//hint for user

inputText = document.getElementById("pr2_input");
inputText.addEventListener("keyup", function(event) {
  		if (event.keyCode === 13) {
   			event.preventDefault();
   			document.getElementById("pr2__button").click();
  	}
});

$("#pr2_input").autocomplete({
	source:function(req, responseFn) {
        var re = $.ui.autocomplete.escapeRegex(req.term);
        var matcher = new RegExp( "^" + re, "i" );
        var a = $.grep(capitals, function(item,index){
            return matcher.test(item);
        });
        responseFn( a );
    },
	minLength: 2,
	delay: 0
});



function reset(){
	// console.log(20);
	// clear();
	firebase.database().ref().set({
		child: 0,
		wrong: 0,
		right: 0,
	});
	location.reload();	
}


function rowClear(which){
	if(which == 1)
		firebase.database().ref('command/').push({
			type: "Clear",
		});
	$("#pr2_table tbody tr").hide();
	$("#pr2_table tbody tr.waiting").show();
	$("#pr2_table tbody tr.init").show();
}



// load map
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuZ21pbmhob2FuZ2R6IiwiYSI6ImNrb2w3YWdiODAzMGUydG1yNmVjM2ZlbnUifQ.Cztrea_bmsblNkZrSc-7cA';
var map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/satellite-streets-v11', // style URL
	center: [-74.5, 40], // starting position [lng, lat]
	zoom: 4 // starting zoom
});


// showMap(-74.5, 40, 4,"satellite-streets-v11");
// map.zoom = 5;

var timer;

$(document).on('click','#del', function(){
	indexRow = this.parentNode.parentNode.parentNode.rowIndex;
	document.getElementById('pr2_table').deleteRow(indexRow);
	firebase.database().ref('command/').push({
		type: "Delete",
		indexRow: indexRow,
	});
	numChild --;
	if(numChild == 0){
		$("#pr2_table tbody tr.init").show();
	}
	firebase.database().ref('ans/').once('value').then(function(snapshot){
		var cnt = 0;
		snapshot.forEach(function(childSnapshot){
			cnt += 1;
			if(cnt == indexRow - 2){
				key = childSnapshot.key;
				Ans = childSnapshot.val().ans;
				Capital = childSnapshot.val().capital;
				var add = ((Ans == Capital) ? 1 : 0);

				firebase.database().ref().once('value').then(async function(Snapshot){
					firebase.database().ref().update({
						right: Snapshot.val().right - add,
						wrong: Snapshot.val().wrong - (1 - add),
						child: Snapshot.val().child - 1,
					})
				});
				firebase.database().ref('ans/' + key).remove();
					
				// break;
			}
		});
	});
});



function Change(){
	citeria = document.getElementById('filter_select').value;
	cits = {'Correct' : 1, 'Wrong' : 0, 'All' : 2};
	// console.log(cits[citeria]);
	filter(cits[citeria]);
}


function filter(citeria) {
	table = document.getElementById("pr2_table");
	cnt = 0;
	// r = 2;
	while(table.rows.length > 3){
		document.getElementById('pr2_table').deleteRow(table.rows.length - 1);
	}
	firebase.database().ref('ans/').once('value').then(function(general){
		// var cnt = 3;
		shows = 0
		general.forEach(function(childSnapshot){
			// cnt += 1;
			ok = (childSnapshot.val().ans == childSnapshot.val().capital);
			console.log()
			country = childSnapshot.val().country;
			capital = childSnapshot.val().capital;
			ans = childSnapshot.val().ans;
			if(citeria == 2){
				addRow(country, capital, ans);
				shows+=1;
			}
			else{
				if (ok == citeria) {
					addRow(country, capital, ans);
				}
				shows += (ok == citeria) ? 1 : 0;
			}
		});
		console.log(shows);
		if(shows == 0){
			$("#pr2_table tbody tr.init").show();
		}
		else{
			$("#pr2_table tbody tr.init").hide();
		}
	});
}



//showing map

var timer;

$(document).on('mouseover','#country', function(){
	indexRow = this.parentNode.parentNode.rowIndex;
	table = document.getElementById('pr2_table');
	table.rows[indexRow].style.backgroundColor = 'lightgray';
	timer = setTimeout(function(){
		firebase.database().ref('ans/').once('value').then(function(general){
			var cnt = 0;
			general.forEach(function(rowAns){
				cnt += 1;
				if(cnt == indexRow){
					var lng = rowAns.val().lng;
					var lat = rowAns.val().lat;
					// showMap(lng, lat, 4,"satellite-streets-v11");
					map.setCenter([lng,lat]); 
					console.log(map);
					mmap = document.getElementById('map');
					mmap.style.borderColor = 'orange';
				}
			});
		});
	},500);
});

$(document).on('mouseout','#country',function(){
	indexRow = this.parentNode.parentNode.rowIndex;
	table = document.getElementById('pr2_table');
	table.rows[indexRow].style.backgroundColor = 'transparent';
	mmap = document.getElementById('map');
	mmap.style.borderColor = 'transparent';	
	clearTimeout(timer);
	// alert('outed');
});

var old_center;
$(document).on('mouseover','#row-captial', function(){
	// console.log();
	indexRow = this.parentNode.parentNode.parentNode.rowIndex;
	table = document.getElementById('pr2_table');
	table.rows[indexRow].style.backgroundColor = 'lightgray';
	timer = setTimeout(function(){
		firebase.database().ref('ans/').once('value').then(function(general){
			var cnt = 0;
			general.forEach(function(rowAns){
				cnt += 1;
				if(cnt == indexRow){
					var lng = rowAns.val().lng;
					var lat = rowAns.val().lat;
					// showMap(lng, lat, 9,"dark-v10");
					old_center = map.center;
					map.setCenter([lng,lat]);
					map.setZoom(9); 
					map.setStyle("mapbox://styles/mapbox/dark-v10");
				}
			});
		});
	},500);
});

$(document).on('mouseout','#row-captial',function(){
	indexRow = this.parentNode.parentNode.parentNode.rowIndex;
	table = document.getElementById('pr2_table');
	table.rows[indexRow].style.backgroundColor = 'transparent';
	map.setStyle("mapbox://styles/mapbox/satellite-streets-v11");
	mmap = document.getElementById('map');
	mmap.style.borderColor = 'transparent';		
	map.setCenter(old_center);
	clearTimeout(timer);
	// alert('outed');
});


$(document).on('mouseover','#quescountry', function(){
	indexRow = this.parentNode.parentNode.rowIndex - 2;
	document.getElementById('waiting').style.backgroundColor = 'lightgray';
	timer = setTimeout(function(){
		firebase.database().ref('ques/').once('value').then(function(general){
			var lng = general.val().lng;
			var lat = general.val().lat;
			console.log('cac');
			map.setCenter([lng,lat]); 
			mmap = document.getElementById('map');
			mmap.style.borderColor = 'black';
		});
	},500);
});

$(document).on('mouseout','#quescountry',function(){
	indexRow = this.parentNode.parentNode.rowIndex;
	table = document.getElementById('pr2_table');
	table.rows[indexRow].style.backgroundColor = 'transparent';
	mmap = document.getElementById('map');
	mmap.style.borderColor = 'transparent';	
	clearTimeout(timer);
	// alert('outed');
});



async function reBuild(){
	var snapshot = firebase.database().ref().once('value')
	await firebase.database().ref().update({
			child: 1,
			right: 0,
			wrong: 0,
		});
	await firebase.database().ref('ans').remove();
	numChild = 0;
	table = document.getElementById('pr2_table');
	while(table.rows.length > 3){
		table.deleteRow(3);
	}
	$("#pr2_table tbody tr.init").show();
}


function Undo() {
	var cac = 1;
	firebase.database().ref('command/').once('value').then(function(snapshot){
		var cnt =snapshot.numChildren();
		if(cnt == 0) {
			cac = 0;
			alert('There is nothing to undo');
			return;
		}
		var id = 0
		snapshot.forEach(function(childSnapshot){
			id++;
			if(id == cnt){
				key = childSnapshot.key;
				firebase.database().ref('command/' + key).remove();
			}
		});
	});
	reBuild().then(function(){
		firebase.database().ref('command/').once('value').then(function(snapshot){
			snapshot.forEach(function(childSnapshot){
				type = childSnapshot.val().type;
				if(type == 'Clear'){
					rowClear(0);
				}
				else if(type == 'Add'){
					var country = childSnapshot.val().country;
					var capital = childSnapshot.val().capital;
					var ans = childSnapshot.val().ans;
					addRow(country,capital,ans);
					$("#pr2_table tbody tr.init").hide();
				}
				else if(type == 'Delete'){
					numChild --;
					if(numChild == 0){
						$("#pr2_table tbody tr.init").show();
					}
					indexRow = childSnapshot.val().indexRow;
					table = document.getElementById('pr2_table');
					table.deleteRow(indexRow);
					firebase.database().ref('ans/').once('value').then(function(general){
						var cnt = 0;
						general.forEach(function(childSnapShot){
							cnt += 1;
							if(cnt == indexRow - 2){
								key = childSnapShot.key;
								Ans = childSnapShot.val().ans;
								Capital = childSnapShot.val().capital;
								var add = ((Ans == Capital) ? 1 : 0);
								firebase.database().ref().once('value').then(async function(ssnapShot){
									firebase.database().ref().update({
										right: ssnapShot.val().right - add,
										wrong: ssnapShot.val().wrong - (1 - add),
										child: ssnapShot.val().child - 1,
									})
								});
								firebase.database().ref('ans/' + key).remove();
							}
						});
					});
				}
			});
		});
	});
	

}


