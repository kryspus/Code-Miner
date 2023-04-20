//This is Auto diging file created by Kryspin Janiak "kryspin.janiak@gmail.com"

//Important NOTES:
//-Please be aware that this code will Not be run at the very begining of game becouse of lack items that are not attached from Garage yet. I Strongly recomment to get at least Seismic Detector, before we start to try using this script, becouse this script is focused on automated diging depending who base on Seismic Detector.
//-- After you cliam Seismic Detectior you still won't have all parts that are used here, so..
//-- At the begining you won't have "Seisimic Image", witch is included in code..
//-- To make code running without it you need to use Comment Tags in function IsNeedFlight();.  Exclude "let image" line, and whole if (way=="f") and if (way=="b") Conditional statements.
//-- You should disable all function scanUnknow() and its calls in code. Function is using last level of sensor so it will be working when you have this maxed.

//Here u have to set values accorging to your current Garage upgrades:
//- Your total weight limit (can be found in Garage > Vehicle Info)
let weightLimit = 130000;
//- Secured weight. When we reach (weightLimit minus weightLeft) vehicle will start movig back to base. It's prevent from unable to move casued by overweight. (set it according of what heaviest mineral you were able to dig in run to maximum your load)
let weightLeft = 538;

//Here you have table that helps you to dig what you want.
//First row is the hardness of the mineral. 
/*
hard name     exp  weight  lvlrange   color         dmg
---------------------------------------------------------------
200  Coal      10   100     6+        dark            0
400  Iron      20   200     29-       gray(white)     0     
150  Tin       50   480     51-       brown           0   
230  Cooper    50   230     74-       gold            0
280  Fosil    500   122     54+       skull           0 
 50  Basalt   500   180     46-       lava           90
250  Zinc     300   350     80+       blue            0
200  Cadmium  200   538     80+       white           0
1500 Granite 1200  2000     90+       black (bold)    0
750  Emerald 1000   160     220+      hidden in rock3 0
600  Uranium 2000   900     1126>25   green           0
     Diamond
---------------------------------------------------------------
0    air       0     0      0-                      20
100  rock1     0     0      1-       brown           0     
300  rock2     0     0               gray            0
500  rock3     0     0     80-       dark gray       0
*/

//Here is the place where you set numbers of hardness of materials you want to gather.//if you write here [150,230] you will be looking olny for those two materials.
let prio = [750,280];//,1500,750,250,280];

//and here you setup what you want to avoid while you diging.
let dontDig = [250,230,50,150,400,1500,600];

//---------------------------Rest nessecery variabless-----------------------
//- Below are all other variables that must be declared before we start seting your diging run (don't Change it). 
//- Take a look to those ones with Comments and you can make changes here if you need.
console.log("Start!");
let isflight=false;
var level=0;
let left=0;
let right=0;
let pointedRight=true;
let way;
let wayBackReason;
var move = 0;
let weightStart = vehicle.sensors.readWeight();
const weightNet = weightLimit-weightStart;  
console.log("weight current: "+weightStart);
console.log("weight Net: "+weightNet);

let fuelStart = vehicle.fuel.level();
let fuelSafeToBack = fuelStart/4; //in most cases one quarter fuel left in tank it's enought to come back to base. // default: let fuelSafeToBack = fuelStart/4;
console.log("fuel Start: "+fuelStart);

let fuelCheckResult;
let weightCheckResult;

let cc = vehicle.cargo.getCapacity();
let cus = vehicle.cargo.getUsedSpace();
console.log("Cargo: ("+cus+"/"+cc+")");

let boomTemp=100; // Temperature level after which we use Seismic Charge.
let usedCharges=-1; // if you set to "-1" it will dig into first lava(temphigh) //if u set to 0 it will avoid diging lava to prevent gaining damage from it.

let stuckCount=0;
let stuckCountB=0;
//------------------------------------------------------------------------

//Here you start the engine
vehicle.engine.on();
//And then you choose do you want to call function main(); where you can separately write your moves manually, for exmample to dig to a specyfied level, before we start using step(); who will run auto diging. 

//main(); 

//And now you are starting autodiging. Its ends when the weight limit, or fuel limit are reached... 
digDown(5);
for (let i=move; i<30000 ;i++) {  
    if(fuelCheckResult===true || weightCheckResult===true){ 
    break;
    } 
    
    scanUnknown();
    step();  
}
console.log("Exited step() loop now.");
//And then you call flightBack() function who leads you to the Start base and unload goods by safeDocking();
console.log("Flight Back starts now!");
for (let i=0; i<30000; i++) {
    if (level>0){
    flightBack();    
    }
    else if (level===0){   
    safeDocking();
    break; 
    }
}

