import * as lib from "./lib.js";

const operate = (cb, ...theArgs) => {
    return cb(...theArgs);
}


console.log(lib.sutbract(lib.add(5, lib.divide(2,2), lib.multiply(4,3)), 10));