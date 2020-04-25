export function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

const SPECIAL_PROPS = [
    "key",
    "children",
    "dangerouslySetInnerHTML",
];

// https://stackoverflow.com/questions/49358560/react-wrapper-react-does-not-recognize-the-staticcontext-prop-on-a-dom-elemen
const defaultTester = document.createElement("div")
export function filterBadProps(props, tester = defaultTester) {
    if(process.env.NODE_ENV !== 'development') { return props; }
    // filter out any keys which don't exist in reacts special props, or the tester.
    const out = {};
    Object.keys(props).filter((propName) => 
        (propName in tester) || (propName.toLowerCase() in tester) || SPECIAL_PROPS.includes(propName)
    ).forEach((key) => out[key] = props[key]);
    return out;
}

// TODO at some point we need to check if the game already is existing
// we cant just create randomly....
export function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length)).toLocaleLowerCase();
    return text;
  }