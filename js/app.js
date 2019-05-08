import * as lib from "./lib.js";
import Big from "./big.js";

const operate = (match, a, operation, b) => {
    if (operation === '÷' && Number(b) === 0)
        return 'Zero division.'
    if ((operation === '÷' || operation === '×') && Number(a) < 0 && Number(b) < 0)
        return "+" + Big(operations[operation](Number(a), Number(b))).toFixed();
    return Big(operations[operation](Number(a), Number(b))).toFixed();
}

const evaluate = (expression) => {
    steps++;
    let result = expression;
    const bigNum = /(\d+\.)*\d*e\+\d+/g;

    if (steps > 500) {
        steps = 0;
        return 'Out of memory.';
    }
    //if in exponential form, convert to decimal so it doesn't break our functions
    if (bigNum.test(result)) {
        let normalize = Big(result.match(bigNum)[0]).toFixed();
        result = result.replace(bigNum, normalize);
        return evaluate(result);
    }
    if (/zero/i.test(result)) {
        steps = 0;
        return 'Zero divison.';
    }
    //remove + if it's the first character
    if (/^\+/.test(result)) {
        result = result.replace("+", "");
        return evaluate(result);
    }
    //if only one number left return the result
    if (/^([\+\-]?(?:\d+[.])?\d+)$/.test(result)) {
        if (result.length > 17 && (Number.isInteger(Number(result))))
            return Big(result).toExponential();
        if (result.length > 17 && (!Number.isInteger(Number(result))))
            return Big(result).toFixed(10);
        steps = 0;
        return result;
    }
    //deal with multiplication and division first
    else if (/[\÷\×]/.test(result)) {
        result = result.replace(/(-?(?:\d+[.])?\d+)([\÷\×])(-?(?:\d+[.])?\d+)/g, operate);
        return evaluate(result);
    }
    //next add and substract
    else if (/[\+\-]/.test(result)) {
        result = result.replace(/(-?(?:\d+[.])?\d+)([\+\-])(-?(?:\d+[.])?\d+)/g, operate);
        return evaluate(result);
    }
    steps = 0;
    return result;
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
        expr = 0;
    return expr;
}
const signChg = (expression) => {
    let newExp = expression.split(/([\÷\×\+\-])/);

    switch (true) {
        //if single negative number
        case (newExp[0] === "" && newExp[1] === "-" && newExp.length === 3):
            newExp.splice(1, 1, "");
            break;
        //if single positive number
        case (newExp.length === 1):
            newExp.splice(0, 0, "-");
            break;
        //if - before the last number
        case (newExp.slice(-2, -1)[0] === "-"):
            newExp.splice(-2, 1, "+");
            break;
        //if + before the last number    
        case (newExp.slice(-2, -1)[0] === "+"):
            newExp.splice(-2, 1, "-");
            break;
        //if ÷ or × before the last number and it's positive
        case ((newExp.slice(-2, -1)[0] === "×") || (newExp.slice(-2, -1)[0] === "÷")):
            newExp.splice(-1, 0, "-");
            break;
    }
    //join and remove + that's directly after ÷ or ×
    newExp = newExp.join("").replace(/([÷×])(\+)/, '$1');
    return newExp;

}

const operations = {
    '+': lib.add,
    '-': lib.sutbract,
    '×': lib.multiply,
    '÷': lib.divide
}

let steps = 0;
let lastInput = "";
const display = document.querySelector("#display");
display.innerText = "0";
const buttons = document.querySelectorAll("button");
const delButton = buttons[1];
buttons.forEach(btn => {
    btn.addEventListener("click", (el) => {
        if (/(zero)|(memory)/i.test(display.innerText))
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
                if (/(\.\d+)$/.test(display.innerText))
                    return;
                //append 0 before . if the previous input is not a digit
                if (/[\÷\×\+\-]$/.test(lastInput)) {
                    display.innerText = buildExpression(display.innerText, "0" + el.target.innerText);
                    lastInput = el.target.innerText;
                    return;
                }
            }

            display.innerText = buildExpression(display.innerText, el.target.innerText);
            lastInput = el.target.innerText;
        }
        else {
            switch (el.target.id) {
                case "equals":
                    //remove floating point or operator if it's immediately followed by =
                    if (/[\.\+\-\×\÷]/.test(lastInput)) {
                        delButton.click();
                    }
                    display.innerText = evaluate(display.innerText);
                    lastInput = "=";
                    break;
                case "del":
                    display.innerText = del(display.innerText);
                    lastInput = display.innerText.slice(-1);
                    break;
                case "clear":
                    resetExpr();
                    break;
                case "signChg":
                    display.innerText = signChg(display.innerText);
                    break;
            }

        }
    });
});

const resetExpr = () => {
    display.innerText = "0";
    lastInput = "0";
}