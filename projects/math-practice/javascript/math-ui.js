
class MathProblem {
    constructor(numArgs) {
        this.numArgs = numArgs;
        this.solved = false;
    }

    generateArg = function(maxDigits, decimalPlaces) {
        /*
        maxDigits : positive integer
        decimalPlaces : integer >= 0 and <= maxDigits
        Randomly generate an argument to use in a mathProblem
        */
        return parseFloat((Math.random() * (10 ** (maxDigits - decimalPlaces))).toFixed(decimalPlaces));
    }

    generateArgs = function(numArgs, maxDigits, decimalPlaces) {
        /*
        numArgs = positive integer >= 2
        maxDigits : positive integer
        decimalPlaces : integer >= 0 and <= maxDigits
        Return a list of numArgs arguments generated using generateArg()
        */
        let args = [];
        for (let i=0; i<numArgs; i++) args.push(this.generateArg(maxDigits, decimalPlaces));
        return args;
    }

    evaluateTrialAnswer = function() {
        this.solved = parseFloat(this.correctAnswer).toFixed(this.decimalPlace) == parseFloat(this.trialAnswer).toFixed(this.decimalPlace) ? true : false;
        console.log(`comparing ${this.trialAnswer} against ${this.correctAnswer}`);
        return this.solved;
    }

    setTrialAnswer = function(trialAnswer) {
        /*
        trialAnswer : float
        */
        this.trialAnswer = trialAnswer;
        return;
    }
}

class AddProblem extends MathProblem {
    /*
    numArgs : positive integer
    maxDigits: positive integer
    decimalPlaces: integer >=0, <= maxDigits
    */

    calculateCorrectAnswer = function() {
        return this.args.reduce((a,b) => a+b).toFixed(this.decimalPlaces);
    }

    constructor(numArgs=2, maxDigits=2, decimalPlaces=0) {
        super(numArgs);
        this.maxDigits = maxDigits;
        this.decimalPlaces = decimalPlaces;
        this.args = this.generateArgs(numArgs, maxDigits, decimalPlaces);
        this.correctAnswer = this.calculateCorrectAnswer(this.args);
        this.trialAnswer = undefined;
    }
}

class SubProblem extends MathProblem {
    /*
    numArgs : positive integer
    maxDigits: positive integer
    decimalPlaces: integer >=0, <= maxDigits
    */

    calculateCorrectAnswer = function() {
        return this.args.reduce((a,b) => a-b).toFixed(this.decimalPlaces);
    }

    constructor(numArgs=2, maxDigits=2, decimalPlaces=0) {
        super(numArgs);
        this.maxDigits = maxDigits;
        this.decimalPlaces = decimalPlaces;
        this.args = this.generateArgs(numArgs, maxDigits, decimalPlaces);
        this.correctAnswer = this.calculateCorrectAnswer(this.args);
        this.trialAnswer = undefined;
    }
}

class MultProblem extends MathProblem {
    /*
    numArgs : positive integer
    maxDigits: positive integers
    decimalPlaces: integer >=0, <= maxDigits
    */

    calculateCorrectAnswer = function() {
        return this.args.reduce((a,b) => a*b).toFixed(this.decimalPlaces);
    }

    constructor(numArgs=2, maxDigits=2, decimalPlaces=0) {
        super(numArgs);
        this.maxDigits = maxDigits;
        this.decimalPlaces = decimalPlaces;
        this.args = this.generateArgs(numArgs, maxDigits, decimalPlaces);
        this.correctAnswer = this.calculateCorrectAnswer(this.args);
        this.trialAnswer = undefined;
    }
}

class DivProblem extends MathProblem {
    /*
    numArgs : positive integer
    maxDigits: positive integers
    decimalPlaces: integer >=0, <= maxDigits
    */

    calculateCorrectAnswer = function() {
        return this.args.reduce((a,b) => a/b).toFixed(this.decimalPlaces);
    }

