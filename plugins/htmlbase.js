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
        "<link rel='stylesheet' href='/style.css'>\n" +
        "<script src='/jquery.min.js'></script>\n" +
        "<script src='/lib.js'></script>\n" +
        "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'" +
        " />\n" +
        "<meta name='apple-mobile-web-app-capable' content='yes'>\n" +
        "<link rel='icon' href='/favicon.png' type='image'/>\n";

    if(headers)
        html += headers;

    html  += "</head>\n" +
        "<body>\n" +
        "<div id='wrapper'>\n" +
        "    <div id='title'>\n" +
        "        <a href='/index.html'>\n" +
        "            <h1>Project <img src='/logo.png' alt='logo'> Alexandria</h1>\n" +
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
        "        &copy;2020 by Frederick Brandes | <a href='/disclaimer.html'>" + f.lang("Disclaimer")
        + "</a> | <a href='/contact.html'>" + f.lang("Contact") + "</a>\n" +
        "    </div>\n" +
        "</div>\n" +
        "</body>\n" +
        "</html>";

    return html;
}


//returns the HTML for the admin panel from a given list of panel items as objects
function buildPanel(items) {

    let html = getHead("<script src='nomad.js'></script>\n", "Administration panel", "Admin panel");
    
    html +="        <div id='content'>\n" +
        "           <div id='peoplespace' style='font-weight:bold;text-align:center;text-decoration: underline;'>\n" +
        "               <h3>Content management</h3>\n" +
        "               <div class='treelist'>\n";

    for(let i=0; i<items.length; i+=4) {

        let clas = "w25 m50";

        if(items.length === 3)
            clas = "w33 m50";
        if(items.length === 2)
            clas = "w50";
        if(items.length === 1)
            clas = "w100";
        
        for(let j=i;j<4&&j<items.length;j++) {
            
            if(j === i+3 && j === items.length - 1)
                clas = "w33 m100";

            if(!items[j].hasOwnProperty("url"))
                items[j].url = "#";
            if(!items[j].hasOwnProperty("imagepath"))
                items[j].imagepath = "plus.png";
            if(!items[j].hasOwnProperty("name"))
                items[j].name = items[j].url;
            
            html += "                   <div class='treelistitem " + clas + "'>\n" +
                "                       <div class='treelistitemimg' " +
                "onclick='location.href=\"" + items[j].url + "\"'>\n" +
                "                           <img src='" + items[j].imagepath + "' alt='" + items[j].name + "'>\n" +
                "                       </div>\n" +
                "                       <div class='treelistitemdesc'>\n" +
                "                           <a href='location.href=\"" + items[j].url + "\"'>" +
                items[j].name + "</a>\n" +
                "                       </div>\n" +
                "                   </div>\n";
            
        }

    }

    return html + "               <h3>Settings</h3>\n" +
        "               <div class='treelist'>\n" +
        "                   <div class='treelistitem w100'>\n" +
        "                       <div class='treelistitemimg' onclick='location.href=\"/panel/settings\"'>\n" +
        "                           <img src='plus.png' alt='settings'>\n" +
        "                       </div>\n" +
        "                       <div class='treelistitemdesc'>\n" +
        "                           <a href='location.href=\"/panel/settings\"'>Settings</a>\n" +
        "                       </div>\n" +
        "                   </div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" + getFoot();

}


//returns the HTML for the admin panel from a given list of panel items as objects
function buildSettings(items) {

    let html = getHead("<script src='/nomad.js'></script>\n<script src='/sha512.min.js'></script>\n",
        "Administration panel", "Settings");

    html +="        <div id='content'>\n" +
        "           <div id='peoplespace' style='font-weight:bold;text-align:center;text-decoration: underline;'>\n" +
        "               <h3>Passwords</h3>\n" +
        "               <div class='treelist'>\n" +
        "                   <b>User Password</b><br>\n" +
        "                   <input id='uPW' type='password' placeholder='new password'><br>\n" +
        "                   <button onclick='setUserPW()'>Update Password</button><br><br>\n" +
        "                   <b>Admin Password</b><br>\n" +
        "                   <input id='aPWo' type='password' placeholder='old password'><br>\n" +
        "                   <input id='aPW1' type='password' placeholder='new password'><br>\n" +
        "                   <input id='aPW2' type='password' placeholder='repeat new password'><br>\n" +
        "                   <button onclick='setAdminPW()'>Update Password</button><br><br>\n" +
        "            <div style='text-align:center;'><a href='/panel'>return to admin panel</a></div>";



    return html + "</div>\n</div>\n</div>\n" + getFoot();

}


//returns the HTML for the index page from a given list of panel items as objects
function buildIndex(items) {

    let html = getHead("", "Project Alexandria", "Familie Brandes");

    html +="        <div id='content'>\n" +
        "           <div id='peoplespace' style='font-weight:bold;text-align:center;text-decoration: underline;'>\n";

    for(const key in items) {

        html += "               <h3>" + f.lang(key) + "</h3>\n" +
            "               <div class='treelist'>\n";

        for(let i=0; i<items[key].length; i+=4) {

            let clas = "w25 m50";

            if(items[key].length === 3)
                clas = "w33 m50";
            if(items[key].length === 2)
                clas = "w50";
            if(items[key].length === 1)
                clas = "w100";

            for(let j=i;j<4&&j<items[key].length;j++) {

                if(j === i+3 && j === items[key].length - 1)
                    clas = "w33 m100";

                if(!items[key][j].hasOwnProperty("url"))
                    items[key][j].url = "#";
                if(!items[key][j].hasOwnProperty("imagepath"))
                    items[key][j].imagepath = "plus.png";
                if(!items[key][j].hasOwnProperty("name"))
                    items[key][j].name = items[j].url;

                html += "                   <div class='treelistitem " + clas + "'>\n" +
                    "                       <div class='treelistitemimg' " +
                    "onclick='location.href=\"" + items[key][j].url + "\"'>\n" +
                    "                           <img src='" + items[key][j].imagepath + "' " +
                    "alt='" + items[key][j].name + "'>\n" +
                    "                       </div>\n" +
                    "                       <div class='treelistitemdesc'>\n" +
                    "                           <a href='location.href=\"" + items[key][j].url + "\"'>" +
                    items[key][j].name + "</a>\n" +
                    "                       </div>\n" +
                    "                   </div>\n";

            }

        }

        html += "               </div>\n"

    }

    return html + "             </div>\n        </div>\n" + getFoot();

}



/* **************************** *
 * ********* EXPORTS ********** *
 * **************************** */



module.exports.getFoot = getFoot;
module.exports.getHead = getHead;
module.exports.buildPanel = buildPanel;
module.exports.buildSettings = buildSettings;
module.exports.buildIndex = buildIndex;