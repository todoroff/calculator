import * as lib from "./lib.js";
import Big from "./big.js";

const operations = {
    '+': lib.add,
    '-': lib.sutbract,
    '×': lib.multiply,
    '÷': lib.divide
}

const operate = (match, a, operation, b) => {
    if (operation === '÷' && Number(b) === 0)
        return 'Zero division.'

    const result = Big(operations[operation](Number(a), Number(b))).toFixed();

    // if multiplying or dividing 2 negative numbers, add a plus sign in front of the result
    // otherwise return the result
    return ((operation === '÷' || operation === '×') && (Number(a) < 0 && Number(b) < 0) ?
        "+" + result :
        result);
}

const evaluate = (expression) => {
    let steps = 0;

    function crunch(expression) {
        steps++;
        let result = expression;
        const bigNum = /(\d+\.)*\d*e\+\d+/g;

        //in case of too many recursive calls
        if (steps > 500) {
            return 'Out of memory.';
        }

        //if in exponential form, convert to decimal so it doesn't break our functions
        if (bigNum.test(result)) {
            let normalize = Big(result.match(bigNum)[0]).toFixed();
            result = result.replace(bigNum, normalize);
            return crunch(result);
        }
        if (/zero/i.test(result)) {
            return 'Zero divison.';
        }
        //remove + if it's the first character in a result
        if (/^\+/.test(result)) {
            result = result.replace("+", "");
            return crunch(result);
        }
        //if only a single number left return the final result
        if (/^([\+\-]?(?:\d+[.])?\d+)$/.test(result)) {
            if (result.length > 17 && (Number.isInteger(Number(result))))
                return Big(result).toExponential();
            if (result.length > 17 && (!Number.isInteger(Number(result))))
                return Big(result).toFixed(10);
            return result;
        }
        //deal with multiplication and division first
        else if (/[\÷\×]/.test(result)) {
            result = result.replace(/(-?(?:\d+[.])?\d+)([\÷\×])(-?(?:\d+[.])?\d+)/g, operate);
            return crunch(result);
        }
        //next add and substract
        else if (/[\+\-]/.test(result)) {
            result = result.replace(/(-?(?:\d+[.])?\d+)([\+\-])(-?(?:\d+[.])?\d+)/g, operate);
            return crunch(result);
        }
    }

    return crunch(expression);
}

const buildExpression = (expression, symbol) => {
    let built = expression;
    if (built === "0" && !/[\÷\×\+\-\.]/.test(symbol)) {
        built = symbol;
    } else {
        built += symbol;
    }
    return built;
}

const del = (expression) => {
    let expr = expression.slice(0, -1);
    if (expr.length === 0)
        expr = "0";
    return expr;
}
const signChg = (expression) => {
    //split operators and operands
    let newExp = expression.split(/([\÷\×\+\-])/);

    switch (true) {
        //if single negative number, remove negative sign
        case (newExp[0] === "" && newExp[1] === "-" && newExp.length === 3):
            newExp.splice(1, 1, "");
            break;
        //if single positive number, add negative sign
        case (newExp.length === 1):
            newExp.splice(0, 0, "-");
            break;
        //if - before the last number, change to +
        case (newExp.slice(-2, -1)[0] === "-"):
            newExp.splice(-2, 1, "+");
            break;
        //if + before the last number, change to -   
        case (newExp.slice(-2, -1)[0] === "+"):
            newExp.splice(-2, 1, "-");
            break;
        // if ÷ or × before the last number and it's positive, append 
        // negative sign before the operator
        case ((newExp.slice(-2, -1)[0] === "×") || (newExp.slice(-2, -1)[0] === "÷")):
            newExp.splice(-1, 0, "-");
            break;
    }
    //join and remove + that are directly after ÷ or ×
    newExp = newExp.join("").replace(/([÷×])(\+)/, '$1');
    return newExp;

}

let lastInput = "";
let expr = "0";
const display = document.querySelector("#display");
display.innerText = expr;
const buttons = document.querySelector("#buttons");
const delButton = buttons[1];

buttons.addEventListener("click", (el) => {
    if (el.target.tagName !== 'BUTTON')
        return;
    if (/(zero)|(memory)/i.test(expr))
        resetExpr();
    if (!el.target.className.includes("nonexpr")) {
        if (el.target.className.includes("number") && lastInput === "=") {
            resetExpr();
        }
        //make sure operators are not repeated or stacked
        if (el.target.className.includes("operator")) {
            if (el.target.innerText === lastInput)
                return;
            if (el.target.innerText !== lastInput && /[\÷\×\+\-]$/.test(lastInput)
                && el.target.id !== "point") {
                delButton.click();
                //if × or ÷ operator is pressed directly after negative sign change, 
                //which is preceded by another × or ÷ operator
                if (/[\÷\×]$/.test(lastInput) && el.target.id !== "point") {
                    delButton.click();
                }
            }
            //remove floating point if it's immediately followed by an operator
            if (el.target.innerText !== lastInput && lastInput === ".") {
                delButton.click();
            }
        }
        if (el.target.id == "point") {
            //disable multiple decimal points in one number
            if (/(\.\d+)$/.test(expr))
                return;
            //append 0 before . if the previous input is not a digit
            if (/[\÷\×\+\-]$/.test(lastInput)) {
                expr = buildExpression(expr, "0" + el.target.innerText);
                display.innerText = expr;
                lastInput = el.target.innerText;
                return;
            }
        }

        expr = buildExpression(expr, el.target.innerText);
        display.innerText = expr;
        lastInput = el.target.innerText;
    }
    else {
        switch (el.target.id) {
            case "equals":
                //remove floating point or operator if it's immediately followed by =
                if (/[\.\+\-\×\÷]/.test(lastInput)) {
                    delButton.click();
                }
                expr = evaluate(expr);
                display.innerText = expr;
                lastInput = "=";
                break;
            case "del":
                expr = del(expr);
                display.innerText = expr;
                lastInput = expr.slice(-1);
                break;
            case "clear":
                resetExpr();
                break;
            case "signChg":
                expr = signChg(expr);
                display.innerText = expr;
                break;
        }

    }
});


const resetExpr = () => {
    expr = "0";
    display.innerText = expr;
    lastInput = "0";
}