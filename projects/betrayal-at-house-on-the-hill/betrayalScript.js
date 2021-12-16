/*Betrayal at House on the Hill JavaScript
Ryan Carpus*/

//displays results of dice to screen
  const renderDice = (dice) => {
  for (let i = 1; i < 9; i++) {
    $('#die' + i).attr("src","./dieRollNull.jpg");
    //$('#die' + i).fadeOut(1000, $('#die' + i).attr("src","./dieRollNull.jpg"));
    };
  for (let i = 0; i < dice.length; i++) {
    $('#die' + (i+1)).attr("src","./dieRoll"+dice[i]+".jpg")
    //$('#die' + (i+1)).fadeIn(1000, $('#die' + (i+1)).attr("src","./dieRoll"+dice[i]+".jpg"));
    };
  };






//contains functions for character class
class Character {
  constructor(firstName, lastName, speedSlider, mightSlider, knowledgeSlider, sanitySlider, speedStart, mightStart, knowledgeStart, sanityStart) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._fullName = firstName + ' ' + lastName;
    this._speedSlider = speedSlider; 
    this._mightSlider = mightSlider;
    this._knowledgeSlider = knowledgeSlider;
    this._sanitySlider = sanitySlider;
    this._speedStart = speedStart; 
    this._mightStart = mightStart;
    this._knowledgeStart = knowledgeStart;
    this._sanityStart = sanityStart;
    this._speedIndex = speedStart; 
    this._mightIndex = mightStart;
    this._knowledgeIndex = knowledgeStart;
    this._sanityIndex = sanityStart;
    this._gymnasiumBonus = false;
    this._larderBonus = false;
    this._libraryBonus = false;
    this._chapelBonus = false;
  }

  get speedSlider() {return this._speedSlider;}
  get mightSlider() {return this._mightSlider;}
  get knowledgeSlider() {return this._knowledgeSlider;}
  get sanitySlider() {return this._sanitySlider;}
  get speedStart() {return this._speedStart;}
  get mightStart() {return this._mightStart;}
  get knowledgeStart() {return this._knowledgeStart;}
  get sanityStart() {return this._sanityStart;}
  get speedIndex() {return this._speedIndex;}
  get mightIndex() {return this._mightIndex;}
  get knowledgeIndex() {return this._knowledgeIndex;}
  get sanityIndex() {return this._sanityIndex;}
  get gymnasiumBonus() {return this._gymnasiumBonus;}
  get larderBonus() {return this._larderBonus;}
  get libraryBonus() {return this._libraryBonus;}
  get chapelBonus() {return this._chapelBonus;}
  
  set speedIndex(value) {this._speedIndex = value;}
  set mightIndex(value) {this._mightIndex = value;}
  set knowledgeIndex(value) {this._knowledgeIndex = value;}
  set sanityIndex(value) {this._sanityIndex = value;}
  set gymnasiumBonus(bool) {this._gymnasiumBonus = bool;}
  set larderBonus(bool) {this._larderBonus = bool;}
  set libraryBonus(bool) {this._libraryBonus = bool;}
  set chapelBonus(bool) {this._chapelBonus = bool;}


  //stat rolls for each stat
  speedRoll() {
    let numDice = this.speedSlider[this.speedIndex];  //number of dice is equal to the current value of the stat 
    let total = 0;  //initalizes dice count
    let diceResults = [];
    for (let i = 0; i < numDice; i++) { //for each die
      let die = Math.floor(Math.random() * 3);  //roll a random integer between 0 and 2
      diceResults.push(die); //adds the individual die to the dice results array
      total += die; //increment the total
    };
    renderDice(diceResults); //renders dice results on screen
    return total;  //return total
    } //speedRoll

   mightRoll() {
    let numDice = this.mightSlider[this.mightIndex];  
    let total = 0;  
    let diceResults = [];
    for (let i = 0; i < numDice; i++) { 
      let die = Math.floor(Math.random() * 3);  
      diceResults.push(die);
      total += die;
    };
    renderDice(diceResults);  
    return total;  
    } //mightRoll

  knowledgeRoll() {
    let numDice = this.knowledgeSlider[this.knowledgeIndex];  
    let total = 0; 
    let diceResults = []; 
    for (let i = 0; i < numDice; i++) { 
      let die = Math.floor(Math.random() * 3);  
      diceResults.push(die);
      total += die;
    };
    renderDice(diceResults);  
    return total;  
    } //knowledgeRoll

  sanityRoll() {
    let numDice = this.sanitySlider[this.sanityIndex];  
    let total = 0;  
    let diceResults = [];
    for (let i = 0; i < numDice; i++) { 
      let die = Math.floor(Math.random() * 3);  
      diceResults.push(die);
      total += die;
    };
    renderDice(diceResults);  
    return total;  
    } //sanityRoll

  //function increases stat by one index if not already at the top of slider.
  speedUp() {
    if (this.speedIndex < 8) { //if stat is below top value on slider
      this.speedIndex += 1;  //increase the index by one
    }
  } //speedUp

  mightUp() {
    if (this.mightIndex < 8) { 
      this.mightIndex += 1;  
    }
  } //mightUp

  knowledgeUp() {
    if (this.knowledgeIndex < 8) { 
      this.knowledgeIndex += 1;  
    }
  } //knowledgeUp

  sanityUp() {
    if (this.sanityIndex < 8) { 
      this.sanityIndex += 1;  
    }
  } //knowledgeUp

  //function decreases stat by one index if not at bottom of slider.
  speedDown() {
    if (this.speedIndex > 1) { //if stat is above top value on slider
      this.speedIndex -= 1;  //decrease the index by one
      return true;
    } else if (haunt){ //The stat is on the bottom of the slider. If the haunt has begun
        return false;  //The character dies
    }  else {
        return true;} //If the haunt has not begun, the stat stays at index 1
    } //speedDown

  mightDown() {
    if (this.mightIndex > 1) { 
      this.mightIndex -= 1;  
      return true;
    } else if (haunt){ 
        return false;  
    }  else {
        return true;} 
    } //mightDown

  knowledgeDown() {
    if (this.knowledgeIndex > 1) { 
      this.knowledgeIndex -= 1;  
      return true;
    } else if (haunt){ 
        return false;  
    }  else {
        return true;} 
    } //knowledgeDown

  sanityDown()  {
    if (this.sanityIndex > 1) { 
      this.sanityIndex -= 1;  
      return true;
    } else if (haunt){ 
        return false;  
    }  else {
        return true;}
    } //sanityDown
}; //class
let haunt = false;
//All playable characters
const Brandon   = new Character("Brandon", "Jaspers",         [0, 3, 4, 4, 4, 5, 6, 7, 8], [0, 2, 3, 3, 4, 5, 6, 6, 7], [0, 1, 3, 3, 5, 5, 6, 6, 7], [0, 3, 3, 3, 4, 5, 6, 7, 8], 3, 4, 3, 4);
const Peter     = new Character("Peter", "Akimoto",           [0, 3, 3, 3, 4, 6, 6, 7, 7], [0, 2, 3, 3, 4, 5, 5, 6, 8], [0, 3, 4, 4, 5, 6, 7, 7, 8], [0, 3, 4, 4, 4, 5, 6, 6, 7], 4, 3, 3, 4);

