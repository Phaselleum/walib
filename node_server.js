#!/usr/bin/env node
/* ************************************************************ *
 * *********************** NODE_SERVER ************************ *
 * ************************************************************ *
 *
 * ************************************************************ *
 * ************************ CONTENTS ************************** *
 * ************************************************************ *
 *
 *  ======
 *  = 0. =  PRECODE
 *       = 0.1 =  INCLUDES
 *       = 0.2 =  CONSTANTS
 *  ======
 *  = 1. =  SERVER
 *  ======
 *  = 2. =  DATABASE
 *       = 2.1 =  DATABASE HANDLING
 *       = 2.2 =  DATABASE OBJECT
 *       = 2.3 =  DATABASE INITIALISATION
 *  ======
 *
 * ************************************************************ *
 * ************************************************************ *
 * ************************************************************ */


/* ************************************************************ *
 * ************************ 0. PRECODE ************************ *
 * ************************************************************ */


/* ************************************************************ *
 * *********************** 0.1 INCLUDES *********************** *
 * ************************************************************ */


const http = require("http"),
    fs = require("fs"),
    url = require("url"),
    f = require("./plugins/methods.js"),
    htmlbase = require("./plugins/htmlbase"),
    archiver = require("./plugins/archiver.js");

const plugins = [archiver];


/* ************************************************************ *
 * *********************** 0.2 CONSTANTS ********************** *
 * ************************************************************ */


const PORT = 80,
    PUBLIC = true,
    SESS_TIMEOUT = 12*60*60*1000, // 12 hours
    ADMIN_SESS_TIMEOUT = 90*60*1000; // 90 minutes
let ADMIN_SESS_ID = f.randomChars(64), //placeholder, actual ID generated upon admin login (regenerated with every login)
    PASSWORD =  "28a5c6dac4ecbc8294a840150744d09523fb562e5c55ddd2d6a723979c8d351b1d394057440675ba8ccec12537ed0a804f398ac867d621eefa52d70fbfbe680e", //user password
    ADMIN_PW =  "0bd2cff572e3944fe54587d01cdffc2abd4d6b30fc8d2549f0edf3ab0810de61389a6a97d0be5ffcc48c191966859b952351eba22d0c76006a9146b2f03b63b3"; //admin passoword


/* ************************************************************ *
 * ************************ 1. SERVER ************************* *
 * ************************************************************ */


//Session Cookies stored in req.headers.cookie

