export const add = (...theArgs) => {
    return theArgs.reduce((runningTotal, number) => runningTotal + number);
}

export const sutbract = (...theArgs) => {
    return theArgs.reduce((runningTotal, number) => runningTotal - number);
}

export const multiply = (...theArgs) => {
    return theArgs.reduce((cumulativeProduct, number) => cumulativeProduct * number);
}

export const divide = (...theArgs) => {
    return theArgs.reduce((cumulativeProduct, number) => cumulativeProduct / number);
}