const Jenny     = new Character("Jenny", "LeClerc",           [0, 2, 3, 4, 4, 4, 5, 6, 8], [0, 3, 4, 4, 4, 4, 5, 6, 8], [0, 2, 3, 3, 4, 4, 5, 6, 8], [0, 1, 1, 2, 4, 4, 4, 5, 6], 4, 3, 3, 5);
const Heather   = new Character("Heather", "Granville",       [0, 3, 3, 4, 5, 6, 6, 7, 8], [0, 3, 3, 3, 4, 5, 6, 7, 8], [0, 2, 3, 3, 4, 5, 6, 7, 8], [0, 3, 3, 3, 4, 5, 6, 6, 6], 3, 3, 5, 3);

const Darrin    = new Character("Darrin", "'Flash' Williams", [0, 4, 4, 4, 5, 6, 7, 7, 8], [0, 2, 3, 3, 4, 5, 6, 6, 7], [0, 2, 3, 3, 4, 5, 5, 5, 7], [0, 1, 2, 3, 4, 5, 5, 5, 7], 5, 3, 3, 3);
const Ox        = new Character("Ox", "Bellows",              [0, 2, 2, 2, 3, 4, 5, 5, 6], [0, 4, 5, 5, 6, 6, 7, 8, 8], [0, 2, 2, 3, 3, 5, 5, 6, 6], [0, 2, 2, 3, 4, 5, 5, 6, 7], 5, 3, 3, 3);

