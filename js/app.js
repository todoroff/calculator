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
    if ((operation === '÷' || operation === '×') && Number(a) < 0 && Number(b) < 0)
        return "+" + Big(operations[operation](Number(a), Number(b))).toFixed();
    return Big(operations[operation](Number(a), Number(b))).toFixed();
}

let expression = "0";
const del = () => {
    expression = expression.slice(0, -1);
    if (expression.length === 0)
        resetExpr();
    display.innerText = expression;
    lastInput = expression.slice(-1);
    return expression;
}
const signChg = () => {
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
    expression = newExp.join("").replace(/([÷×])(\+)/, '$1');
    display.innerText = expression;
    return;

}
const buildExpression = (symbol) => {
    if (expression === "0" && !/[\÷\×\+\-\.]/.test(symbol)) {
        expression = symbol;
    } else {
        expression += symbol;
    }
    display.innerText = expression;

}
let steps = 0;
const evaluate = (expr) => {
    steps++;
    let result = expr;
    const bigNum = /(\d+\.)*\d*e\+\d+/g;

    if (steps > 500) {
        return 'Out of memory.';
    }
    //if in exponential form, convert to decimal so it doesn't break our functions
    if (bigNum.test(result)) {
        let normalize = Big(result.match(bigNum)[0]).toFixed();
        result = result.replace(bigNum, normalize);
        return evaluate(result);
    }
    if (/[a-z]/.test(result)) {
        steps = 0;
        return 'Zero divison.';
    }
    //if only one number left return the result
    if (/^([\+\-]?(?:\d+[.])?\d+)$/.test(result)) {
        result = result.replace("+", "");
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


const display = document.querySelector("#display");
display.innerText = "0";
let lastInput = "";
const appendableBtns = document.querySelectorAll("button:not(.nonexpr)");
appendableBtns.forEach(btn => {
    btn.addEventListener("click", (el) => {
        if (el.target.className.includes("number") && lastInput === "=") {
            resetExpr();
        }
        //make sure operators are not repeated or stacked
        if (el.target.className.includes("operator")) {
            if (el.target.innerText === lastInput)
                return;
            if (el.target.innerText !== lastInput && /[\÷\×\+\-]$/.test(lastInput) && el.target.id !== "point")
                del();
            //remove floating point if it's immediately followed by an operator
            if (el.target.innerText !== lastInput && lastInput === ".")
                del();
        }
        if (el.target.id == "point") {
            //disable multiple decimal points in one number
            if (/(\.\d+)$/.test(expression))
                return;
            //append 0 before . if the previous input is not a digit
            if (/[\÷\×\+\-]$/.test(lastInput)) {
                buildExpression("0" + el.target.innerText);
                lastInput = el.target.innerText;
                return;
            }
        }
        if (/[a-z]i/.test(display.innerText))
            resetExpr();

        buildExpression(el.target.innerText);
        lastInput = el.target.innerText;
    });
});

const resetExpr = () => {
    expression = "0";
    lastInput = "0";
}

const equalsBtn = document.querySelector("#equals");

equalsBtn.addEventListener("click", () => {
    //remove floating point or operator if it's immediately followed by =
    if (/[\.\+\-\×\÷]/.test(lastInput)) {
        const input = lastInput
        del();
        if (input = ".")
            return;
    }
    expression = evaluate(display.innerText);
    display.innerText = expression;
    lastInput = "=";

});
const delBtn = document.querySelector("#del");
delBtn.addEventListener("click", () => {
    del();
    display.innerText = expression;
    lastInput = expression.slice(-1);
});
const clrBtn = document.querySelector("#clear");
clrBtn.addEventListener("click", () => {
    resetExpr();
    display.innerText = "0";
});
const signBtn = document.querySelector("#signChg");
signBtn.addEventListener("click", () => {
    signChg();
});



