function getDefaultSave(){
	var game = { // game object to store all save-pertinent info
	        num: 1, // number that we are increasing
	        mult: 1.5, // number that it multiplies by on click
        	countdown: 0, // counter for the button cooldown
		buttonClicks: 0,
		numUpgradeCost:1000,
		numUpgradeBoost:1,
		clickPoints:{
			clickPoints: 0,
			maxClickPoints:3,
			clickPointsPerSec:1,
			maxCPCost:1000,
			secCPCost:1e10,
			CPPerUpgrade: 1,
			CPPerSecUpgrade: 1,
		},
        	microPrestige:{
                        essence:0,
                        times:0,
                        essenceMult:1},
        	notation: 0,// standard notation - clearly the best notation!
		version : 0.2,
		numeralsBroken:false,
		Aupgs:{
			possible:["A1","A2","A3","A4","A5","A6","A7",'A8','A9'],
			cost:[       1,   1,   2,   5,  10, 14,  18,  50,  100],
			repeatable:{
				amount:0,
				cost:25,
				costMult:1.5
			},
			upgrades:[]//the var for storing the stuff
		},
		Bupgs:{
			possible:['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10'],
			cost:[     160,350, 720,1500,2500, 4000,18000,1e5,2.4e5, 8e5],
			upgrades:[]
		}
		
        }
        return game
}


var game = getDefaultSave()

function updateBaseClick(){
        game.mult = 1.5
        if (game.Aupgs.upgrades.includes("A1")) game.mult = 1.8667
        if (game.Aupgs.upgrades.includes("A4")) game.mult = 2.5
	if(game.Bupgs.upgrades.includes('B1')) game.mult = 3
	if(game.Bupgs.upgrades.includes('B5')) game.mult = 4
}

function microPrestige() {
	showElement("microEssenceInfo");
	showElement("microPrestigeTab");
	showElement("increaseNumber");
	hideElement("microPrestigeElement");
	hideElement('microReset')
	game = {
                num:game.Bupgs.upgrades.includes('B2')? 1e10:1,
		numUpgradeCost:1000,
		buttonClicks: game.buttonClicks,
		numUpgradeBoost:1,
                mult: 1.5,
                countdown: 0,
		clickPoints:{
			clickPoints: 0,
			maxClickPoints: game.Aupgs.upgrades.includes('A3')? 6:3,
			clickPointsPerSec: game.Aupgs.upgrades.includes('A5')? 3:1,
			maxCPCost:1000,
			secCPCost:1e10,
			CPPerUpgrade: game.Aupgs.upgrades.includes('A3')? 2:1,
			CPPerSecUpgrade: game.Bupgs.upgrades.includes('B9')? 1.5:1
		},
		
                microPrestige:{
                        essence: game.numeralsBroken? game.microPrestige.essence + Math.floor(Math.pow(Math.ln(game.num),(1/2.2))):game.microPrestige.essence+Math.round(Math.pow(1.1,game.Aupgs.repeatable.amount)),
                        times: game.microPrestige.times+1,
                        essenceMult: game.microPrestige.essenceMult
                },
                notation: game.notation,
                version:game.version,
                Aupgs: game.Aupgs,
		Bupgs:game.Bupgs
        }
	if(game.microPrestige.times >= 100) {
		showElement('breakNumeralsTab')
	}
	game.clickPoints.clickPointsPerSec *= game.clickPoints.CPPerSecUpgrade
        updateBaseClick()
	update('maxCP',format(game.clickPoints.maxClickPoints))
	update('cpPerSec',format(game.clickPoints.clickPointsPerSec))
}
function getTriangularNumber(num) {
	//(n^2-n)/2
	num *= 2
	//n^2-n-num = 0
	//n = (1+sqrt(1+4num))/2
	return (1+Math.sqrt(1 + 4*num))/2
}
function getPercentageGrowthFactor(){
        var mult = 1
	if (game.num > 1e5) mult = 1 + 0.0025*Math.max(0,Math.floor(Math.log10(game.num))-5) // the alway additive mult
        if (game.Aupgs.upgrades.includes("A2") && !(game.Bupgs.upgrades.includes('B3'))) mult *= 1+ 0.012*getTriangularNumber(Math.log10(game.num))
	if(game.Bupgs.upgrades.includes('B3')) mult *= 1 + 0.015 * getTriangularNumber(Math.log10(game.num))
	return mult
}