console.log("THIS IS THE REAL END. SIEMA!");
//-------------Functions below----------------------------------------------
function main() {
console.log("Function main start now.");
 
vehicle.turn();pointedRight=!pointedRight;
//you can use number of moves in calling ways function (digForward, digBack, digDown, digUp) like digForward(5);
//digForward(3);
//digDown(200);

 
for (i=0;i<180;i++) { 
    //tempCheck();
    
    if (tempCheck()==="boom") continue;
    if (tempCheck()==="outofammo") {step();step();step();
    //tempCheck()="end";
    continue; }
    
    //vehicle.cargo.unload();
    scanUnknown();
    digDown();
    }
console.log("Exited main() now.");
return;

}//end main
function digUp(times){
if (times===undefined){times=1;}
for (let i=0;i<times;i++) {   
    way="u";
    let s = vehicle.sensors.readSeismicDet();   
    isNeedFlight(s,way);
    position(way);
    vehicle.up();
    }// for times 
}
function digForward(times){
if (times===undefined){times=1;}
for (let i=0;i<times;i++) {
    way="f";
    let w = vehicle.sensors.readWeight();
    let s = vehicle.sensors.readSeismicDet();   
    isNeedFlight(s,way);
    //is air?
    if (s.forward[0]===0){
        position(way);
        vehicle.forward();
    }//or rock?
    else {    
        position(way);
        vehicle.dig.forward();
        vehicle.forward();
        }
    weightCheckResult=weightCheck(w);
    }// for times 
}
function digBack(times){
if (times===undefined){times=1;}
for (let i=0;i<times;i++) { 
    way="b";
    let w = vehicle.sensors.readWeight();
    let s = vehicle.sensors.readSeismicDet();   
    isNeedFlight(s,way);
    //is air?
    if (s.back[0]===0){
        vehicle.turn();pointedRight=!pointedRight;
        position(way);
        vehicle.forward();
    }//or rock?
    else {    
        vehicle.turn();pointedRight=!pointedRight;
        position(way);
        vehicle.dig.forward();
        vehicle.forward();
        }
    weightCheckResult=weightCheck(w);
    }// for times 
}
function digDown(times){
if (times===undefined){times=1;}
for (let i=0;i<times;i++) {
    way="d";
    let w = vehicle.sensors.readWeight();
    let s = vehicle.sensors.readSeismicDet();   
    isNeedFlight(s,way);
    position(way);    
    if (s.down[0]!==0 && s.down[1]===0){
        console.log("digDown & flyDown");
        vehicle.dig.down();
        vehicle.down();
        }
    else if (s.down[0]===0){
        console.log("flyDown");
        vehicle.down();
        }
    else {vehicle.dig.down();}
    weightCheckResult=weightCheck(w);
    }// for times 
}
function position(way){
    move++; 
    if (way=="d"){ level++; }
    else if (way=="u"){ level--; }
    else if (pointedRight===true){ right++;left--; }
    else if (pointedRight===false){ right--;left++; }
    // (moves to left <- dig level -> or moves to right) + (your direction of last move taht put you in this position) + (number of move) + (percentage of fuel in tank)
    if (right>0) { console.log(" <-"+level+"-> "+right+"  ("+way+") mv:"+move+" fl:("+(vehicle.fuel.level()*100/fuelStart).toFixed(0)+"%)"); }
    else if (left>0) { console.log(""+left+" <-"+level+"->   ("+way+") mv:"+move+" fl:("+(vehicle.fuel.level()*100/fuelStart).toFixed(0)+"%)"); }    
    else {     console.log(""+left+" <-"+level+"-> "+right+"  ("+way+") mv:"+move+" fl:("+(vehicle.fuel.level()*100/fuelStart).toFixed(0)+"%)"); }
}
function isNeedFlight(s,way){
    let image = vehicle.sensors.readSeismicImg();
    if (way=="d"){
        if ((s.down[1]===0) || (s.down[0]===0)){
            if (isflight===false){
            console.log("Flight On");
            vehicle.flight.on(); isflight=true;
            } else console.log("Keeping Flight On");
        }
        else if (s.down[0]!==0 && s.down[1]!==0 && isflight===true){
            console.log("Flight Off D");
            vehicle.flight.off(); isflight=false;
        }
    }
    if (way=="f") {
        if ((pointedRight===true && image[3][3]===0)||(pointedRight===false && image[3][1]===0)) {
            console.log("Flight On F");
            vehicle.flight.on(); isflight=true;
        } else if (s.down[0]!==0 && isflight===true) {
            console.log("Flight Off F");
            vehicle.flight.off(); isflight=false;
        }
    }
    if (way=="b") {
        if ((pointedRight===true && image[3][1]===0)||(pointedRight===false && image[3][3]===0)) {
            console.log("Flight On B");
            vehicle.flight.on(); isflight=true;
        } else if (s.down[0]!==0 && isflight===true) {
            console.log("Flight Off B");
            vehicle.flight.off(); isflight=false;
        }
    }
    if (way=="u"){
        if (isflight===true) {return;}
        if (isflight===false) {vehicle.flight.on(); isflight=true;}
    }
}
function weightCheck(w) {
    let w2 = vehicle.sensors.readWeight();
    let weightCurrent = w2-weightStart;
    let weightMineral = (w2-weightStart)-(w2-weightStart-weightCurrent);
    if (w<w2) {
        // (Weight of the just mined mineral)+( Cargo UsedSpace / Cargo Capacity)+( your current weight points)+(your percetnage of weight)
        console.log("(wght:"+(w2-w)+") "+vehicle.cargo.getUsedSpace()+"/"+vehicle.cargo.getCapacity()+" "+w2+"p wght:("+(weightCurrent*100/weightNet).toFixed(0)+"%)");
        }      
    if (w2+weightLeft >= weightLimit) {  
    //if (w<w2) {
        if (wayBackReason!="Weight limit reached.") {
            console.log("Time to go back. (Weight limit reached)");
            console.log("Flight On"); 
            }
        if (wayBackReason===undefined) {
            wayBackReason = "Weight limit reached.";
            return true;
            }
        }
    if (vehicle.cargo.getUsedSpace()+ 1 === vehicle.cargo.getCapacity()){
        if (wayBackReason!="CARGO LIMIT REACHED.") {
            console.log("Time to go back. (CARGO IS FULL)");
            console.log("Flight On");
            }
        if (wayBackReason===undefined) {
            wayBackReason = "CARGO LIMIT REACHED.";
            return true;
            }
        }
}
function fuelCheck() {
    let fuel = vehicle.fuel.level();
    if (fuel < (fuelSafeToBack)) {
    //if (fuel < 400/*19900*/) {
    console.log("Time to go back. (One Quarter Tank)");
    console.log("Flight On");
    if (wayBackReason===undefined) {
        wayBackReason =  "Fuel limit reached.";}
    return true;
    }
}
function tempCheck() {
let t = vehicle.sensors.readThermometer();
if (t>50) {console.log("temperature over 50: "+ t.toFixed(2)); }
if (t>boomTemp) {
    if (usedCharges==-1) {
        console.log("First time, BOOM Temp: "+ t.toFixed(2)+"DigDown deeper.");  
        usedCharges++;
        digDown();        
        return "boom";
        }
    else if (usedCharges<4) {console.log(usedCharges)
        console.log("BOOM Temp: "+ t.toFixed(2));  
        vehicle.flight.on(); isflight=true;
        vehicle.equipment.useSeismicCharge();   
        usedCharges++;
        digDown();        
        return "boom";
        }
    else if (usedCharges>=4){
        console.log("NO Seismic Charges left!");
        return "outofammo";
        }
    }//end if boomTemp.  
}    
function scanUnknown() {
    let known = [0,100,300,500,200,400,150,230,280,50,250,200,1500,750,600];
    let s = vehicle.sensors.readSeismicDet();   
//console.log(s);
// If your Seismic Detector have lower level, you can shorten this arrays to corresponding lenght, to make it run.
let forward = [s.forward[0], s.forward[1], s.forward[2], s.forward[3], s.forward[4], s.forward[5], s.forward[6], s.forward[7]];
let back = [s.back[0], s.back[1], s.back[2], s.back[3], s.back[4], s.back[5], s.back[6], s.back[7]];
let down = [s.down[0], s.down[1], s.down[2], s.down[3], s.down[4], s.down[5], s.down[6], s.down[7]];
let up = [s.up[0], s.up[1], s.up[2], s.up[3], s.up[4], s.up[5], s.up[6], s.up[7]];

for (i = 0; i < forward.length; i++){
        if (known.includes(down[i])===true) {
            } else {
            console.log("Found something D: "+i+" "+down[i]); stop();
            vehicle.engine.off();
            }
        if (known.includes(forward[i])===true) {
            } else {
            console.log("Found something F: "+i+" "+forward[i]); stop();
            vehicle.engine.off();
            }
        if (known.includes(back[i])===true) {
            } else {
            console.log("Found something B: "+i+" "+back[i]); stop();
            vehicle.engine.off();
            }
    }
return {};
}
function scan() {
let s = vehicle.sensors.readSeismicDet();   
//console.log(s);
let forward = [s.forward[0], s.forward[1], s.forward[2], s.forward[3], s.forward[4], s.forward[5], s.forward[6], s.forward[7]];
let back = [s.back[0], s.back[1], s.back[2], s.back[3], s.back[4], s.back[5], s.back[6], s.back[7]];
let down = [s.down[0], s.down[1], s.down[2], s.down[3], s.down[4], s.down[5], s.down[6], s.down[7]];
let up = [s.up[0], s.up[1], s.up[2], s.up[3], s.up[4], s.up[5], s.up[6], s.up[7]];
let F=[],
    B=[],
    D=[],
    U=[];
for (i = 0; i < forward.length; i++){
    for (j = 0; j < dontDig.length; j++) {
        if (down[i] == dontDig[j] && D[0]===undefined) {
            D=["no",i];
            }
        if (forward[i] == dontDig[j] && F[0]===undefined) {
            F=["no",i];
            }
        if (back[i] == dontDig[j] && B[0]===undefined) {
            B=["no",i];
            }
        }//end for dontDig
    for (j = 0; j < prio.length; j++) {
        if (down[i] == prio[j] && D[0]===undefined) {
            D=["yes",i];
            }
        if (forward[i] == prio[j] && F[0]===undefined) {
            F=["yes",i];
            }
        if (back[i] == prio[j] && B[0]===undefined) {
            B=["yes",i];
            }
        }//end for prio
        if (F[0]=="yes"||B[0]=="yes")  {
            break;
        }
    }//end for forward.lenght
console.log("_______ ["+i+"] D:"+D+" F:"+F+" B:"+B/*+" U:"+U+""*/);
return {F, B, D, U};
}//end function scan.
function step(){
fuelCheckResult=fuelCheck();
if(fuelCheckResult==true) return;

var scaned = scan();
var F = scaned.F,
    B = scaned.B,
    D = scaned.D,
    U = scaned.U;        

ewakuacja(F,B,D,U);
let tempResult=tempCheck(); 
if (tempResult=="boom") return;
let s = vehicle.sensors.readSeismicDet();

//Preferred prority directions: F, B, D, U
     if (F[0]===undefined && B[0]===undefined && D[0]===undefined) {
        way="d";//Down
        }
else if ( (F[0]=="yes")||(D.toString()=="no,0"&&F.toString()!="no,0"&&B[0]!="yes")||(B[0]=="yes"&&F[0]=="yes"&&F[1]<=B[1])) {
        way="f";//Forward
        }
else if ( (B[0]=="yes")||(D.toString()=="no,0"&&B.toString()!="no,0"&&F[0]!="yes")||(B[0]=="yes"&&F[0]=="yes"&&B[1]< F[1])||(D.toString()=="no,0"&&B[0]=="no"&&F[0]=="no"&&B.toString()!="no,0") ) {
        way="b";//Back
        }
else if ( (F[0]===undefined||F[0]=="no") && (B[0]===undefined||B[0]=="no") && D.toString()!="no,0" ) {
        way="d";//Down   
        } 
else if (D.toString()=="no,0"&&F.toString()=="no,0"&&B.toString()=="no,0") {
        console.log("EWAKUACJAAAAAAA 2.");
        let randomDigit= randomInt(2);
        console.log("randomDigit (1=turn): "+randomDigit);
        if (randomDigit==1) { vehicle.turn();pointedRight=!pointedRight; }
        do {    
            console.log("while- flightback until ForB avaib");
            //console.log("D: "+D[0]+D[1]+" F: "+F[0]+" B: "+B[0])
            flightBack();
            //scan();
            var scaned = scan();
            var F = scaned.F,
                B = scaned.B,
                D = scaned.D,
                U = scaned.U;
        } while (F[0]=="no"&&B[0]=="no");
        
        if (F[0]!="no"){digForward(); digForward(); digForward(); digForward();}
        else if (B[0]!="no"){digBack(); digForward(); digForward(); digForward();}
        else {console.log("NOR LEFT, NOR RIGHT"); flightBack(); digForward();}
        }//end ewakuacja 2
   else {console.log("Else: ERRORRRRRRRRRR with direction choosing"); 
        way="d";
        }    

     if (way=="d") { digDown(); }        
else if (way=="f") { digForward(); }        
else if (way=="b") { digBack(); }        
else if (way=="u") { digUp(); }
    
}//end step f
function boom() {  
    vehicle.flight.on();  
    vehicle.equipment.useSeismicCharge();  
    digDown();  
}
function randomInt(number) {
        return Math.floor(Math.random()*(number));
}      
function ewakuacja(F,B,D,U) {
if ((D.toString()=="no,0")&&(F[0]=="no"||B[0]=="no")){
    stuckCount++;
    console.log("stuckCount: "+stuckCount);
    } else {stuckCount=0;}
if (stuckCount>=11) {
    console.log("stuckCount >=11: "+stuckCount);
    let randomDigit= randomInt(2);
    console.log("randomDigit (1=turn): "+randomDigit);
    if (randomDigit==1) { vehicle.turn();pointedRight=!pointedRight; }
    do {    
        console.log("while- flightback until ForB avai");
        flightBack();
        var scaned = scan();
        var F = scaned.F,
            B = scaned.B,
            D = scaned.D,
            U = scaned.U;
    } while ( ((D.toString()=="no,0")&&(F[0]=="no"||B[0]=="no"))||(F[0]=="no"||B[0]=="no") );
    
        if (F[0]!="no"){digForward(); digForward(); digForward(); digForward();}
        else if (B[0]!="no"){digBack(); digForward(); digForward(); digForward();}
        else {console.log("NOR LEFT, NOR RIGHT"); flightBack(); digForward();}
    stuckCount=0;
    console.log("stuckCount back to 0: "+stuckCount);
    console.log("End of EWAKUACJA. stuckCount: "+stuckCount);
    }// koniec if (stuckCount>=11)
}//end f ewakuacja
function ewakuacjaFlightBack() {
let s = vehicle.sensors.readSeismicDet();
if ((s.forward[0]===0||s.back[0]===0)&&s.up[0]!=0) {
    stuckCountB++;
    if (stuckCountB>=6) { console.log("stuckCountB: "+stuckCountB); }
} else {stuckCountB=0; }
    
if (stuckCountB>=14) {
    console.log("stuckCountB reached: "+stuckCountB);
    let randomDigit= randomInt(2)
    console.log("randomDigit (1=turn): "+randomDigit);
    if (randomDigit==1) { vehicle.turn();pointedRight=!pointedRight; }
        
    for(i=0; i<4; i++){    
        console.log("4 times down");
        s = vehicle.sensors.readSeismicDet();
        if (s.down[0]===0) {    
            digDown(); }
        else if (s.forward[0]===0) {
            digForward(); }
        else if (s.back[0]===0) {
            digBack(); }
        }  
    for(i=0; i<=8; i++){
        console.log("8 times forward/up");
        s = vehicle.sensors.readSeismicDet();
        if (s.forward[0]===0) {console.log("will digForward");
            digForward(); }
        if (s.up[0]===0) {    
            digUp(); }
        else if (s.back[0]===0) {
            digBack(); }
        }
    stuckCountB=0;
    console.log("End of EWAKUACJA flightBack. stuckCountB now: "+stuckCountB);
    }// end if (stuckCountB>=12)
}// end ewakuacjaFlightBack()
function flightBack() {
if (isflight==false) { vehicle.flight.on(); isflight=true; }
let s = vehicle.sensors.readSeismicDet();
if  (s.up[0] === 0) {
    vehicle.up();
    way = "u";
    position(way);
} else if (s.forward[0] === 0) {
    vehicle.forward(); 
    way = "f";
    position(way);
} else if (s.back[0] === 0) {
    vehicle.turn();pointedRight=!pointedRight;
    vehicle.forward(); 
    way = "b";
    position(way);
} else {
    console.log("No place to fly. return;");
    return true;
    }
}
function safeDocking() { 
console.log("You are on the surface. Auto Docking.");
    if (right>0) {
        if (pointedRight===true) {
            vehicle.turn();pointedRight=!pointedRight;
        } 
        for(i=right;i>0;i--) {
            digForward();
        }
    } else if (left>0) {
        if (pointedRight===false) {
            vehicle.turn();pointedRight=!pointedRight;
        } 
        for(i=left;i>0;i--) {
            digForward();
        }
    }

    let fuel = vehicle.fuel.level();
    let w = vehicle.sensors.readWeight();
    let weightLeft = weightLimit-w;
    console.log("Manual Docking !");
    console.log("Fuel Start: "+fuelStart);
    console.log("Fuel left: "+(fuel).toFixed(2));  
    console.log("Weight Net: "+weightNet);
    console.log("Weight left:"+weightLeft);
    console.log("wayBackReason: "+wayBackReason); 
    console.log("Cargo: ("+vehicle.cargo.getUsedSpace()+"/"+cc+")");    
    
    vehicle.cargo.unload();
    vehicle.forward();
    vehicle.flight.off();
    vehicle.engine.off(); 
    console.log("KONIEC")
return true;
}
//-------------End of Functions and code-------------------------------------