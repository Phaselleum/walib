const f = require("./methods.js");


//returns the HTML head section, width the option of including the lightbox framework
function getHead(headers, subtitle, name) {

    let html = "<!DOCTYPE html>\n" +
        "<html lang='de'>\n" +
        "<head>\n" +
        "<meta charset='UTF-8'>\n" +
        "<title>" + name + "</title>\n" +
        "<link href='https://fonts.googleapis.com/css?family=Ubuntu:300,400,500&amp;subset=latin-ext'" +
        " rel='stylesheet'>\n" +
        "<link rel='stylesheet' href='style.css'>\n" +
        "<script src='jquery.min.js'></script>\n" +
        "<script src='lib.js'></script>\n" +
        "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'" +
        " />\n" +
        "<meta name='apple-mobile-web-app-capable' content='yes'>\n" +
        "<link rel='icon' href='favicon.png' type='image'/>\n";

    if(headers)
        html += headers;

    html  += "</head>\n" +
        "<body>\n" +
        "<div id='wrapper'>\n" +
        "    <div id='title'>\n" +
        "        <a href='/index.html'>\n" +
        "            <h1>Project <img src='logo.png' alt='logo'> Alexandria</h1>\n" +
        "        </a>\n" +
        "    </div>\n" +
        "        <div id='subtitle' style='overflow:auto;'>\n" +
        "            <h2 style=''>" + subtitle + "</h2>" +
        "        </div>\n";

    return html;
}


//returns the HTML foot section, width the option of including the lightbox framework
function getFoot(footers) {

    let html = "</div>\n";

    if(footers)
        html += footers

    html += "    <div id='footer'>\n" +
        "        &copy;2020 by Frederick Brandes | <a href='disclaimer.html'>" + f.lang("Disclaimer")
        + "</a> | <a href='contact.html'>" + f.lang("Contact") + "</a>\n" +
        "    </div>\n" +
        "</div>\n" +
        "</body>\n" +
        "</html>";

    return html;
}



/* **************************** *
 * ********* EXPORTS ********** *
 * **************************** */



module.exports.getFoot = getFoot;
module.exports.getHead = getHead;