function getCurrentClickAmt(){
        var base = game.mult
        if (game.Aupgs.upgrades.includes("A8") && game.num < 1e33) base *= 5
        base *= getPercentageGrowthFactor()
        if (game.Aupgs.upgrades.includes("A7")) base *= 1+Math.log10(game.microPrestige.times)/10
	base *= game.numUpgradeBoost
	if(game.Aupgs.upgrades.includes('A6')) base *= 1 + Math.pow(game.microPrestige.essence,0.3)
	if(game.Aupgs.upgrades.includes('A9')) base *= 1 + Math.log10(game.clickPoints.clickPoints+1)/10
	if(game.Bupgs.upgrades.includes('B4')) base *= 1 + Math.log10(game.microPrestige.essence + 1)/300
	if(game.Bupgs.upgrades.includes('B8')) base *= 1 + Math.log10(game.buttonClicks + 1)/310
        return base
}

function step() { // clicks button
	if(game.Bupgs.upgrades.includes('B5')) {
	   	game.num = game.num*getCurrentClickAmt(); // updates number
		update("numDisplay",format(game.num)); // update number on the page
		game.countdown = 1000; // reset cooldown timer
		game.clickPoints.clickPoints -= 2
		update("clickPoints",game.clickPoints.clickPoints); 
		if(game.Bupgs.upgrades.includes('B6')) {
		   game.microPrestige.essence ++
		}
		game.buttonClicks ++
	}
	else if(game.clickPoints.clickPoints >= 3) {
		game.num = game.num*getCurrentClickAmt(); // updates number
		update("numDisplay",format(game.num)); // update number on the page
		game.countdown = 1000; // reset cooldown time
		game.clickPoints.clickPoints -= 3
		update("clickPoints",game.clickPoints.clickPoints); 
		if(game.Bupgs.upgrades.includes('B6')) {
		   game.microPrestige.essence ++
		}
		game.buttonClicks ++
	}
	else return 0;
}
function numUpgrade() {
	if(game.num >= game.numUpgradeCost) {
		game.num /= game.numUpgradeCost
		game.numUpgradeCost *= 1000
		game.numUpgradeBoost += 0.0025
		update('numCost',format(game.numUpgradeCost))
	}
}
//CP Upgrades
function maxCPUpgrade() {
	if (game.num >= game.clickPoints.maxCPCost) {
		game.num /= game.clickPoints.maxCPCost
		game.clickPoints.maxClickPoints += game.clickPoints.CPPerUpgrade
		game.clickPoints.maxCPCost *= 1000
		update('maxCP',format(game.clickPoints.maxClickPoints))
		update('maxCPCost',format(game.clickPoints.maxCPCost))
	}
}
function CPSecUpgrade() {
	if(game.num >= game.clickPoints.secCPCost) {
		game.num /= game.clickPoints.secCPCost
		game.clickPoints.clickPointsPerSec += game.clickPoints.CPPerSecUpgrade
		game.clickPoints.secCPCost *= 1e10
		update('cpPerSec',format(game.clickPoints.clickPointsPerSec))
		update('secCPCost',format(game.clickPoints.secCPCost))
	}
}
// A section

function buyAupg(number){
	var cost = game.Aupgs.cost[number-1]
	if (game.microPrestige.essence >= cost && !(game.Aupgs.upgrades.includes(game.Aupgs.possible[number-1]))){
		game.microPrestige.essence -= cost
		game.Aupgs.upgrades.push(game.Aupgs.possible[number-1])
		if(number === 3) {
			game.clickPoints.maxClickPoints = 6
			game.clickPoints.CPPerUpgrade = 2
			update('maxCP',format(game.clickPoints.maxClickPoints))
		}
	}
}

function buyRepeatA(){
	var cost = game.Aupgs.repeatable.cost
	if  (game.microPrestige.essence >= cost){
		game.microPrestige.essence -= cost
		game.microPrestige.essenceMult *= 1.1
		game.Aupgs.repeatable.amount += 1
		game.Aupgs.repeatable.cost *= game.Aupgs.repeatable.costMult
		game.Aupgs.repeatable.cost = Math.floor(game.Aupgs.repeatable.cost)
		update('RepeatACost',format(game.Aupgs.repeatable.cost))
		update('microEssenceMult',format(Math.floor(game.microPrestige.essenceMult)))
	}
}
function buyMaxRepeatA(){
	while (game.Aupgs.repeatable.cost <= game.microPrestige.essence){
		buyRepeatA()
	}
}

