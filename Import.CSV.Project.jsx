var csvFile = File.openDialog("Target CSV File", "*.csv"); // Prompt for CSV file

var csvFile = csvFile.fsName; // Format CSV filepath to be friendly

app.project.createNewSequence("Auto Seq", ""); // Create a new sequence

var importCount = 0;
var subCounter = 0;
var clipCounter = 0;

var infoArray;
var bufferTime = 2; // Time in seconds between clips when placed in timeline

// Open, read, and close the CSV file
if (csvFile) {
    var file = File(csvFile);
    file.open("r");
    var fullText = file.read();
    file.close();

    infoArray = fullText.split("\n"); // Split the CSV file at every new line
    for (var a = 0; a < infoArray.length; a++) { // Loop through each line, split the line at every comma
        infoArray[a] = infoArray[a].split(",");
    }
}

// Check CSV Format
var expectedColumnCount = 20; // Adjust this based on your CSV format
if (infoArray.length > 0 && infoArray[0].length != expectedColumnCount) {
    alert("CSV format error: Expected " + expectedColumnCount + " columns, but found " + infoArray[0].length);
    continueExecution = false; // Update flag to stop further execution
}

// Remove empty line if exists
if (infoArray[infoArray.length - 1] == "") {
    infoArray.splice(infoArray.length - 1, 1);
}

app.project.rootItem.createBin("Original Clips"); // Create bin for organization
var importBin = findBinIndex(app.project.rootItem, "Original Clips"); // Store the index path to that bin

var baseFolderDirectory = infoArray[0][0]; // Extract the base folder directory from the first row, first column

// Function to check if file exists
function fileExists(filePath) {
    var file = new File(filePath);
    return file.exists;
}

var successfulImports = 0;
var failedImports = 0;

// Loop through infoArray
if (infoArray) {
    for (var i = 4; i < infoArray.length; i++) {
        var importPath = baseFolderDirectory + "/" + infoArray[i][12]; // Combine base directory with file path
        if (!fileExists(importPath)) {
            alert("File not found: " + importPath);
            failedImports++;
            continue; // Skip this file and continue with the next
        }

        app.project.importFiles([importPath], 1, importBin, 0); // Import file
        successfulImports++;
        
               for (var a = 0; a < importBin.children.numItems; a++){ // LOOP THROUGH THE IMPORT BIN
                    if( importBin.children[a].name.indexOf(" - ")==-1){
                        importBin.children[a].name = " "+ importCount + " - " + importBin.children[a].name; // RENAME WITH A THE NUMBER IT WAS IMPORTED, THIS HOLDS THE ORDER OF THE CSV
                        infoArray[i][infoArray[i].length] = importBin.children[a].nodeId; // STORE THE ITEMS NODEID IN THE CSV ARRAY
                    }    
        }   
    }
}




//~ /* ================================================= END VIDEO 1 ===============================================================*/
try {
    app.project.rootItem.createBin("Subclips"); // CREATE BIN FOR OUR SUBCLIPS
    var moveTo = findBinIndex(app.project.rootItem,"Subclips");

    for (var a = 0; a < app.project.sequences.numSequences; a++) { // LOOP THROUGH ALL SEQS    
        if (app.project.sequences[a].name == "Auto Seq") { // FIND OUR CREATED SEQUENCE
            app.project.activeSequence = app.project.sequences[a]; // SET THE SEQUENCE TO BE OUR ACTIVE SEQ
        }
    }

    var numItems = importBin.children.numItems;

    for (var a = 0; a < numItems; a++) {
        var currentItem = importBin.children[a];
        for (var i = 4; i < infoArray.length; i++) { // Starting from row 5
            if (currentItem.type == 1 && currentItem.nodeId == infoArray[i][infoArray[i].length - 1]) {
                var inPoint = timecodeToSeconds(infoArray[i][18]); // Start time from column S
                var outPoint = timecodeToSeconds(infoArray[i][19]); // End time from column T
                
                if (inPoint < 0 || outPoint < 0 || outPoint <= inPoint) {
                    alert("Invalid timecode for clip: " + infoArray[i][5]);
                    continue; // Skip this subclip and continue with the next
                }
                
                var subClipName = infoArray[i][5]; // Name from column F
                var newSub = currentItem.createSubClip(subClipName, inPoint, outPoint, 1, 1, 1);
                newSub.moveBin(moveTo); // MOVE INTO THE SUBCLIPS BIN
                var activeSeq = app.project.activeSequence;
                placeClip(activeSeq, newSub, bufferTime);
                //subCounter++;
            }
        }
    }
} catch (error) {
    alert("An error occurred during subclip creation: " + error.message);
}



/* ================================================= WOOHOO WERE DONE! ===============================================================*/

// FUNCTION LIST
 function findBinIndex(currentItem, nameToFind){  
     if(nameToFind){
    for (var j = 0; j < currentItem.children.numItems; j++){  
        var currentChild = currentItem.children[j];  
        
                    if (currentChild.type == ProjectItemType.BIN && currentChild.name.toUpperCase() == nameToFind.toUpperCase() ){
                        globalBind = currentChild;
                        return currentChild;
                    }
        
                     if (currentChild.type == ProjectItemType.BIN){      
                    findBinIndex(currentChild, nameToFind);  
                    }   
        }  
    
    } else {
        alert("No bin was targeted");
       }
   }
function timecodeToSeconds(timecodeString) {
    var timeCodeArray = timecodeString.split(":");
    if (timeCodeArray.length === 3) {
        var hours = parseInt(timeCodeArray[0], 10);
        var minutes = parseInt(timeCodeArray[1], 10);
        var seconds = parseInt(timeCodeArray[2], 10);
        return (hours * 3600) + (minutes * 60) + seconds;
    } else {
        console.error("Timecode format error:", timecodeString);
        return 0; // Return 0 or some error value to handle this case appropriately
    }
}

function placeClip(activeSeq , subClip , buffer){
    subClip.setScaleToFrameSize();// SET SCALE TO FRAME SIZE 
    
                        if(activeSeq.videoTracks[0].clips.numItems == 0){ // IF THERE ARE NOT CLIPS IN THE SEQUENCE, PLACE FRIST CLIP AT TIME ZERO
                        activeSeq.videoTracks[0].insertClip(subClip,0) 
                        //clipCounter++;
                        } else { // IF THERE ARE CLIPS IN THE SEQUENCE, PLACE AT THE TIMECODE OF END OF THE LAS CLIP + THE BUFFER TIME
                        var numClips = activeSeq.videoTracks[0].clips.numItems;
                        var insertTime = activeSeq.videoTracks[0].clips[numClips - 1].end.seconds + buffer;
                        activeSeq.videoTracks[0].insertClip(subClip,insertTime);
                        //clipCounter++;
                        }
                    }
   