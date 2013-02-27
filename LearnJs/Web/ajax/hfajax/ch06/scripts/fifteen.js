window.onload = initPage;
function initPage() {
	var table = document.getElementById('puzzleGrid');
	var cells = table.getElementsByTagName('td');
	for(var i=0; i < cells.length; i++) {
		var cell = cells[i];
		cell.onclick = tileClick;
	}
}
function tileClick() {
	if (cellIsEmpty(this)) {
		alert("Please click on a numberd tile");
		return;
	}

	var currentRow = this.id.charAt(4);
	var currentCol = this.id.charAt(5);

	// check above
	if (currentRow > 1) {
		var testRow = Number(currentRow) - 1;
		var testCellId = "cell" + testRow + currentCol;
		var testCell = document.getElementById(testCellId);
		if (cellIsEmpty(testCell)) {
			swapTiles(this, testCell);
			return;
		}
	}
	// check below
	if (currentRow < 4) {
		var testRow = Number(currentRow) + 1;
		var testCellId = "cell" + testRow + currentCol;
		var testCell = document.getElementById(testCellId);
		if (cellIsEmpty(testCell)) {
			swapTiles(this, testCell);
			return;
		}
	}
	// check to the left
	if (currentCol > 1) {
		var testCol = Number(currentCol) - 1;
		var testCellId = "cell" + currentRow + testCol;
		var testCell = document.getElementById(testCellId);
		if (cellIsEmpty(testCell)) {
			swapTiles(this, testCell);
			return;
		}
	}
	// check to the right
	if (currentCol < 4) {
		var testCol = Number(currentCol) + 1;
		var testCellId = "cell" + currentRow + testCol;
		var testCell = document.getElementById(testCellId);
		if (cellIsEmpty(testCell)) {
			swapTiles(this, testCell);
			return;
		}
	}
	
}
function cellIsEmpty(cell) {
	var image = cell.firstChild;
	while (image.nodeName == "#text") {
		image = image.nextSibling;
	}
	if (image.alt == 'empty') 
		return true;
	else
		return false;
}
function swapTiles(selectedCell, destinationCell) {
	selectedImage = selectedCell.firstChild;
	while (selectedImage.nodeName == "#text") {
    selectedImage = selectedImage.nextSibling;
  }
	destinationImage = destinationCell.firstChild;
	while (destinationImage.nodeName == "#text") {
    destinationImage = destinationImage.nextSibling;
  }
	selectedCell.appendChild(destinationImage);
  destinationCell.appendChild(selectedImage);

	if (puzzleIsComplete()) {
		document.getElementById('puzzleGrid').className = "win";
	}
}
function puzzleIsComplete() {
	var tiles = document.getElementById('puzzleGrid').getElementsByTagName('img');
	var tileOrder = "";
	for (var i=0; i<tiles.length; i++) {
		var num = tiles[i].src.substr(-6,2);
		if (num != "ty") 
			tileOrder += num;
	}
	if (tileOrder == "010203040506070809101112131415")
		return true;
	return false;
}