//B Section
function buyBupg(number) {
	var cost = game.Bupgs.cost[number-1]
	if(number === 5 && !(game.Bupgs.upgrades.includes('B1'))) {
		return
	}
	if (game.microPrestige.essence >= cost && !(game.Bupgs.upgrades.includes(game.Bupgs.possible[number-1]))){
		game.microPrestige.essence -= cost
		game.Bupgs.upgrades.push(game.Bupgs.possible[number-1])
	}
}
function breakNumerals() {
	game.numeralsBroken = true
}



//below is all the display funcs
//otherwise know to pg as the dont touch funcs xD

var currentTab = "main";
	var notationArray = ["Standard 2.0","Scientific","Engineering","Logarithm"];
function update(set,get){ // for updating display
	document.getElementById(set).innerHTML=get
}
function showElement(elementID) { // makes an element visible
	document.getElementById(elementID).style.display="inline-block";
}
function hideElement(elementID) { // makes an element invisible
	document.getElementById(elementID).style.display="none";
}
function abbreviate(i) {
    if(i==0) return "k"; // thousand
    if(i==1) return "M"; // million
    if(i==2) return "B"; // billion
    if(i==8) return "Oc";
    if(i==9) return "No";
    var units = ["","U","D","T","Qa","Qi","Sx","Sp","O","N"]; // prefixes for ones place
    var tens = ["","Dc","Vg","Tg","Qag","Qig","Sxg","Spg","Og","Ng"]; // prefixes for tens place
    var hundreds = ["","Cn","Dcn","Tcn","Qac","Qic","Sxc","Spx","Ocn","Nc"]
    var i2=Math.floor(i/10);
    var i3=Math.floor(i2/10);
    var unit = units[i%10];
    var ten = tens[i2%10];
    var hundred = hundreds[i3%10];
    return unit+ten+hundred;
}
function format(a) { // formats numbers for display
	var e = Math.floor(Math.log10(a)); // exponent of number
	var m = Math.round(Math.pow(10,Math.log10(a)-e)*1000)/1000; // mantissa of number
	if (m>9.9995) { // would round up to 10; this avoids a problem
		m = 1;
		e++;
	}
	if(a<1000) return Math.round(a*1000)/1000; // show up to 3 places
	if (game.notation==1) return m+"e"+e; // scientific notation
	if (game.notation==3) return "e"+(Math.round(1000*Math.log10(a))/1000); // log notation
	var e2 = 3*Math.floor(e/3); // exponent for engineering notation
	var m2 = Math.round(1000*m*Math.pow(10,e-e2))/1000; // base in engineering and standard notations
	if(game.notation==0) return m2+abbreviate(e2/3-1); // standard notation
	if(game.notation==2) return m2+"e"+e2; // engineering notation
}