    constructor(numArgs=2, maxDigits=2, decimalPlaces=0) {
        super(numArgs);
        this.maxDigits = maxDigits;
        this.decimalPlaces = decimalPlaces;
        this.args = this.generateArgs(numArgs, maxDigits, decimalPlaces);
        this.correctAnswer = this.calculateCorrectAnswer(this.args);
        this.trialAnswer = undefined;
    }
}

class ProblemSet {
    /*
    ProblemSet is an object containing a list of MathProblems to be worked on simultaneously
    numArgs : positive integer
    maxDigits: positive integer
    decimalPlaces: integer >=0, <= maxDigits
    numProblems: integer > 0
    problemType: string, must be in ["addition", "subtraction", "multiplication", "division"]
    */
    constructor(numArgs=2, maxDigits=2, decimalPlaces=0, numProblems=1, problemType="addition") {
        this.problems = [];
        switch (problemType) {
            case "addition":
                for (let i=0; i<numProblems; i++) this.problems.push(new AddProblem(numArgs, maxDigits, decimalPlaces));
                break;
            case "subtraction":
                for (let i=0; i<numProblems; i++) this.problems.push(new SubProblem(numArgs, maxDigits, decimalPlaces));
                break;
            case "multiplication":
                for (let i=0; i<numProblems; i++) this.problems.push(new MultProblem(numArgs, maxDigits, decimalPlaces));
                break;
            case "division":
                for (let i=0; i<numProblems; i++) this.problems.push(new DivProblem(numArgs, maxDigits, decimalPlaces));
                break;
            default:
                break;
        }
    }

    displayProblems = function() {
        /*
        Displays arguments and correct answers to the console.
        Only anticipated use for debugging
        */
        for (let i=0; i<this.problems.length; i++) {
            console.log(this.problems[i].args, this.problems[i].correctAnswer);
        }
    }

    displayTrialAnswers = function() {
        /*
        Displays submitted trialAnswers to the console.
        Only anticipated use for debugging
        */
        let answers = [];
        for (let i=0; i<this.problems.length; i++) {
            answers.push(this.problems[i].trialAnswer);
        }
        console.log(answers);
        return;
    }

    displayCorrectAnswers = function() {
        /*
        Displays correctAnswers to the console.
        Only anticipated use for debugging
        */
        let answers = [];
        for (let i=0; i<this.problems.length; i++) {
            answers.push(this.problems[i].correctAnswer);
        }
        console.log(answers);
        return;
    }

    displaySolved = function() {
        /*
        Displays status of solved for each problem in problemSet
        Only anticipated use for debugging
        */
       let solvedList = [];
       for (let i=0; i<this.problems.length; i++) {
           solvedList.push(this.problems[i].solved);
       }
       console.log(solvedList);
       return;
    }

    submitTrialAnswers = function(trialAnswers) {
        /*
        trialAnswers : list of length == this.problems.length
        Sets trial answers for each problem in problemSet
        */
        for (let i=0; i<trialAnswers.length; i++) {
            this.problems[i].setTrialAnswer(trialAnswers[i]);
        }
    }

    gradeProblemSet = function() {
        /*
        Evaluates the trialAnswer for each problem in the problemSet.
        Calculates this.score as sum of correct answers / number of problems
        */
        let correctCount = 0;
        for (let i=0; i<this.problems.length; i++) {
            this.problems[i].evaluateTrialAnswer();
            if (this.problems[i].solved == true) correctCount++;
        }
        this.grade = (100 * correctCount / this.problems.length).toFixed(2);
    }
}

function getRadioValue() {
    /*
    reads radio button. Defaults to addition
    */
    let element = document.getElementsByName('problem-type');
    for(let i=0; i<element.length; i++) {
        if (element[i].checked) {
            return element[i].value;
        }
    }
    return 'addition';
}

