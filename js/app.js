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
    return Big(operations[operation](Number(a), Number(b))).toFixed();
}

/*let expression = "0";
const del = () => {
    expression = expression.slice(0, -1);
    display.innerText = expression;
    lastInput = expression.slice(-1);
    return expression;
}
const buildExpression = (symbol) => {
    if (expression === "0" && !/[\÷\×\+\-]/.test(symbol)) {
        expression = symbol;
    } else {
        expression += symbol;
    }
    display.innerText = expression;

    console.log(expression);
}*/
let count = 0;
//let bigNumbers = [];
const evaluate = (expr) => {
    let result = expr;
    //console.log(result.split(/([\÷\×\+])/g));
    //return true;
    //const bigNum = /([\+\-]+(\d+)(\.)(\d+e\+\d+)*)/g;
    const bigNum = /(\d+\.)*\d*e\+\d+/g;

    console.log(count++);
    if (bigNum.test(result)) {
        let normalize = Big(result.match(bigNum)[0]).toFixed();
        result = result.replace(bigNum, normalize);
        return evaluate(result);
    }
    const zeroDivision = /[a-z]/gi;
    if (zeroDivision.test(result))
        return 'Zero divison.';
    if (!/(-?(?:\d+[.])?\d+)[\÷\×\+\-](-?(?:\d+[.])?\d+)/.test(result)) {
        if (result.length > 17)
            return Big(result).toExponential();
        count = 0;
        return result;
    }
    else if (/[\÷\×]/.test(result)) {
        result = result.replace(/(-?(?:\d+[.])?\d+)([\÷\×])(-?(?:\d+[.])?\d+)/g, operate);
        return evaluate(result);
    }
    else if (/[\+\-]/.test(result)) {
        result = result.replace(/(-?(?:\d+[.])?\d+)([\+\-])(-?(?:\d+[.])?\d+)/g, operate);
        return evaluate(result);
    }
    count = 0;
    return 'else ' +result;
}
//console.log(evaluate("2+3-25÷2+3-4×5"));
console.log(evaluate("-4"));
console.log(operate(undefined, "-2", "-", "-4"));


/*const display = document.querySelector("#display");
display.innerText = "0";
let lastInput = "";
const appendableBtns = document.querySelectorAll("button:not(.nonexpr)");
appendableBtns.forEach(btn => {
    btn.addEventListener("click", (el) => {
        //make sure operators are not repeated or stacked
        if (el.target.className.includes("operator")) {
            if (el.target.innerText === lastInput)
                return;
            if (el.target.innerText !== lastInput && /[\÷\×\+\-]/.test(lastInput))
                del();
        }
        buildExpression(el.target.innerText);
        lastInput = el.target.innerText;
    })
})
const equalsBtn = document.querySelector("#equals");
equalsBtn.addEventListener("click", () => {
    expression = evaluate(display.innerText);
    display.innerText = expression;
    lastInput = expression;
});
const delBtn = document.querySelector("#del");
delBtn.addEventListener("click", () => {
    del();
    display.innerText = expression;
});
console.log(equalsBtn);*/