function switchNotation() { // for switching between notations
	game.notation++;
	if(game.notation>notationArray.length-1) game.notation=0;
	update("notationDisplay",notationArray[game.notation]);
}
function switchTab(tabName) { // alternates between the various tabs
	hideElement(currentTab);
	showElement(tabName);
	currentTab=tabName;
}
function save() { //save game
	localStorage.setItem('save',btoa(JSON.stringify(game)))
}
function load(save) {
	try {
		game=JSON.parse(atob(save))
	if(game.mult===undefined) game.mult = 1.5; // lines for making saves back-compatible
	if(game.microPrestige===undefined) game.microPrestige = {
		essence:0,
		times:0,
		essenceMult:1};
	if(game.version===undefined) game.version = 0.2;
	if(game.Aupgs===undefined) game.Aupgs = {
		possible:["A1","A2","A3","A4","A5","A6","A7",'A8','A9'],
		cost:[       1,   1,   2,   5,  10, 18,  50],
		repeatable:{
			amount:0,
			cost:25,
			costMult:1.5
			},
		upgrades:[]//the var for storing the stuff
	}
	if(!(game.Aupgs.possible.includes('A9'))) {
		game.Aupgs.possible = ["A1","A2","A3","A4","A5","A6","A7",'A8','A9']
		game.Aupgs.cost = [       1,   1,   2,   5,  10, 14,  18,  50,  100]
	}
	if(game.Bupgs === undefined) {
		game.Bupgs = {
			possible:['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10'],
			cost:[     160,350, 720,1500,2500, 4000,18000,1e5,2.4e5, 8e5],
			upgrades:[]
		}
	}
	if(game.clickPoints === undefined) {
		game.clickPoints = {
			clickPoints: 0,
			maxClickPoints:3,
			clickPointsPerSec:1,
			maxCPCost:1000,
			secCPCost:1e10,
			CPPerUpgrade:1,
		}
	}
	if(game.clickPoints.CPPerUpgrade === undefined) {
		game.clickPoints.CPPerUpgrade = 1
	}
	if(game.numUpgradeCost === undefined) {
		game.numUpgradeCost = 10
	}
	if(game.numUpgradeBoost === undefined) {
		game.numUpgradeBoost = 1
	}
	if(game.numeralsBroken === undefined) {
		game.numeralsBroken = false
	}
	if(game.buttonClicks === undefined) {
		game.buttonClicks = 0
	}
	if(game.clickPoints.CPPerSecUpgrade === undefined) {
		game.clickPoints.CPPerSecUpgrade = game.Bupgs.upgrades.includes('B9')? 1.5:1
	}
	if(game.microPrestige.times > 0) {
		showElement("microEssenceInfo");
		showElement("microPrestigeTab");
	}
	if(game.microPrestige.times >= 100) {
		showElement('breakNumeralsTab')
	}
	update("numDisplay",game.num);
	update("notationDisplay",game.notation);
	update("multDisplay",getCurrentClickAmt());
	update("microEssenceDisplay",game.microPrestige.essence);
	update('RepeatACost',format(game.Aupgs.repeatable.cost))
	update('microEssenceMult',format(Math.floor(game.microPrestige.essenceMult)))
	update('numCost',format(game.numUpgradeCost))
	update('maxCPCost',format(game.clickPoints.maxCPCost))
	update('secCPCost',format(game.clickPoints.secCPCost))
	update('maxCP',format(game.clickPoints.maxClickPoints))
	update('cpPerSec',format(game.clickPoints.CPPerSec))
	} catch (e) {
		console.log('Your save failed to load: '+e)
	}
}
function exportGame() {
	var savefile=btoa(JSON.stringify(game))
	showElement("exportInfo")
	document.getElementById("exportSave").value=btoa(JSON.stringify(game))
}	
function importGame() {
	var input=prompt('Paste in your exported save and press enter.')
	load(input)
}
function hardReset() {
	if(confirm("Are you sure you want to hard reset? This will erase all your progress.")) {
		game = getDefaultSave();
	}
}

function updateThings() { // various updates on each tick
	var ooms = Math.floor(Math.log10(game.num));
	update("numDisplay",format(game.num));
	if(game.countdown>50) game.countdown = game.countdown-50;
	if(game.countdown<=50&&game.countdown>=0) game.countdown = 0;
	if(game.countdown === 0) {
		game.clickPoints.clickPoints += game.clickPoints.clickPointsPerSec
		game.countdown = 1000
	}
	if(game.clickPoints.clickPoints > game.clickPoints.maxClickPoints) {
		game.clickPoints.clickPoints = game.clickPoints.maxClickPoints
	}
	if(game.Bupgs.upgrades.includes('B10') && (game.clickPoints.clickPoints >= 3 || (game.clickPoints.clickPoints >= 2 && game.Bupgs.upgrades.includes('B5')))) {
		step()
	}
	update('clickPoints',format(game.clickPoints.clickPoints))
	update("multDisplay",format(getCurrentClickAmt()));
	if(game.num>=1e33) { // Number overflow?
		if(!game.numeralsBroken) {
			hideElement("increaseNumber");
			showElement("microPrestigeElement");
		}
		else {
			update('ueOnReset',format(Math.floor(Math.pow(Math.log10(game.num),(1/2.2)))))
			showElement("microReset");
		}
	}
	update("microEssenceDisplay",format(game.microPrestige.essence));
        updateBaseClick()
	update('A6power',format(1 + Math.pow(game.microPrestige.essence,0.3)))
	update("A7power",format(1+Math.log10(game.microPrestige.times)/10));
	update('A9power',format(1 + Math.log10(game.clickPoints.clickPoints)/10))
	update("microEssenceMult",format(Math.pow(1.1,game.Aupgs.repeatable.amount)));
	update('numCost',format(game.numUpgradeCost))
	update('maxCPCost',format(game.clickPoints.maxCPCost))
	update('secCPCost',format(game.clickPoints.secCPCost))
	update('maxCP',format(game.clickPoints.maxClickPoints))
	update('cpPerSec',format(game.clickPoints.clickPointsPerSec))
}

function init() { // initialize
	if(localStorage.getItem('save')!=null) load(localStorage.getItem('save'))
}
setInterval(updateThings,50);
setInterval(save,10000);