class MathPracticeApp extends React.Component {
    /*
    Parent component for Math Practice App
    */
    constructor(props) {
        super(props);
        this.state = {
            started : false,
            graded : false, 
            numProblems : 1,
            numArgs : 2,
            problemType : 'addition',
            maxDigits : 1,
            decimalPlace : 0
        };
        this.handleGenerateProblems = this.handleGenerateProblems.bind(this);
        this.handleSubmitAnswers = this.handleSubmitAnswers.bind(this);
        this.handleStartOver = this.handleStartOver.bind(this);
        this.handleMaxDigits = this.handleMaxDigits.bind(this);
        this.handleDecimalPlaces = this.handleDecimalPlaces.bind(this);
        this.handleNumArgs = this.handleNumArgs.bind(this);
        this.handleNumProblems = this.handleNumProblems.bind(this);
        this.validateConfigInput = this.validateConfigInput.bind(this);
        //create a reference to Problems element so I can call Problem.showAnswer from the parent element
        this.problemElement = React.createRef();
    }

    handleGenerateProblems() {
        /*
        Causes problems to render. 
        When started is set to true, problems are generated in the render method based on config values input by user
        */
        this.setState((state) => ({
            started : true,
            graded : false,
            numProblems : state.numProblems,
            numArgs : state.numArgs,
            problemType : getRadioValue(),
            maxDigits : state.maxDigits,
            decimalPlaces : state.decimalPlaces
        }));
    }

    handleSubmitAnswers() {
        /*
        Calls the showAnswer function from the child Problem and renders the answer.
        Also sets MathPracticeApp.graded to true, causing start over button to render
        */
        this.setState((state) => ({
            started : true,
            graded : true,
            numProblems : state.numProblems,
            numArgs : state.numArgs,
            problemType : state.problemType,
            maxDigits : state.maxDigits,
            decimalPlaces : state.decimalPlaces
        }));
        this.problemElement.current.showAnswer();
    }

    handleStartOver() {
        /*
        Resets MathPracticeApp state to default values, restarting the app
        */
       Array.from(document.querySelectorAll("input")).forEach(input => (input.value = ""));
       this.setState((state) => ({
            started : false,
            graded : false,
            numProblems : state.numProblems,
            numArgs : 2,
            problemType : undefined,
            maxDigits : undefined,
            decimalPlaces : 0
       }));
    }

    handleMaxDigits(event) {
        /*
        Continuously updated max digits in state.
        Enforces integer >= 1
        */
       event.target.value = this.validateConfigInput(event.target.value, 1);
       this.setState(state => ({
            started : state.started,
            graded : state.graded,
            numProblems : state.numProblems,
            numArgs : state.numArgs,
            problemType : state.problemType,
            maxDigits : event.target.value,
            decimalPlaces : state.decimalPlaces
        }));      
    }

    handleDecimalPlaces(event) {
        /*
        Continuously updated decimalPlaces in state.
        Enforces integer >= 0
        */
       event.target.value = this.validateConfigInput(event.target.value, 0);
       this.setState(state => ({
            started : state.started,
            graded : state.graded,
            numProblems : state.numProblems,
            numArgs : state.numArgs,
            problemType : state.problemType,
            maxDigits : state.maxDigits,
            decimalPlaces : event.target.value
        }));      
    }

    handleNumArgs(event) {
        /*
        Continuously updates numArgs in state.
        Enforces integer >= 2
        */
       event.target.value = this.validateConfigInput(event.target.value, 2);
       this.setState(state => ({
            started : state.started,
            graded : state.graded,
            numProblems : state.numProblems,
            numArgs : event.target.value,
            problemType : state.problemType,
            maxDigits : state.maxDigits,
            decimalPlaces : state.decimalPlaces
        }));      
    }

    handleNumProblems(event) {
        /*
        Continuously updates numProblems in state.
        Enforces integer >= 1
        */
       event.target.value = this.validateConfigInput(event.target.value, 1);
       this.setState(state => ({
            started : state.started,
            graded : state.graded,
            numProblems : event.target.value,
            numArgs : state.numArgs,
            problemType : state.problemType,
            maxDigits : state.maxDigits,
            decimalPlaces : state.decimalPlaces
        }));      
    }

