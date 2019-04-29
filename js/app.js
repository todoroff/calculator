import * as lib from "./lib.js";
import Big from "./big.js";
const operations = {
    '+': lib.add,
    '-': lib.sutbract,
    '×': lib.multiply,
    '÷': lib.divide
}

const operate = (match, a, operation, b) => {
    return Big(operations[operation](Number(a), Number(b))).toFixed();
}

let expression = "0";
const buildExpression = (symbol) => {
    if (expression === "0" && symbol !== "0") {
        expression = symbol;

    } else {
        expression += symbol;
    }
    display.innerText = expression;

    console.log(expression);
}
let count = 0;
//let bigNumbers = [];
const evaluate = (expr) => {
    let result = expr;
    //const bigNum = /([\+\-]+(\d+)(\.)(\d+e\+\d+)*)/g;
    const bigNum = /(\d+\.)*\d*e\+\d+/g;

    console.log(count++);
    if (bigNum.test(result)) {
        let normalize = Big(result.match(bigNum)[0]).toFixed();
        result = result.replace(bigNum, normalize);
        return evaluate(result);
    }
    const zeroDivision = /\÷0/g;
    if (zeroDivision.test(result))
        return '(Err: zero divison)';
    if (! /[\÷\×\+\-]/.test(result)) {
        if (result.length > 17)
            return Big(result).toExponential();
        return result;
    }
    else if (/[\÷\×]/.test(result)) {
        result = result.replace(/(\d+)([\÷\×])(\d+)/g, operate);
        return evaluate(result);
    }
    else if (/[\+\-]/.test(result)) {
        result = result.replace(/(\d+)([\+\-])(\d+)/g, operate);
        return evaluate(result);
    }
    return result;
}
console.log(evaluate("5÷2+3"));

const display = document.querySelector("#display");
display.innerText = "0";

const appendableBtns = document.querySelectorAll("button:not(.nonexpr)");
appendableBtns.forEach(btn => {
    btn.addEventListener("click", (el) => {
        buildExpression(el.target.innerText);
    })
})
const equalsBtn = document.querySelector("#equals");
equalsBtn.addEventListener("click", () => {
    expression = evaluate(display.innerText);
    display.innerText = expression;
});
console.log(equalsBtn);


