const filesystem = require("fs"),
    f = require("./methods.js"),
    h = require("./htmlbase");


/***
 * Creates a HTML page from a given html based article, including a person dataset
 * parameters: article: meta data object, name: article name, callback: callback
 ***/
function getArticle(name, article, callback) {

    let ident = name;

    if(article.hasOwnProperty("title"))
        name = article.title;


    let html = h.getHead(true, false, f.lang("Detailed View"), name) +
        "<div id='content'>\n" +
        "    <div id='personspace'>\n" +
        "        <div id='personcontent'>\n" +
        "            <div id='persontitle'>\n" +
        "                <h3>" + name + "</h3>\n" +
        "            </div>\n" +
        "            <div class='persondescription'>\n" +
        "                <table id='personinfobox'>\n" +
        "                    <thead>\n" +
        "                        <tr>\n" +
        "                            <td colspan='2'>\n" +
        "                                <b>" + name + "</b>\n" +
        "                            </td>\n" +
        "                        </tr>\n" +
        getTitleImage(article) +
        "                    </thead>\n" +
        "                    <tbody>" +
        getDetails(article) +
        "                    </tbody>\n" +
        "                </table>\n";

    // --> add description box <--

    fetchHTML(ident, html, function(html3) {

        let html2 = html3 + "</div>\n</div>\n</div>\n</div>\n";

        html2 += h.getFoot(true);
        callback(html2);

    });
}


//returns key details of requested person as a html table
function getDetails(article) {

    let html = "";

    if(article.hasOwnProperty("birth")) {

        html += "<tr>\n<th>" + f.lang("Born") + "</th>\n<td>" + f.stringToDate(article.birth[0],"c");

        if(article.birth.length > 1)
            html += "<br>" + article.birth[1];

        html += "</td>\n</tr>\n";

    }

    if(article.hasOwnProperty("death")) {

        html += "<tr>\n<th>" + f.lang("Died") + "</th>\n<td>" + f.stringToDate(article.death[0],"c");

        if(article.death.length > 1)
            html += "<br>" + article.death[1];

        html += "</td>\n</tr>\n";

    }

    if(article.hasOwnProperty("partners")) {

        html += "<tr>\n<th>" + f.lang("Partner") + "</th>\n<td>";

        for(let i=0;i<article.partners.length;i++) {

            if(i>0)
                html += "<br>";

            html += article.partners[i][0];

            if(article.partners[i].length > 1)
                html += "<br>&#x26AD; " + article.partners[i][1];

        }

        html += "</td>\n</tr>\n";

    }

    if(article.hasOwnProperty("children"))
        html += "<tr>\n<th>" + f.lang("Children") + "</th>\n<td>" + getRelativesList(article.children)
            + "</td>\n</tr>\n";

    if(article.hasOwnProperty("parents"))
        html += "<tr>\n<th>" + f.lang("Parents") + "</th>\n<td>" + getRelativesList(article.parents)
            + "</td>\n</tr>\n";

    if(article.hasOwnProperty("siblings"))
        html += "<tr>\n<th>" + f.lang("Siblings") + "</th>\n<td>" + getRelativesList(article.siblings)
            + "</td>\n</tr>\n";

    if(article.hasOwnProperty("religion"))
        html += "<tr>\n<th>" + f.lang("Denomination") + "</th>\n<td>" + article.religion + "</td>\n</tr>\n";

    if(article.hasOwnProperty("job"))
        html += "<tr>\n<th>" + f.lang("Job") + "</th>\n<td>" + article.job + "</td>\n</tr>\n";

    return html;

}


//fetch bulk data too large for JSON, such as article contents
function fetchHTML(ident,html,callback) {

    filesystem.readFile("data/articles/" + ident + ".html",function(err,data) {

        if(err) {

            console.error("Error while fetching " + ident + ".html from the file system.\n" + err);
            callback(html + "<p>Article not found.</p>\n");

        } else
            callback(html + data);

    });

}


//fetch images associated with given articles
function getTitleImage(article) {

    let html = "";

    if(article.hasOwnProperty("image")) {

        html += "<tr>\n<td class='personinfoboximgtd' colspan='2'>\n" +
            "<img src='/getImg/articles/images/" + article.image[0] + "' alt='" + article.image[0] + "'>\n" +
            "</td>\n</tr>\n";

        if(article.image.length > 1)
            html += "<tr>\n<td class='personinfoboximgdesc' colspan='2'>" + article.image[1] + "</td>\n</tr>\n";

    }

    return html;

}


/* **************************** *
 * ********* METHODS ********** *
 * **************************** */


//returns a HTML based list of people from a given array for the info box
function getRelativesList(relatives){

    let xhtml = "";

    for(let k=0;k<relatives.length;k++) {

        if(k>0)
            xhtml += "<br>";

        xhtml += relatives[k][0];

        if(relatives[k].length > 1) {

            xhtml += "<br>* " + relatives[k][1];

            if(relatives[k].length > 2)
                xhtml += "; &#x2020; " + relatives[k][2];

        }

    }

    return xhtml;

}



/* **************************** *
 * ********* EXPORTS ********** *
 * **************************** */

module.exports.getArticle = getArticle;