    validateConfigInput(newInput, minValue) {
        /*
        Ensures typed in inputs for config are integers.
        Pass in a valid input that has been modified.
        If a non integer is passed in, clean input to be int
        Makes sure return value >= minValue
        */

        //Removes non-numeric characters from string
        console.log("validating an input");
        let validatedInput = newInput.replace(/[^0-9]/g, '');
        return (validatedInput <= minValue) ? minValue : validatedInput;

    }

    render() {
        return (
            <div id='math-practice-app'>
                <h1 id='title'>Welcome to my math practice app!</h1>
                <p>In order to be marked correct, answers must be given with the same number of decimal places as given in the decimal places input. If an answer is less than 1, input a 0 before the decimal point.</p>
                <p>Some examples:</p>
                <p className="example">5.5 + 3.5 = 9.0, not 9</p>
                <p className="example">4.0 - 1.0 = 3.0, not 3</p>
                <p className="example">5.0 - 4.8 = 0.2, not .2</p>
                <p className="example">10 / 9 = 1, not 1.11</p>
                <p className="example"></p>
                <p id='select-problem-type'>Choose a problem type:</p>
                <form>
                    {/*Radio buttons for problem type selection */}
                    <input type='radio' id='add-radio-button' name='problem-type' value='addition'></input>
                    <label for='addition'>addition</label>
                    <input type='radio' id='sub-radio-button' name='problem-type' value='subtraction'></input>
                    <label for='subtraction'>subtraction</label>
                    <input type='radio' id='mult-radio-button' name='problem-type' value='multiplication'></input>
                    <label for='multiplication'>multiplication</label>
                    <input type='radio' id='div-radio-button' name='problem-type' value='division'></input>
                    <label for='division'>division</label>

                    {/* Input fields for numArg, maxDigits, decimalPlaces, and numProblems */}
                    <input id='num-args' placeholder='num args: min 2' onChange={this.handleNumArgs}></input>
                    <input id='max-digits' placeholder='max digits: min 1' onChange={this.handleMaxDigits}></input>
                    <input id='decimal-places' placeholder='decimal places: min 0' onChange={this.handleDecimalPlaces}></input>
                    <input id='num-problems' placeholder='Number of questions: min 1' onChange={this.handleNumProblems}></input>
                </form>
                
                {/* render Start Practicing! button if practice hasn't started yet */}                  
                {this.state.started==false && <button class='btn btn-primary' id='generate-problems' onClick={this.handleGenerateProblems}>Start practicing!</button>}
                    
                {/* Render problems after clicking Start Practicing! */}
                {this.state.started && 
                <div>
                    <Problems ref={this.problemElement} problemType={this.state.problemType}
                                                        numProblems={this.state.numProblems} 
                                                        numArgs={this.state.numArgs}
                                                        maxDigits={this.state.maxDigits}
                                                        decimalPlaces={this.state.decimalPlaces}/>
                </div>}

                {/* Render Submit answers after clicking Start Practicing! and remove after clicking submit */}
                {this.state.started && !this.state.graded &&
                    <button class='btn btn-primary' id='submit-answers' onClick={this.handleSubmitAnswers}>submit answers</button>
                }

                {/* Render start over button after clicking submit answers */}
                {this.state.graded &&
                <div>
                    <span class='btn btn-primary' id='start-over' onClick={this.handleStartOver}>start over</span>    
                </div>}
                
            </div>
        );
    }
}