const Madame    = new Character("Madame", "Zostra",           [0, 2, 3, 3, 5, 5, 6, 6, 7], [0, 2, 3, 3, 4, 5, 5, 5, 6], [0, 1, 3, 4, 4, 4, 5, 6, 6], [0, 4, 4, 4, 5, 6, 7, 8, 8], 3, 4, 4, 3);
const Vivian    = new Character("Vivian", "Lopez",            [0, 3, 4, 4, 4, 4, 6, 7, 8], [0, 2, 2, 2, 4, 4, 5, 6, 6], [0, 4, 5, 5, 5, 5, 6, 6, 7], [0, 4, 4, 4, 5, 6, 7, 8, 8], 4, 3, 4, 3);

const Zoe       = new Character("Zoe", "Ingstrom",            [0, 4, 4, 4, 4, 5, 6, 8, 8], [0, 2, 2, 3, 3, 4, 4, 6, 7], [0, 1, 2, 3, 4, 4, 5, 5, 5], [0, 3, 4, 5, 5, 6, 6, 7, 8], 4, 4, 3, 3);
const Missy     = new Character("Missy", "Dubourde",          [0, 3, 4, 5, 6, 6, 6, 7, 7], [0, 2, 3, 3, 3, 4, 5, 6, 7], [0, 2, 3, 4, 4, 5, 6, 6, 6], [0, 1, 2, 3, 4, 5, 5, 6, 7], 3, 4, 4, 3);

const Father    = new Character("Father", "Rhinehardt",       [0, 2, 3, 3, 4, 5, 6, 7, 7], [0, 1, 2, 2, 4, 4, 5, 5, 7], [0, 1, 3, 3, 4, 5, 6, 6, 8], [0, 3, 4, 5, 5, 6, 7, 7, 8], 3, 3, 4, 5);
const Professor = new Character("Professor", "Longfellow",    [0, 2, 2, 4, 4, 5, 5, 6, 6], [0, 1, 2, 3, 4, 5, 5, 6, 6], [0, 4, 5, 5, 5, 5, 6, 7, 8], [0, 1, 3, 3, 4, 5, 5, 6, 7], 4, 3, 5, 3);

///Rolls dice and returns the result
const rollDice = (numDice) => { 
  let total = 0;
  let die;
  let dice = [];
  for (i = 0; i < numDice; i++) {
    die = Math.floor(Math.random() * 3);
    dice.push(die);
    total += die;
  };
  renderDice(dice);
  return total;
};

//haunt roll function is called when player draws an omen card. Checks to see if haunt begins.
let omenCount = 0;
const hauntRoll = () => {
  omenCount++;
  if (rollDice(6) < omenCount) {
      haunt = true;
      return true;
  } else {
      return false;
  }
};


//series of functions to increase character stat if they end their turn in a certain room, once per game
const endTurnGymnasium = (character) => {
  if (!character.gymnasiumBonus) {
    character.gymnasiumBonus = true;
    character.speedUp();
    return true;
  } else {
    return false;
  }
};

const endTurnLarder = (character) => {
  if (!character.larderBonus) {
    character.larderBonus = true;
    character.mightUp();
    return true;
  } else {
    return false;
  }
};

const endTurnLibrary = (character) => {
  if (!character.libraryBonus) {
    character.libraryBonus = true;
    character.knowledgeUp();
    return true;
  } else {
    return false;
  }
};

const endTurnChapel = (character) => {
  if (!character.ChapelBonus) {
    character.ChapelBonus = true;
    character.sanityUp();
    return true;
  } else {
    return false;
  }
};