http.createServer(function(req,res) {

    let urlparts = url.parse(req.url, true),
        pathname = urlparts.pathname,
        reqstring = "Request recieved for " + pathname; //log incoming requests

    if(req.headers.hasOwnProperty('x-forwarded-for'))
        reqstring += " via " + req.headers['x-forwarded-for'] + " via ";

    reqstring += " from " + req.connection.remoteAddress;
    console.log(reqstring);

    //block illegal requests
    if(pathname.indexOf("../") >= 0) {

        console.log("Blocked request");
        res.writeHead(403).end();

    }

    let sessionid = "",
        hasVisited = false,
        cookie = {};

    //check for existing session id and other cookies
    if(req.headers.hasOwnProperty("cookie")) {

        cookie = f.cookieToObj(req.headers.cookie);

        if(cookie.hasOwnProperty("session")) sessionid = cookie.session;
        if(cookie.hasOwnProperty("hasVisited")) hasVisited = true;

    }

    //create array from URI
    let reqfile = decodeURI(pathname.substr(1)),
        path = reqfile.split("/");

    //block illegal access of server code
    if(reqfile.includes("node_server.js") ||
        path[0] === "plugins" || path[0] === "node_modules" || path[0] === "data") {

        res.writeHead(404).end();

    //check for illegal access of admin area
    } else if(sessionid !== ADMIN_SESS_ID && (reqfile.includes("nomad.html") || reqfile.includes("nomad.js"))) {

        console.log("Attemted access of admin files blocked!");
        res.writeHead(404).end();

    //check for correct password in case of login
    } else if(path[0] === "login") {

        console.log("login request received");

        if(path[1] === PASSWORD) {

            sessionid = f.randomChars(64);
            database.sessions[sessionid] = Date.now() + SESS_TIMEOUT;
            console.log("login attempt successful! New session id (" + sessionid + ")");
            res.write(sessionid, function(){res.end();});

        } else {

            console.log("login attempt failed!");
            res.writeHead(401).end();

        }


    //check for correct password in case of login
    } else if(path[0] === "login9") {

        console.log("admin login request received");

        if(path[1] === ADMIN_PW) {

            ADMIN_SESS_ID = f.randomChars(64);
            sessionid = ADMIN_SESS_ID;
            database.sessions[sessionid] = Date.now() + ADMIN_SESS_TIMEOUT;
            console.log("admin login attempt successful! Using standard admin session id");
            res.writeHead(200).write(sessionid, function(){res.end();});

        } else {

            console.log("admin login attempt failed!");
            return res.writeHead(401).end();

        }


    } else if(path[0] === "panel") {

        console.log("admin panel requested");

        if(sessionid === ADMIN_SESS_ID) {

            let panelItems = [];

            plugins.forEach(function(plugin) {

                if (plugin.hasOwnProperty("getPanelItems"))
                    panelItems = panelItems.concat(plugin.getPanelItems());

            });

            let html = htmlbase.buildPanel(panelItems);
            res.writeHead(200).write(html, function(){res.end();});

        } else {

            console.log("unauthorised panel access atempt!");
            reqfile = "index.html";

        }


    } else {

        //redirect empty request to index
        if(reqfile === "" || reqfile === "/")
            reqfile = "index.html";

        //redirect to cookie consent or login pages, excluding legal sites as well as non-html resources
        if(PUBLIC && (!path.last().includes(".")
            || (reqfile !== "disclaimer.html" && reqfile !== "contact.html" && reqfile !== "number9.html"
                && reqfile.split(".").last() === "html"))) {

            if(!hasVisited) {

                console.log("Redirecting to settings page...");
                reqfile = "cookie.html";

            //check for existing and valid session id, remove if an invalid session id is found
            } else if((!database.sessions.hasOwnProperty(sessionid) || database.sessions[sessionid] < Date.now())
                    && reqfile !== "cookie.html") {

                console.log("Redirecting to login page...");
                reqfile = "login.html";

                if (database.sessions.hasOwnProperty(sessionid) && database.sessions[sessionid] < Date.now()) {

                    console.log("Deleting expired session id (" + sessionid + ")");
                    delete database.sessions[sessionid];

                }

            }

            //reset the path array
            path = reqfile.split("/");

        }

        let nameList = [
            "getDoc",
            "getImg",
            "login",
            "login9",
            "panel",
            "node_server.js",
            ".gitignore",
            "LICENSE",
            "README",
            "package.json",
            "plugins",
            "node_modules",
            "public",
            "data"
        ];

        let publicList = ["getDoc","getImg"];

        plugins.forEach(function(plugin) {

            if(plugin.hasOwnProperty("getURLParts"))
                nameList = nameList.concat(plugin.getURLParts());

        });

        //redirect all subfolder access to base level, excluding allowed access excluding from that base level resources
        if((!nameList.includes(path[0])) || (nameList.includes(path[0]) && path.last().includes("."))) {

            let reqfileLength = reqfile.length,
                subfolder = false;

            //in case resources are requested from subfolders, adjust the base level
            plugins.forEach(function(plugin) {

                if (plugin.hasOwnProperty("publicSubFolders")) {

                    if (plugin.publicSubFolders().includes(path[1])) {

                        reqfile = reqfile.substr(path[0].length);
                        path.shift();
                        subfolder = true;

                    }

                }

                if(!subfolder && path.length > 1 && !publicList.includes(path[0])) {

                    reqfile = path[path.length-1]
                    path = [reqfile];

                }

            });

            //redirect empty path requests to the corresponding index.html or else redirects to the base level
            if(reqfile.length === reqfileLength) {

                if(!path.last().includes("."))
                    reqfile = "index.html";
                else reqfile = path.last();

            }

        }

        let handled = false;

        //handle dynamic content requests
        plugins.forEach(function(plugin) {

            if(plugin.hasOwnProperty("handleURL")) {

                if(plugin.hasOwnProperty("getURLParts")) {

                    if(plugin.getURLParts().includes(path[0])) {

                        handled = true;
                        plugin.handleURL(path, sessionid === ADMIN_SESS_ID, req, res, nameList, database);

                    }

                }

            }

        });

        if(reqfile === "index.html") {

            handled = true;
            let items = {};

            plugins.forEach(function(plugin) {

                if(plugin.hasOwnProperty("getIndexItems")) {

                    Object.assign(items, plugin.getIndexItems(database.resources));

                }

            });

            res.write(htmlbase.buildIndex(items),function(){res.end();});

        }


        if(!handled) {

            //handles pdf fetches/downloads
            if(path[0] === "getDoc") {

                path.shift();

                fs.readFile("data/" + path.join("/"),function (err, data) {

                    if (err) {

                        console.error("Error: File \"data/" + path.join("/") +
                            "\" could not be fetched. errno: " + err.errno);
                        res.writeHead(404).end();

                    } else {

                        res.writeHead(200, {"Content-Type": "application/pdf"});
                        res.write(data, function(){res.end();});

                    }

                });

            //handles image fetches/downloads
            } else if(path[0] === "getImg") {

                path.shift();

                fs.readFile("data/" + path.join("/"),function (err, data) {

                    if (err) {

                        console.error("Error: Image \"data/" + path.join("/") +
                            "\" could not be fetched. errno: " + err.errno);
                        res.writeHead(404);
                        res.end();

                    } else {

                        res.writeHead(200,
                            {"Content-Type": "image/" + path[path.length - 1].split(".")[1]});
                        res.write(data, function(){res.end();});

                    }

                });

            //handles regular file access
            } else {

                if(PUBLIC)
                    reqfile = "public/" + reqfile;

                fs.readFile(reqfile, function (err, data) {

                    if (err) {

                        console.error("Error: File \"" + reqfile + "\" could not be fetched. errno: " + err.errno);
                        res.writeHead(404);
                        res.end();

                    } else {

                        let reqtype = reqfile.split(".").pop(),
                            ctype = "";
                        switch (reqtype) {

                            case "html":
                            case "css":
                            case "json":
                            case "js":
                            case "txt":
                                ctype = "text/" + reqtype;
                                break;

                            case "png":
                            case "jpg":
                            case "gif":
                                ctype = "image/" + ctype;
                                break;

                        }

                        res.writeHead(200, {"Content-Type": ctype});
                        res.write(data, function(){res.end();});

                    }

                });

            }

        }

    }

}).listen(PORT);

