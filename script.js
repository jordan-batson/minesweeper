var msNamespace = {
	// all variables used in this game
	board: null,
	flagsDown: 0,
	correctFlags: 0,
	buttonsUp: 0,
	gameOver: false,
	started: false,
	interval: null,
	time: 0,
	mines: 0,
	imageHTML: "<img src='images/flag.png' style='height: 100%'>",
	
	// preloads images to ensure fast loading (done for practice)
	preloadImages:function(){
		var image = new Array(6);
		for(var i=0; i<6; i++)
			image[i] = new Image();
		image[0].src = "images/flag.png";
		image[1].src = "images/mine.png";
		image[2].src = "images/happy.png";
		image[3].src = "images/click.png";
		image[4].src = "images/dead.png";
		image[5].src = "images/win.png";
	},
	
	// defines font colors for the buttons
	setButtonColor:function(btn){
		switch(btn.innerHTML){
			case "1":
				return "blue";
			case "2":
				return "green";
			case "3":
				return "red";
			case "4":
				return "navy";
			case "5":
				return "brown";
			case "6":
				return "orange";
			case "7":
				return "gray";
			case "8":
				return "purple";
			default:
				return "black";
		}
	},
	
	// initial function that is called
	drawBoard:function(board_x,board_y,mines){
		
		// html elements
		var container = document.getElementById("container");
		var wrap = document.getElementById("wrap");
		var status = document.getElementById("status");
		
		var containerHTML = "";
		var errMsg = "";
		var solMsg = "";
		
		// generate an error message if invalid values are entered
		if(board_x<=1){
			board_x=2;
			errMsg+="Cols is less than 2\n";
			solMsg+="Setting cols to 2\n";
			document.getElementById("cols").value=2;
		}
		if(board_y<=1){
			board_y=2;
			errMsg+="Rows is less than 2\n";
			solMsg+="Setting rows to 2\n";
			document.getElementById("rows").value=2;
		}
		if(mines<1){
			mines=1;
			errMsg+="Mines is less than 1\n";
			solMsg+="Setting mines to 1\n";
			document.getElementById("mines").value=1;
		}
		if(mines>=(board_x*board_y)){
			mines=(board_x*board_y)-1;
			errMsg+="Mines is greater than rows * cols ("+(board_x*board_y)+")\n";
			solMsg+="Setting mines to "+mines+"\n";
			document.getElementById("mines").value=mines;
		}
		
		// display error message
		if(errMsg!="" && solMsg!=""){
			alert("There were the following errors:\n"+errMsg+"\nThe following were done to resolve them:\n"+solMsg);
		}
			
		// define the mines, board size, and number of buttons that are up (unpressed)
		this.mines = mines;
		this.board = new Array(board_y);
		this.buttonsUp = board_x * board_y;
		
		// generates new dimensions for html elements
		var newWidth = ((1/board_x)*100);
		var newHeight = ((1/board_y)*100);
		
		// strings for container css properties
		var width = (board_x*3) + "vmin";
		var height = (board_y*3) + "vmin";
		
		// sets dimensions for container
		container.style.width = width;
		container.style.height = height;
		
		// sets the top button to smiley face
		status.innerHTML = "<img src='images/happy.png' style='height: 75%'>";
		
		// adjusts the wrapper width
		wrap.style.width = width;
		
		// sets the size for individual buttons
		document.getElementById("style").innerHTML += "#container button{width: "+newWidth+"%; height: "+newHeight+"%;}";
		
		// create the html for the buttons
		for(var y=0; y<board_y; y++){
			this.board[y] = new Array(board_x);
			for(var x=0; x<board_x; x++){
				containerHTML += "<button class='game-btn' id='btn-"+y+"-"+x+"' onclick='msNamespace.btnClick("+x+","+y+",event)' onmousedown='msNamespace.mouseDown("+x+","+y+",event)' onmouseup='msNamespace.mouseUp("+x+","+y+",event)' data-value='up' oncontextmenu='return false'></button>";
				this.board[y][x] = 0;
			}
			containerHTML += "<br>";
		}
		
		// insert html into container
		container.innerHTML = containerHTML;
		
		// plant the mines
		this.plantMines(board_x,board_y,mines);
	},
	
	// clears buttons surrounded by 0 mines when a user clicks on one
	clearTheBlanks:function(x,y){
		// grabs the button id
		var button = document.getElementById("btn-"+y+"-"+x);
		
		// if the button doesn't exist, do nothing
		if(this.board[y]==null || this.board[y][x]==null)
			return;
		
		// space indicates down (depreciated feature)
		if(button.innerHTML==" ")
			return;
		
		// if the button is down
		if(button.getAttribute("data-value")=="down")
			return;
		
		// if the button is a flag
		if(button.getAttribute("data-value")=="flag")
			return;
		
		// button is surrounded by mines
		if(this.board[y][x]!=0){
			button.style.border = "inset white";
			button.style.cursor = "default";
			button.innerHTML = this.board[y][x];
			button.style.color = this.setButtonColor(button);
			button.setAttribute("data-value","down");
			this.buttonsUp--;
			return;
		}
		
		// down button styles
		button.style.border = "inset white";
		button.style.background = "white";
		button.style.cursor = "default";
		button.innerHTML = " ";
		button.setAttribute("data-value","down");
		this.buttonsUp--;
		
		// perform recursive functions on surrounding buttons
		this.clearTheBlanks(x,y+1);
		this.clearTheBlanks(x,y-1);
		this.clearTheBlanks(x+1,y);
		this.clearTheBlanks(x+1,y+1);
		this.clearTheBlanks(x+1,y-1);
		this.clearTheBlanks(x-1,y);
		this.clearTheBlanks(x-1,y+1);
		this.clearTheBlanks(x-1,y-1);
	},
	mouseUp:function(x,y,event){
		// perform right click function if the button is right
		if(event.button==2){
			this.btnRightClick(x,y);
		}
	},
	mouseDown:function(x,y,event){
		// get button clicked
		var button = document.getElementById("btn-"+y+"-"+x);
		
		// do nothing
		if(this.gameOver || button.getAttribute("data-value")=="down" || button.getAttribute("data-value")=="flag")
			return;
		
		// make the smiley face looked shooked
		if(event.button==0)
			document.getElementById("status").innerHTML = "<img src='images/click.png' style='height: 75%'>";
	},
	btnClick:function(x,y,event){
		// do nothing if game over
		if(this.gameOver)
			return;
		
		// perform left click operations if left button
		if(event.button==0){
			this.btnLeftClick(x,y);
		}
		
		// automatically win if every button that is up is a mine
		if(this.mines==this.buttonsUp){
			this.win();
			return;
		}

		// this function is possibly redundant
		if(this.buttonsUp==this.flagsDown && this.buttonsUp==this.correctFlags){
			this.win();
			return;
		}
	},
	btnLeftClick:function(x,y){
		// get button
		var button = document.getElementById("btn-"+y+"-"+x);
		
		// start the timer if it hasn't been already
		if(!this.started){
			this.started=true;
			this.interval = setInterval(this.startTimer,1000);
		}
		
		// do nothing if down or flag
		if(button.getAttribute("data-value")=="flag" || button.getAttribute("data-value")=="down")
			return;
		
		// lose if mine
		if(this.board[y][x]==-1){
			this.lose();
			return;
		}
		
		// clear the blanks if not surrounded by mines
		if(this.board[y][x]==0){
			document.getElementById("status").innerHTML = "<img src='images/happy.png' style='height: 75%'>";
			this.clearTheBlanks(x,y);
			return;
		}
		
		// button is surrounded by mine
		if(this.board[y][x]!=0){
			document.getElementById("status").innerHTML = "<img src='images/happy.png' style='height: 75%'>";
			
			// change the styles
			button.style.border = "inset white";
			button.setAttribute("data-value","down");
			button.innerHTML = this.board[y][x];
			button.style.color = this.setButtonColor(button);
			this.buttonsUp--;
			return;
		}
	},
	btnRightClick:function(x,y){
		var button = document.getElementById("btn-"+y+"-"+x);
		var imageHTML = '<img src="images/flag.png" style="height: 75%">';
		
		// do nothing if button is down or game is over
		if(button.getAttribute("data-value")=="down" || button.getAttribute("data-value")=="done"){
			return;
		}
		
		// remove the flag
		if(button.getAttribute("data-value")=="flag"){
			this.flagsDown--;
			document.getElementById("flag").innerHTML = this.flagsDown;
			if(this.board[y][x]==-1)
				this.correctFlags--;
			
			button.innerHTML = "";
			button.setAttribute("data-value","up");
			return;
		}
		
		// add the flag
		if(button.getAttribute("data-value") == "up"){
			this.flagsDown++;
			document.getElementById("flag").innerHTML = this.flagsDown;
			if(this.board[y][x]==-1)
				this.correctFlags++;
			
			button.innerHTML = imageHTML;
			button.setAttribute("data-value","flag");
			return;
		}
	},
	// function adds the numbers around the mines
	addPerimeter:function(x,y){
		if(this.board[y]==null || this.board[y][x]==null || this.board[y][x]==-1)
			return;
		
		this.board[y][x]++;
	},
	plantMines:function(board_x,board_y,mines){
		// do this till all the minds are down
		while(mines!=0){
			var rand_x = 0, rand_y = 0;
			
			// plop the mines if the space isn't mined or the first spot
			do{
				rand_x = parseInt(Math.random() * board_x);
				rand_y = parseInt(Math.random() * board_y);
			}
			while(this.board[rand_y][rand_x]==-1 || (rand_x==0 && rand_y==0))
				
			this.board[rand_y][rand_x]=-1;
			
			// do surrounding spots
			this.addPerimeter(rand_x+1,rand_y+1);
			this.addPerimeter(rand_x-1,rand_y-1);
			this.addPerimeter(rand_x+1,rand_y);
			this.addPerimeter(rand_x-1,rand_y);
			this.addPerimeter(rand_x,rand_y+1);
			this.addPerimeter(rand_x,rand_y-1);
			this.addPerimeter(rand_x+1,rand_y-1);
			this.addPerimeter(rand_x-1,rand_y+1);
			
			mines--;
		}
	},
	win:function(){
		var width = this.board[0].length;
		var height = this.board.length;
		document.getElementById("status").innerHTML = "<img src='images/win.png' style='height: 75%'>";
		
		this.started=false;
		clearInterval(this.interval)
		
		this.gameOver=true;
		
		// stop here if all the flags are up
		if((this.mines==this.flagsDown) && (this.flagsDown==this.correctFlags)){
			return;
		}
		
		// add flag graphics automatically
		for(var y=0; y<height; y++)
			for(var x=0; x<width; x++){
				var button = document.getElementById("btn-"+y+"-"+x);
				if(button.getAttribute("data-value")=="up"){
					this.flagsDown++;
					button.innerHTML = "<img src='images/flag.png' style='height: 75%'>";
				}
			}
		document.getElementById("flag").innerHTML = this.flagsDown;
	},
	lose:function(){
		var width = this.board[0].length;
		var height = this.board.length;
		document.getElementById("status").innerHTML = "<img src='images/dead.png' style='height: 75%'>";
		
		// stop timer
		this.started=false;
		clearInterval(this.interval);
		
		// game is over
		this.gameOver=true;
			
		// add mine graphics to all mine spots
		for(var y=0; y<height; y++)
			for(var x=0; x<width; x++){
				var button = document.getElementById("btn-"+y+"-"+x);
				if(this.board[y][x]==-1){
					button.innerHTML = "<img src='images/mine.png' style='height: 75%'>";
				}
			}
	},
	startTimer:function(){
		var timeControl = document.getElementById("time");
		timeControl.innerHTML = ++msNamespace.time;
	},
	resetBoard:function(){
		this.board =  null;
		this.flagsDown = 0;
		document.getElementById("flag").innerHTML = this.flagsDown;
		this.correctFlags = 0;
		this.buttonsUp = 0;
		this.gameOver = false;
		this.mines = 0;
		this.started = false;
		this.time = 0;
		clearInterval(this.interval);
		this.interval = null;
		this.imageHTML = "<img src='images/flag.png' style='height: 100%'>";
		document.getElementById("time").innerHTML = "0";
		
		// grabs user inputs and draws the board
		msNamespace.drawBoard(document.getElementById("cols").value,document.getElementById("rows").value,document.getElementById("mines").value);
	}
}
msNamespace.preloadImages();
msNamespace.drawBoard(document.getElementById("cols").value,document.getElementById("rows").value,document.getElementById("mines").value);