$(document).ready(() => {
///////////////////////////////////////////////////////////



  //load in stats
  for (i=1; i<9; i++) {
    $('#brandon .s' + i).text(Brandon.speedSlider[i]);
    $('#brandon .m' + i).text(Brandon.mightSlider[i]);
    $('#brandon .k' + i).text(Brandon.knowledgeSlider[i]);
    $('#brandon .w' + i).text(Brandon.sanitySlider[i]);

    $('#peter .s' + i).text(Peter.speedSlider[i]);
    $('#peter .m' + i).text(Peter.mightSlider[i]);
    $('#peter .k' + i).text(Peter.knowledgeSlider[i]);
    $('#peter .w' + i).text(Peter.sanitySlider[i]);

    $('#jenny .s' + i).text(Jenny.speedSlider[i]);
    $('#jenny .m' + i).text(Jenny.mightSlider[i]);
    $('#jenny .k' + i).text(Jenny.knowledgeSlider[i]);
    $('#jenny .w' + i).text(Jenny.sanitySlider[i]);

    $('#heather .s' + i).text(Heather.speedSlider[i]);
    $('#heather .m' + i).text(Heather.mightSlider[i]);
    $('#heather .k' + i).text(Heather.knowledgeSlider[i]);
    $('#heather .w' + i).text(Heather.sanitySlider[i]);

    $('#darrin .s' + i).text(Darrin.speedSlider[i]);
    $('#darrin .s' + i).text(Darrin.speedSlider[i]);
    $('#darrin .m' + i).text(Darrin.mightSlider[i]);
    $('#darrin .k' + i).text(Darrin.knowledgeSlider[i]);
    $('#darrin .w' + i).text(Darrin.sanitySlider[i]);

    $('#ox .s' + i).text(Ox.speedSlider[i]);
    $('#ox .m' + i).text(Ox.mightSlider[i]);
    $('#ox .k' + i).text(Ox.knowledgeSlider[i]);
    $('#ox .w' + i).text(Ox.sanitySlider[i]);

    $('#madame .s' + i).text(Madame.speedSlider[i]);
    $('#madame .m' + i).text(Madame.mightSlider[i]);
    $('#madame .k' + i).text(Madame.knowledgeSlider[i]);
    $('#madame .w' + i).text(Madame.sanitySlider[i]);

    $('#vivian .s' + i).text(Vivian.speedSlider[i]);
    $('#vivian .m' + i).text(Vivian.mightSlider[i]);
    $('#vivian .k' + i).text(Vivian.knowledgeSlider[i]);
    $('#vivian .w' + i).text(Vivian.sanitySlider[i]);

    $('#zoe .s' + i).text(Zoe.speedSlider[i]);
    $('#zoe .m' + i).text(Zoe.mightSlider[i]);
    $('#zoe .k' + i).text(Zoe.knowledgeSlider[i]);
    $('#zoe .w' + i).text(Zoe.sanitySlider[i]);

    $('#missy .s' + i).text(Missy.speedSlider[i]);
    $('#missy .m' + i).text(Missy.mightSlider[i]);
    $('#missy .k' + i).text(Missy.knowledgeSlider[i]);
    $('#missy .w' + i).text(Missy.sanitySlider[i]);

    $('#father .s' + i).text(Father.speedSlider[i]);
    $('#father .m' + i).text(Father.mightSlider[i]);
    $('#father .k' + i).text(Father.knowledgeSlider[i]);
    $('#father .w' + i).text(Father.sanitySlider[i]);

    $('#professor .s' + i).text(Professor.speedSlider[i]);
    $('#professor .m' + i).text(Professor.mightSlider[i]);
    $('#professor .k' + i).text(Professor.knowledgeSlider[i]);
    $('#professor .w' + i).text(Professor.sanitySlider[i]);
  };

  $('#brandon .s' + Brandon.speedIndex).addClass('stat-active');
  $('#brandon .m' + Brandon.mightIndex).addClass('stat-active');
  $('#brandon .k' + Brandon.knowledgeIndex).addClass('stat-active');
  $('#brandon .w' + Brandon.sanityIndex).addClass('stat-active');

  $('#peter .s' + Peter.speedIndex).addClass('stat-active');
  $('#peter .m' + Peter.mightIndex).addClass('stat-active');
  $('#peter .k' + Peter.knowledgeIndex).addClass('stat-active');
  $('#peter .w' + Peter.sanityIndex).addClass('stat-active');

  $('#jenny .s' + Jenny.speedIndex).addClass('stat-active');
  $('#jenny .k' + Jenny.knowledgeIndex).addClass('stat-active');
  $('#jenny .m' + Jenny.mightIndex).addClass('stat-active');
  $('#jenny .w' + Jenny.sanityIndex).addClass('stat-active');

  $('#heather .s' + Heather.speedIndex).addClass('stat-active');
  $('#heather .m' + Heather.mightIndex).addClass('stat-active');
  $('#heather .k' + Heather.knowledgeIndex).addClass('stat-active');
  $('#heather .w' + Heather.sanityIndex).addClass('stat-active');

  $('#darrin .s' + Darrin.speedIndex).addClass('stat-active');
  $('#darrin .m' + Darrin.mightIndex).addClass('stat-active');
  $('#darrin .k' + Darrin.knowledgeIndex).addClass('stat-active');
  $('#darrin .w' + Darrin.sanityIndex).addClass('stat-active');

  $('#ox .s' + Ox.speedIndex).addClass('stat-active');
  $('#ox .m' + Ox.mightIndex).addClass('stat-active');
  $('#ox .k' + Ox.knowledgeIndex).addClass('stat-active');
  $('#ox .w' + Ox.sanityIndex).addClass('stat-active');

  $('#madame .s' + Madame.speedIndex).addClass('stat-active');
  $('#madame .m' + Madame.mightIndex).addClass('stat-active');
  $('#madame .k' + Madame.knowledgeIndex).addClass('stat-active');
  $('#madame .w' + Madame.sanityIndex).addClass('stat-active');

  $('#vivian .s' + Vivian.speedIndex).addClass('stat-active');
  $('#vivian .m' + Vivian.mightIndex).addClass('stat-active');
  $('#vivian .k' + Vivian.knowledgeIndex).addClass('stat-active');
  $('#vivian .w' + Vivian.sanityIndex).addClass('stat-active');

  $('#zoe .s' + Zoe.speedIndex).addClass('stat-active');
  $('#zoe .m' + Zoe.mightIndex).addClass('stat-active');
  $('#zoe .k' + Zoe.knowledgeIndex).addClass('stat-active');
  $('#zoe .w' + Zoe.sanityIndex).addClass('stat-active');

  $('#missy .s' + Missy.speedIndex).addClass('stat-active');
  $('#missy .m' + Missy.mightIndex).addClass('stat-active');
  $('#missy .k' + Missy.knowledgeIndex).addClass('stat-active');
  $('#missy .w' + Missy.sanityIndex).addClass('stat-active');

  $('#father .s' + Father.speedIndex).addClass('stat-active');
  $('#father .m' + Father.mightIndex).addClass('stat-active');
  $('#father .k' + Father.knowledgeIndex).addClass('stat-active');
  $('#father .w' + Father.sanityIndex).addClass('stat-active');

  $('#professor .s' + Professor.speedIndex).addClass('stat-active');
  $('#professor .m' + Professor.mightIndex).addClass('stat-active');
  $('#professor .k' + Professor.knowledgeIndex).addClass('stat-active');
  $('#professor .w' + Professor.sanityIndex).addClass('stat-active');
////////////////////////////////////////////////////////////////  




////This function returns a corresponding characater class instance when a character card is clicked on.
////switch on--clicked button --> closest element up DOM tree with an id --> the id of that element
  const activeCharacter = () => {
    switch ($(event.currentTarget).closest('[id]').attr("id")) {
      case 'brandon': return Brandon;
      case 'peter': return Peter;
      case 'jenny': return Jenny;
      case 'heather': return Heather;
      case 'darrin': return Darrin;
      case 'ox': return Ox;
      case 'madame': return Madame;
      case 'vivian': return Vivian;
      case 'zoe': return Zoe;
      case 'missy': return Missy;
      case 'father': return Father;
      case 'professor': return Professor;
      default: return;
    };
  }


// Stat rolls for any character. Click the stat roll button, then the result next to it
// is set to the speed roll of the character that you clicked on.
  $('.s.roll-button').on('click', (event) => {
    $(event.currentTarget).siblings('.s.result').text('');
    $(event.currentTarget).siblings('.m.result').text('');
    $(event.currentTarget).siblings('.k.result').text('');
    $(event.currentTarget).siblings('.w.result').text('');
    $(event.currentTarget).siblings('.s.result').text(activeCharacter().speedRoll());
    $(event.currentTarget).siblings('.s.result').hide();  
    $(event.currentTarget).siblings('.s.result').slideDown(500);    
  });

  $('.m.roll-button').on('click', (event) => {
    $(event.currentTarget).siblings('.s.result').text('');
    $(event.currentTarget).siblings('.m.result').text('');
    $(event.currentTarget).siblings('.k.result').text('');
    $(event.currentTarget).siblings('.w.result').text('');
    $(event.currentTarget).siblings('.m.result').text(activeCharacter().mightRoll());  
    $(event.currentTarget).siblings('.m.result').hide();   
    $(event.currentTarget).siblings('.m.result').slideDown(500); 
  });

  $('.k.roll-button').on('click', (event) => {
    $(event.currentTarget).siblings('.s.result').text('');
    $(event.currentTarget).siblings('.m.result').text('');
    $(event.currentTarget).siblings('.k.result').text('');
    $(event.currentTarget).siblings('.w.result').text('');
    $(event.currentTarget).siblings('.k.result').text(activeCharacter().knowledgeRoll());  
    $(event.currentTarget).siblings('.k.result').hide();    
    $(event.currentTarget).siblings('.k.result').slideDown(500);
  });

  $('.w.roll-button').on('click', (event) => {
    $(event.currentTarget).siblings('.s.result').text('');
    $(event.currentTarget).siblings('.m.result').text('');
    $(event.currentTarget).siblings('.k.result').text('');
    $(event.currentTarget).siblings('.w.result').text('');
    $(event.currentTarget).siblings('.w.result').text(activeCharacter().sanityRoll());   
    $(event.currentTarget).siblings('.w.result').hide();   
    $(event.currentTarget).siblings('.w.result').slideDown(500);
  });

  //Four functions for trait up
  $('.s.plus').on('click', (event) => {
    $(event.currentTarget).siblings('.s' + activeCharacter().speedIndex).removeClass('stat-active');
    activeCharacter().speedUp();
    $(event.currentTarget).siblings('.s' + activeCharacter().speedIndex).addClass('stat-active');
  });

  $('.m.plus').on('click', (event) => {
    $(event.currentTarget).siblings('.m' + activeCharacter().mightIndex).removeClass('stat-active');
    activeCharacter().mightUp();
    $(event.currentTarget).siblings('.m' + activeCharacter().mightIndex).addClass('stat-active');
  });

  $('.k.plus').on('click', (event) => {
    $(event.currentTarget).siblings('.k' + activeCharacter().knowledgeIndex).removeClass('stat-active');
    activeCharacter().knowledgeUp();
    $(event.currentTarget).siblings('.k' + activeCharacter().knowledgeIndex).addClass('stat-active');
  });

  $('.w.plus').on('click', (event) => {
    $(event.currentTarget).siblings('.w' + activeCharacter().sanityIndex).removeClass('stat-active');
    activeCharacter().sanityUp();
    $(event.currentTarget).siblings('.w' + activeCharacter().sanityIndex).addClass('stat-active');
  });

  //Four functions for trait down
  $('.s.minus').on('click', (event) => {
    $(event.currentTarget).siblings('.s' + activeCharacter().speedIndex).removeClass('stat-active');
    activeCharacter().speedDown();
    $(event.currentTarget).siblings('.s' + activeCharacter().speedIndex).addClass('stat-active');
  });

  $('.m.minus').on('click', (event) => {
    $(event.currentTarget).siblings('.m' + activeCharacter().mightIndex).removeClass('stat-active');
    activeCharacter().mightDown();
    $(event.currentTarget).siblings('.m' + activeCharacter().mightIndex).addClass('stat-active');
  });

  $('.k.minus').on('click', (event) => {
    $(event.currentTarget).siblings('.k' + activeCharacter().knowledgeIndex).removeClass('stat-active');
    activeCharacter().knowledgeDown();
    $(event.currentTarget).siblings('.k' + activeCharacter().knowledgeIndex).addClass('stat-active');
  });

  $('.w.minus').on('click', (event) => {
    $(event.currentTarget).siblings('.w' + activeCharacter().sanityIndex).removeClass('stat-active');
    activeCharacter().sanityDown();
    $(event.currentTarget).siblings('.w' + activeCharacter().sanityIndex).addClass('stat-active');
  });

//end character functions

//sidebar functions
  $('#toggle-characters').on('click', (event) => {
    $('.character-list').slideToggle();
  });

  $('.toggle-brandon').on('click', (event) => {
    $('#brandon').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-peter').on('click', (event) => {
    $('#peter').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-jenny').on('click', (event) => {
    $('#jenny').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-heather').on('click', (event) => {
    $('#heather').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-darrin').on('click', (event) => {
    $('#darrin').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-ox').on('click', (event) => {
    $('#ox').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-madame').on('click', (event) => {
    $('#madame').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-vivian').on('click', (event) => {
    $('#vivian').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-zoe').on('click', (event) => {
    $('#zoe').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-missy').on('click', (event) => {
    $('#missy').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-father').on('click', (event) => {
    $('#father').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

  $('.toggle-professor').on('click', (event) => {
    $('#professor').toggle();
    $(event.currentTarget).toggleClass('sidebar-active');
  });

//sidebar dice rolls
  $('#roll-dice').on('click', (event) => {
    $('.num-dice, #roll-dice-result').slideToggle();
  });

  $('#1-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(1));
    $('#roll-dice-result').slideDown(500);
  });

  $('#2-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(2));
    $('#roll-dice-result').slideDown(500);
  });

  $('#3-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(3));
    $('#roll-dice-result').slideDown(500);
  });

  $('#3-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(3));
    $('#roll-dice-result').slideDown(500);
  });

  $('#4-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(4));
    $('#roll-dice-result').slideDown(500);
  });

  $('#5-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(5));
    $('#roll-dice-result').slideDown(500);
  });

  $('#6-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(6));
    $('#roll-dice-result').slideDown(500);
  });

  $('#7-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(7));
    $('#roll-dice-result').slideDown(500);
  });

  $('#8-die').on('click', () => {
    $('#roll-dice-result').hide();
    $('#roll-dice-result').text(rollDice(8));
    $('#roll-dice-result').slideDown(500);
  });