console.log('Server running at port ' + PORT + '/');



/* ************************************************************ *
 * ************************ 2. DATABASE *********************** *
 * ************************************************************ */


/* ************************************************************ *
 * ******************* 2.1 DATABASE HANDLING ****************** *
 * ************************************************************ */


/* ************************************************************ *
 * ******************** 2.2 DATABASE OBJECT ******************* *
 * ************************************************************ */


const database = {

    "library": {},
    "resources": {},
    "lang": {},

    "searches": {},
    "sessions": {},

    //loads a json file from the data folder and passes it on
    "fileToLib": function(file, callback) {

        fs.readFile("data/" + file + ".json",function(err,data) {

            if(err)
                console.error("Error while fetching " + file + " from the file system.\n" + err);

            callback(data,err);

        });

    },

    //saves a json file from the database to the data folder
    "libToFile": function(file, content, callback){

        fs.writeFile("data/" + file + ".json", content, function(err){

            if(err)
                console.error("Error while writing data/" + file + ".json to the file system.\n" + err);

            callback(err);

        });

    }

};


/* ************************************************************ *
 * *************** 2.3 DATABASE INITIALISATION **************** *
 * ************************************************************ */


//loads the main json library to the database
function loadLibrary() {

    plugins.forEach(function(plugin) {

        if(plugin.hasOwnProperty("loadDatabase"))
            plugin.loadDatabase(database);

    });

    //load language file to database
    database.fileToLib("lang",function(data, err) {

        if (!err) {

            database.lang = JSON.parse(data);
            f.setLanguageLibrary(database.lang);

        } else console.error("ERROR: Language file not found or corrupted! The default language will be used.");

    });

}

//run on initialisation
loadLibrary();