class Problems extends React.Component {
    /*
    Contains dynamic number and state of problems, and input answers
    */
    constructor(props) {
        super(props);
        let initializedSubmittedAnswers = {};
        for (let i=0; i<props.numProblems; i++) {
            initializedSubmittedAnswers[`input${i}`] = '';
        }
        this.state = {
            graded : false,
            submittedAnswers : initializedSubmittedAnswers
        };

        //Initialize a new ProblemSet object using input parameters
        this.problemSet = new ProblemSet(props.numArgs,props.maxDigits,props.decimalPlaces,props.numProblems,props.problemType);
        this.correctAnswers = this.problemSet.problems.map(problem => problem.correctAnswer);

        //this.operator will be used to render the problem statement in a readable way
        switch(props.problemType) {
            case 'addition':
                this.operator = ' + ';
                break;
            case 'subtraction':
                this.operator = ' - ';
                break;
            case 'multiplication':
                this.operator = ' x ';
                break;
            case 'division':
                this.operator = ' / ';
                break;
            default:
                break;
        }

        this.showAnswer = this.showAnswer.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validateAnswer = this.validateAnswer.bind(this);

    }

    validateAnswer(previousAnswer, newAnswer) {
        /*
        Ensures typed in answers are numeric.
        Pass in a valid input that has been modified.
        If a non-number or a second decimal point is input, 
        slice that off and return the remaining string
        */
        if (this.state.graded) return previousAnswer;

        let unchanged = previousAnswer;
        if (unchanged == undefined) unchanged = '';

        //valid numeric format
        let validAnswerFormat = /^[-]?[0-9]*.?[0-9]*$/;

        //If the user added a second period, don't
        if (newAnswer.match(/[\.][^.]*[\.]/)) return unchanged;

        //If the user added a - where they shouldn't have, don't
        if (newAnswer.match(/[^-]+[-]/)) return unchanged;

        //Removes non-numeric characters from string
        let validatedInput = newAnswer.replace(/[^0-9.-]/g, '');

        //Added this because somehow it still lets through '--' at beginning
        validatedInput = validatedInput.replace(/--/, '-');
        
        return validatedInput.match(validAnswerFormat) ? validatedInput : unchanged;

    }

    showAnswer() {
        /*
        Sets this.graded to true, which triggers rendering of the correct answer
        */
        this.problemSet.submitTrialAnswers(Object.values(this.state.submittedAnswers));
        this.problemSet.gradeProblemSet();
        this.setState((state) => ({
            graded : true,
            grade : this.problemSet.grade,
            submittedAnswers : state.submittedAnswers
        }));
    }

    handleChange(event) {
        /*
        Continuously updates submitted answer as it is typed in
        */
       let newSubmittedAnswers = this.state.submittedAnswers;
       event.target.value = this.validateAnswer(this.state.submittedAnswers[event.target.name], event.target.value);
       newSubmittedAnswers[event.target.name] = event.target.value;
       this.setState(state => ({
            graded : state.graded,
            submittedAnswers : newSubmittedAnswers
       }));
    }



    render() {
        /*
        Renders all problems and answer input fields. Submit button is handled by MathPracticeApp
        */
        let problemRenders = this.problemSet.problems.map((problem, index) => (
            <div className='row problem'>
                <div className='col-xs-4'>
                    <span>{problem.args.join(this.operator).concat(' = ')}</span>
                </div>
                <div className='col-xs-4'>
                    <input className='answer-input' key={`input${index}`} name={`input${index}`} onChange={this.handleChange}></input>
                </div>
                <div className='col-xs-4'>
                    {this.state.submittedAnswers[`input${index}`] == problem.correctAnswer && this.state.graded && <span class='correct'>Correct!</span>}
                    {this.state.submittedAnswers[`input${index}`] != problem.correctAnswer && this.state.graded && <span class='incorrect'>incorrect</span>}
                </div>
            </div>

        ));
        return (
            <div>
                {/*
                Cheaters may uncomment these lines to view the correct answers.               
                <p>{this.state.numProblems} problems</p>
                <p>correct answers: {this.correctAnswers.join(', ')}</p>
                */}
                
                <div>{problemRenders}</div>
                {this.state.graded && <p id='grade'>Grade: {this.state.grade}%</p>}
            </div>
        )
    }
}





ReactDOM.render(<MathPracticeApp/>, document.getElementById('math-app'));