///haunt roll click
  $('#haunt-text').on('click', () => {

    if (!haunt) {
      if (hauntRoll()) {
      $('#haunt-text').parent().removeClass('pre-haunt').addClass('post-haunt');//remove pre-haunt class from parent div and add post-haunt class
      $('#haunt-text').text("Haunt has begun");//change text of #haunt-text to indicate haunt has begun
      }
    }
    $('#omen-count').text(omenCount);
  });

//room bonus bonus click
  $('.bonus-button.speed').on('click', (event) => {
    $(event.currentTarget).siblings('.s' + activeCharacter().speedIndex).removeClass('stat-active');
    endTurnGymnasium(activeCharacter());
    $(event.currentTarget).siblings('.s' + activeCharacter().speedIndex).addClass('stat-active');
    $(event.currentTarget).addClass('bonus-button-active');
  });

  $('.bonus-button.might').on('click', (event) => {
    $(event.currentTarget).siblings('.m' + activeCharacter().mightIndex).removeClass('stat-active');
    endTurnLarder(activeCharacter());
    $(event.currentTarget).siblings('.m' + activeCharacter().mightIndex).addClass('stat-active');
    $(event.currentTarget).addClass('bonus-button-active');
  });

  $('.bonus-button.knowledge').on('click', (event) => {
    $(event.currentTarget).siblings('.k' + activeCharacter().knowledgeIndex).removeClass('stat-active');
    endTurnLibrary(activeCharacter());
    $(event.currentTarget).siblings('.k' + activeCharacter().knowledgeIndex).addClass('stat-active');
    $(event.currentTarget).addClass('bonus-button-active');
  });

  $('.bonus-button.sanity').on('click', (event) => {
    $(event.currentTarget).siblings('.w' + activeCharacter().sanityIndex).removeClass('stat-active');
    endTurnChapel(activeCharacter());
    $(event.currentTarget).siblings('.w' + activeCharacter().sanityIndex).addClass('stat-active');
    $(event.currentTarget).addClass('bonus-button-active');
  });



});


