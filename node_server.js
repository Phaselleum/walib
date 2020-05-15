#!/usr/bin/env node
/************************************************************** *
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
 *       = 2.3 =  DATABASE INITIALISING
 *  ======
 *
 * ************************************************************ *
 * ************************************************************ *
 * ************************************************************ */


/************************************************************** *
 * ************************ 0. PRECODE ************************ *
 * ************************************************************ */


/************************************************************** *
 * *********************** 0.1 INCLUDES *********************** *
 * ************************************************************ */


const http = require("http"),
    fs = require("fs"),
    url = require("url"),
    formidable = require('formidable'),
    f = require("./plugins/methods.js"),
    archiver = require("./plugins/archiver.js"),
    gen = require("./plugins/genealogy.js"),
    PDFImage = require("pdf-image").PDFImage;


/************************************************************** *
 * *********************** 0.2 CONSTANTS ********************** *
 * ************************************************************ */


const PORT = 80,
    PUBLIC = true,
    SESS_TIMEOUT = 12*60*60*1000, // 12 hours
    ADMIN_SESS_TIMEOUT = 90*60*1000, // 90 minutes
    MAX_FILE_SIZE = 1e8; // ~100MB
let ADMIN_SESS_ID = f.randomChars(64), //placeholder, actual ID generated upon admin login (regenerated with every login)
    PASSWORD =  "28a5c6dac4ecbc8294a840150744d09523fb562e5c55ddd2d6a723979c8d351b1d394057440675ba8ccec12537ed0a804f398ac867d621eefa52d70fbfbe680e", //Flensburg2016
    ADMIN_PW =  "0bd2cff572e3944fe54587d01cdffc2abd4d6b30fc8d2549f0edf3ab0810de61389a6a97d0be5ffcc48c191966859b952351eba22d0c76006a9146b2f03b63b3"; //admin passoword


/************************************************************** *
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
        res.writeHead(403);
        res.end();

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
    if(reqfile.includes("node_server.js")) {

        res.writeHead(404);
        res.end();

    //check for illegal access of admin area
    } else if((reqfile.includes("nomad.html") || reqfile.includes("nomad.js")) && sessionid !== ADMIN_SESS_ID) {

        console.log("Attemted access of admin files!");
        res.writeHead(404);
        res.end();

    //check for correct password in case of login
    } else if(path[0] === "login") {

        console.log("login request received");

        if(login(path[1])) {

            sessionid = f.randomChars(64);
            database.sessions[sessionid] = Date.now() + SESS_TIMEOUT;
            console.log("login attempt successful! New session id (" + sessionid + ")");
            res.write(sessionid, function(){res.end();});

        } else {

            console.log("login attempt failed!");
            res.writeHead(401);
            res.end();

        }


    //check for correct password in case of login
    } else if(path[0] === "login9") {

        console.log("admin login request received");

        if(login9(path[1])) {

            ADMIN_SESS_ID = f.randomChars(64);
            sessionid = ADMIN_SESS_ID;
            database.sessions[sessionid] = Date.now() + ADMIN_SESS_TIMEOUT;
            console.log("admin login attempt successful! Using standard admin session id");
            res.write(sessionid, function(){res.end();});

        } else {

            res.writeHead(401);
            console.log("admin login attempt failed!");
            return res.end();

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

        let adminPageList = [
            "gallery",
            "gallery-admin",
            "gallery-add",
            "gallery-remove",
            "gallery-edit",
            "gallery-move",
            "gallery-add-element",
            "gallery-remove-element",
            "gallery-move-element",
            "gallery-edit-element",
            "document",
            "document-admin",
            "document-add",
            "document-remove",
            "document-edit",
            "document-move",
            "document-upload",
            "document-edit-meta",
            "BookReader",
            "article"
        ];

        //redirect all subfolder access to base level, excluding allowed access excluding from that base level resources
        if((path.length > 1 && !adminPageList.includes(path[0]))
            || ((path[0] === "document" || path[0] === "gallery" || path[0] === "article")
                && path.last().includes("."))) {


            //in case BookReader resources are requested from subfolders, move to make BookReader the base level
            if(path[1] === "BookReader")
                reqfile = reqfile.substr(path[0].length);

            //redirect empty path requests to the corresponding index.html
            else if(!path.last().includes("."))
                reqfile = "index.html";

            else reqfile = path.last();

        }

        //handle dynamic content requests
        if(!reqfile.includes(".")){

            //handle dynamicly generated admin panel content
            if(sessionid === ADMIN_SESS_ID) {

                //handles addition of a gallery
                if(path[0] === "gallery-add") {

                    archiver.addGallery(path[1], database.library.galleries, database.resources.galleries,
                        adminPageList, function (data, err) {

                        if(!err) {

                            database.libToFile("gallery-library", JSON.stringify(database.library.galleries),
                                function(err){

                                database.libToFile("galleries/" + path[1], "[]", function(err2){

                                    fs.mkdir("data/galleries/" + path[1], function(err3){

                                        if(err || err2 || err3)
                                            res.write("Error while writing to disk!;" + err + ";" + err2 + ";" +
                                                err3 + ";" + data, function(){res.end();});

                                        else res.write(data, function(){res.end();});

                                    });

                                });

                            });

                        } else res.write(data, function(){res.end();});

                    });

                //handles renaming of a gallery
                } else if(path[0] === "gallery-edit") {

                    archiver.editGallery(path[1], path[2], database.library.galleries, database.resources.galleries,
                        adminPageList, function (data, err) {

                        if(!err) {

                            database.libToFile("gallery-library", JSON.stringify(database.library.galleries),
                                function(err){

                                database.libToFile("galleries/" + path[1],
                                    JSON.stringify(database.resources.galleries[path[2]]),function(err2){

                                    fs.rename("data/galleries/" + path[1] + ".json",
                                        "data/galleries/" + path[2] + ".json", function(err3) {

                                        fs.rename("data/galleries/" + path[1],
                                            "data/galleries/" + path[2], function(err4) {

                                            if (err || err2 || err3 || err4)
                                                res.write("Error while writing to disk!;" + err + ";" +
                                                    err2 + ";" + err3 + ";" + err4 + ";" + data,
                                                    function() {res.end();});

                                            else res.write(data, function() {res.end();});

                                        });

                                    });

                                });

                            });

                        } else res.write(data, function(){res.end();});

                    });

                //handles removing of a gallery
                } else if(path[0] === "gallery-remove") {

                    archiver.removeGallery(path[1], database.library.galleries, database.resources.galleries,
                        function (data, err) {

                        if(!err) {

                            database.libToFile("gallery-library", JSON.stringify(database.library.galleries),
                                function(err){

                                fs.unlink("data/galleries/" + path[1] + ".json", function(err2){

                                    fs.rmdir("data/galleries/" + path[1], function(err3){

                                        if(err || err2 || err3)
                                            res.write("Error while writing to disk!;" + err + ";" + err2 + ";" +
                                                err3 + ";" + data, function(){res.end();});

                                        else res.write(data, function(){res.end();});

                                    });

                                });

                            });

                        } else res.write(data, function(){res.end();});

                    });

                //handles moving of a gallery up by one position
                } else if(path[0] === "gallery-move") {

                    archiver.moveGallery(path[1], database.library.galleries, database.resources.galleries,
                        function (data, err) {

                        if(!err) {

                            database.libToFile("gallery-library", JSON.stringify(database.library.galleries),
                                function(err){

                                if(err)
                                    res.write("Error while writing to disk!;" + err + ";" + data,
                                        function(){res.end();});

                                else res.write(data, function(){res.end();});

                            });

                        } else res.write(data, function(){res.end();});

                    });

                //handles access to gallery management page
                } else if(path[0] === "gallery-add-element") {

                    if (req.method === "POST") {

                        console.log("POST request received.");

                        let form = formidable.IncomingForm(),
                            field = "",
                            fileName = "",
                            error = "";

                        form.parse(req);

                        form.on("field", function(name, value){

                            console.log("Field received: " + name + "=>" + value);

                            if(name === "desc")
                                field = value;

                        });

                        form.on("fileBegin", function(name, file) {

                            fileName = file.name;
                            file.path = "data/galleries/" + path[1] + "/" + file.name;

                        });

                        form.on("file", function (name, file) {

                            console.log("File received: " + file.name);

                            if(file.size > MAX_FILE_SIZE) {

                                res.writeHead(413,{"Content-Type": "text/html"});
                                res.write("The file is too large!");
                                error += "413;";

                            }

                            res.write("File(s) uploaded!\n");

                        });

                        req.on("end", function () {

                            console.log("POST request ended: " + fileName + ":" + field);

                            database.resources.galleries[path[1]].push([fileName, field]);

                            database.libToFile("galleries/" + path[1],
                                JSON.stringify(database.resources.galleries[path[1]]),function(err){

                                if(err) {

                                    res.write("\nError while writing to disk!;" + err);
                                    error += err + ";";

                                }

                                if(error === "")
                                    res.write("File uploaded successfully!", function(){res.end();});

                                else
                                    res.write("The following errors were thrown:\n" + error,
                                        function(){res.end();});

                            });

                        });

                        form.on("error", function (err) {

                            res.write("\nError while uploading file(s)!;" + err + ";" + data,
                                function(){res.end();});

                        });

                    } else {

                        //Only allow POST connections here
                        res.writeHead(405,{"Allow": "POST"});
                        res.write("Only POST connections allowed here!");
                        res.end();

                    }

                //handles removing of a gallery element
                } else if(path[0] === "gallery-remove-element") {

                    archiver.removeGalleryElement(path[1], path[2], database.library.galleries,
                        database.resources.galleries, function (fname, data, err) {

                        if(!err) {

                            database.libToFile("galleries/" + path[1],
                                JSON.stringify(database.resources.galleries[path[1]]),function(err){

                                fs.unlink("data/galleries/" + path[1] + "/" + fname,
                                    function(err2){

                                    if(err || err2)
                                        res.write("Error while writing to disk!;" + err + ";" + err2 + ";" + data,
                                            function(){res.end();});

                                    else res.write(data, function(){res.end();});

                                });

                            });

                        } else res.write(data, function(){res.end();});

                    });

                //handles editing of a gallery element description
                } else if(path[0] === "gallery-edit-element") {

                    if (req.method === "POST") {

                        console.log("POST request received.");

                        let form = formidable.IncomingForm(),
                            field = "",
                            error = "";

                        form.parse(req);

                        form.on("field", function(name, value){

                            console.log("Field received: " + name + "=>" + value);

                            if(name === "desc")
                                field = value;

                        });

                        req.on("end", function () {

                            console.log("POST request ended: " + field);

                            database.resources.galleries[path[1]][path[2]][1] = field;

                            database.libToFile("galleries/" + path[1],
                                JSON.stringify(database.resources.galleries[path[1]]),function(err){

                                    if(err) {

                                        res.write("\nError while writing to disk!;" + err);
                                        error += err + ";";

                                    }

                                    if(error === "")
                                        res.write("Data successfully received!", function(){res.end();});

                                    else
                                        res.write("The following errors were thrown:\n" + error,
                                            function(){res.end();});

                                });

                        });

                        form.on("error", function (err) {

                            res.write("\nError while uploading file(s)!;" + err + ";" + data,
                                function(){res.end();});

                        });

                    } else {

                        //Only allow POST connections here
                        res.writeHead(405,{"Allow": "POST"});
                        res.write("Only POST connections allowed here!");
                        res.end();

                    }

                //handles moving of a gallery element
                } else if(path[0] === "gallery-move-element") {

                    archiver.moveGalleryElement(path[1], path[2], database.library.galleries,
                        database.resources.galleries, function (data, err) {

                            if(!err) {

                                database.libToFile("galleries/" + path[1],
                                    JSON.stringify(database.resources.galleries[path[1]]), function(err) {

                                        fs.unlink("data/galleries/" + path[1] + "/" +
                                            database.resources.galleries[path[1]][path[2]][0],
                                            function (err2) {

                                                if (err || err2)
                                                    res.write("Error while writing to disk!;" + err + ";" +
                                                        err2 + ";" + data, function () {res.end();});

                                                else res.write(data, function () {res.end();});

                                            });

                                    });

                            } else res.write(data, function(){res.end();});

                        });

                //handles access to gallery management page
                } else if(path[0] === "gallery-admin") {

                    archiver.adminGallery(database.library.galleries, database.resources.galleries,
                        function (data) {

                        res.write(data, function () {
                            res.end();
                        });

                    });

                //handles addition of a document
                } else if(path[0] === "document-add") {

                    if (req.method === "POST") {

                        console.log("POST request received.");

                        let form = formidable.IncomingForm(),
                            field = "",
                            fileName = "",
                            error = "";

                        form.parse(req);

                        form.on("field", function(name, value){

                            console.log("Field received: " + name + "=>" + value);

                            if(name === "name")
                                field = value;

                        });

                        form.on("fileBegin", function(name, file) {

                            fileName = file.name;
                            file.path = "data/documents/" + path[1] + "/" + file.name;

                        });

                        form.on("file", function (name, file) {

                            console.log("File received: " + file.name);

                            if(file.size > MAX_FILE_SIZE) {

                                res.writeHead(413,{"Content-Type": "text/html"});
                                res.write("The file is too large!");
                                error += "413;";

                            }

                            res.write("File(s) uploaded!\n");

                        });

                        req.on("end", function () {

                            console.log("POST request ended: " + fileName + ":" + field);

                            let docId = field.replace(/\s/g,"-");

                            archiver.addDocument(field, docId, database.library.documents, database.resources.documents,
                                adminPageList, function (data, err) {

                                if(!err) {

                                    database.libToFile("documents/" + docId,
                                        JSON.stringify(database.resources.documents[docId]), function (err) {

                                        database.libToFile("document-library",
                                            JSON.stringify(database.library.documents), function (err2) {

                                            fs.mkdir("data/documents/" + docId, function (err3) {

                                                let pdfimg = new PDFImage("data/documents/" + docId + "/" + fileName);

                                                database.resources.documents[docId]["pageCount"] =
                                                    pdfimg.numberOfPages();

                                                pdfimg.convertFile().then(function () {

                                                    console.log("Document successfully converted to images!");

                                                    if (err || err2 || err3)
                                                        res.write("Error while writing to disk!;" + err + ";" +
                                                            err2 + ";" + err3 + ";" + data, function () {
                                                            res.end();
                                                        });

                                                    else res.write(data, function () {
                                                        res.end();
                                                    });

                                                }, function(error) {

                                                    console.log("Document conversion failed!");

                                                    if (err || err2 || err3)
                                                        res.write("Error while writing to disk!;" + err + ";" +
                                                            err2 + ";" + err3 + ";" + error + ";" + data,
                                                            function () {
                                                            res.end();
                                                        });

                                                    else res.write(data, function () {
                                                        res.end();
                                                    });

                                                });

                                            });

                                        });

                                    });

                                } else res.write(data, function(){res.end();});

                            });

                        });

                        form.on("error", function (err) {

                            res.write("\nError while uploading file(s)!;" + err + ";" + data,
                                function(){res.end();});

                        });

                    } else {

                        //Only allow POST connections here
                        res.writeHead(405,{"Allow": "POST"});
                        res.write("Only POST connections allowed here!");
                        res.end();

                    }

                //handles renaming of a document
                } else if(path[0] === "document-edit") {

                    archiver.editDocument(path[1], path[2], database.library.documents, database.resources.documents,
                        adminPageList, function (data, err) {

                        if(!err) {

                            database.libToFile("document-library", JSON.stringify(database.library.galleries),
                                function(err){

                                database.libToFile("documents/" + path[1],
                                    JSON.stringify(database.resources.galleries[path[2]]),function(err2){

                                    fs.rename("data/documents/" + path[1] + ".json",
                                        "data/documents/" + path[2] + ".json", function(err3) {

                                        fs.rename("data/documents/" + path[1],
                                            "data/documents/" + path[2], function(err4) {

                                            if (err || err2 || err3 || err4)
                                                res.write("Error while writing to disk!;" + err + ";" +
                                                    err2 + ";" + err3 + ";" + err4 + ";" + data,
                                                    function() {res.end();});

                                            else res.write(data, function() {res.end();});

                                        });

                                    });

                                });

                            });

                        } else res.write(data, function(){res.end();});

                    });

                //handles removing of a document
                } else if(path[0] === "document-remove") {

                    archiver.removeGallery(path[1], database.library.documents, database.resources.documents,
                        function (data, err) {

                        if(!err) {

                            database.libToFile("document-library", JSON.stringify(database.library.documents),
                                function(err){

                                fs.unlink("data/documents/" + path[1] + ".json", function(err2){

                                    fs.rmdir("data/documents/" + path[1], function(err3){

                                        if(err || err2 || err3)
                                            res.write("Error while writing to disk!;" + err + ";" + err2 + ";" +
                                                err3 + ";" + data, function(){res.end();});

                                        else res.write(data, function(){res.end();});

                                    });

                                });

                            });

                        } else res.write(data, function(){res.end();});

                    });

                //handles moving of a document up by one position
                } else if(path[0] === "document-move") {

                    archiver.moveDocument(path[1], database.library.documents, database.resources.documents,
                        function (data, err) {

                        if(!err) {

                            database.libToFile("document-library", JSON.stringify(database.library.documents),
                                function(err){

                                if(err)
                                    res.write("Error while writing to disk!;" + err + ";" + data,
                                        function(){res.end();});

                                else res.write(data, function(){res.end();});

                            });

                        } else res.write(data, function(){res.end();});

                    });


                //handles a document upload
                } else if(path[0] === "document-upload") {

                    if (req.method === "POST") {

                        console.log("POST request received.");

                        let form = formidable.IncomingForm(),
                            fileName = "",
                            error = "";

                        form.parse(req);

                        form.on("fileBegin", function(name, file) {

                            fileName = file.name;
                            file.path = "data/documents/" + path[1] + "/" + file.name;

                        });

                        form.on("file", function (name, file) {

                            console.log("File received: " + file.name);

                            if(file.size > MAX_FILE_SIZE) {

                                res.writeHead(413,{"Content-Type": "text/html"});
                                res.write("The file is too large!");
                                error += "413;";

                            }

                            res.write("File(s) uploaded!\n");

                        });

                        req.on("end", function () {

                            console.log("POST request ended: " + fileName);

                            database.resources.documents[path[1]]["file"] = fileName;

                            database.libToFile("documents/" + path[1],
                                JSON.stringify(database.resources.documents[path[1]]),function(err){

                                if(err) {

                                    res.write("\nError while writing to disk!;" + err);
                                    error += err + ";";

                                }

                                let pdfimg = new PDFImage("data/documents/" + path[1] + "/" + fileName);

                                database.resources.documents[path[1]]["pageCount"] = pdfimg.numberOfPages();

                                pdfimg.convertFile().then(function () {

                                    console.log("Document successfully converted to images!");

                                    if(error === "")
                                        res.write("File uploaded successfully!", function(){res.end();});

                                    else
                                        res.write("The following errors were thrown:\n" + error,
                                            function(){res.end();});

                                });

                            });

                        });

                        form.on("error", function (err) {

                            res.write("\nError while uploading file(s)!;" + err + ";" + data,
                                function(){res.end();});

                        });

                    } else {

                        //Only allow POST connections here
                        res.writeHead(405,{"Allow": "POST"});
                        res.write("Only POST connections allowed here!");
                        res.end();

                    }

                //handles a document metadata update
                } else if(path[0] === "document-edit-meta") {

                    if (req.method === "POST") {

                        console.log("POST request received.");

                        let form = formidable.IncomingForm(),
                            fields = {},
                            error = "";

                        form.parse(req);

                        form.on("field", function(name, value){

                            console.log("Field received: " + name + "=>" + value);

                            fields[name] = value;

                        });

                        req.on("end", function () {

                            console.log("POST request ended: " + fields);

                            if(fields.hasOwnProperty("author"))
                                database.resources.documents[path[1]]["authors"] = fields.author.split(",");
                            if(fields.hasOwnProperty("coauthor"))
                                database.resources.documents[path[1]]["coauthors"] = fields.coauthor.split(",");
                            if(fields.hasOwnProperty("date"))
                                database.resources.documents[path[1]]["date"] = fields.date;
                            if(fields.hasOwnProperty("desc"))
                                database.resources.documents[path[1]]["description"] = fields.desc;
                            if(fields.hasOwnProperty("contributor"))
                                database.resources.documents[path[1]]["contributor"] = fields.contributor;
                            if(fields.hasOwnProperty("seealso"))
                                database.resources.documents[path[1]]["seealso"] = fields.seealso.split(",");

                            if(error === "")
                                res.write("Document updated successfully!", function(){res.end();});

                            else
                                res.write("The following errors were thrown:\n" + error,
                                    function(){res.end();});

                        });

                        form.on("error", function (err) {

                            res.write("\nError while updating document!;" + err + ";" + data,
                                function(){res.end();});

                        });

                    } else {

                        //Only allow POST connections here
                        res.writeHead(405,{"Allow": "POST"});
                        res.write("Only POST connections allowed here!");
                        res.end();

                    }

                //handles access to document management page
                } else if(path[0] === "document-admin") {

                    archiver.adminDocument(database.library.documents, database.resources.documents,
                        function (data) {

                            res.write(data, function(){res.end();});

                        });

                }

            }

            //handles dynamic page access through the article plugin
            if(!path[1] && !adminPageList.includes(path[0])) {

                let resp1 = {};

                if (database.library.includes(path[0]))
                    resp1 = database.resources[path[0]];

                else console.error("ERROR: Requested document \"" + path[0] + "\" not found.");

                archiver.getDocument(resp1, database.resources, function (data) {

                    res.write(data, function(){res.end();});

                });

            //handles gallery access through the article plugin
            } else if(path[0] === "gallery") {

                let resp1 = {};

                if (database.library.galleries.includes(path[1]))
                    resp1 = database.resources.galleries[path[1]];

                else console.error("ERROR: Requested gallery \"" + path[1] + "\" not found.");

                archiver.getGallery(path[1], resp1, function (data) {

                    res.write(data, function(){res.end();});

                });

            //handles document access through the article plugin
            } else if(path[0] === "document") {

                let resp1 = {};

                if (database.library.documents.includes(path[1]))
                    resp1 = database.resources.documents[path[1]];

                else console.error("ERROR: Requested document \"" + path[1] + "\" not found.");

                archiver.getDocument(path[1], resp1, function (data) {

                    res.write(data, function(){res.end();});

                });

            //handles article access through the article plugin
            } else if(path[0] === "article") {

                let resp1 = {};

                if (database.library.articles.includes(path[1]))
                    resp1 = database.resources.articles[path[1]];

                else console.error("ERROR: Requested article \"" + path[1] + "\" not found.");

                gen.getArticle(path[1], resp1, function (data) {

                    res.write(data, function(){res.end();});

                });

            }

        //handles pdf fetches/downloads
        } else if(path[0] === "getDoc") {

            fs.readFile("data/documents/" + path[1],
                function (err, data) {

                if (err) {

                    console.error("Error: File \"data/documents/" + path[1] + "\" could not be fetched. errno: " +
                        err.errno);
                    res.writeHead(404);
                    res.end();

                } else {

                    res.writeHead(200, {"Content-Type": "application/pdf"});
                    res.write(data, function(){res.end();});

                }

            });

        //handles image fetches/downloads
        } else if(path[0] === "getImg") {

            fs.readFile("data/" + path[1] + "/" + path[2] + "/" + path[3],
                function (err, data) {

                if (err) {

                    console.error("Error: Image \"data/" + path[1] + "/" + path[2] + "/" + path[3] +
                        "\" could not be fetched. errno: " + err.errno);
                    res.writeHead(404);
                    res.end();

                } else {

                    res.writeHead(200, {"Content-Type": "image/" + path[3].split(".")[1]});
                    res.write(data, function(){res.end();});

                }

            });

        //handles BookReader page image fetches/downloads
        } else if(path[0] === "getPage") {

            fs.readFile("data/" + path[1] + "/" + path[2],
                function (err, data) {

                if (err) {

                    console.error("Error: File \"data/" + path[1] + "/" + path[2] +
                        "\" could not be fetched. errno: " + err.errno);
                    res.writeHead(404);
                    res.end();

                } else {

                    res.writeHead(200, {"Content-Type": "image/jpeg"});
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

}).listen(PORT);

console.log('Server running at port ' + PORT + '/');



/************************************************************** *
 * ************************ 2. DATABASE *********************** *
 * ************************************************************ */


/************************************************************** *
 * ******************* 2.1 DATABASE HANDLING ****************** *
 * ************************************************************ */


//fetches encoded password from database
function login(pw) {
    return PASSWORD === pw;
}


//fetches encoded password from database
function login9(pw) {
    return ADMIN_PW === pw;
}


/************************************************************** *
 * ******************** 2.2 DATABASE OBJECT ******************* *
 * ************************************************************ */


const database = {

    "library": {},
    "resources": {},
    "lang": {},

    "searches": {},
    "sessions": {},

    "fileToLib": function(file, callback) {

        fs.readFile("data/" + file + ".json",function(err,data) {

            if(err)
                console.error("Error while fetching " + file + " from the file system.\n" + err);

            callback(data,err);

        });

    },
    "libToFile": function(file, content, callback){

        fs.writeFile("data/" + file + ".json", content, function(err){

            if(err)
                console.error("Error while writing data/" + file + ".json to the file system.\n" + err);

            callback(err);

        });

    }

};


/************************************************************** *
 * *************** 2.2 DATABASE INITIALISATION **************** *
 * ************************************************************ */


//loads the main json library to the database
function loadLibrary() {

    //load library file to database
    database.fileToLib("library",function(data, err) {

        if (!err) {

            database.library = JSON.parse(data);
            console.log("Library successfully loaded!");

        } else {

            console.error("ERROR: Database library not found or corrupted!");
            return;

        }

        //load referenced resources to database
        for (let i=0; i<database.library.length; i++) {

            database.fileToLib(database.library[i], function (data, err) {

                if (!err) {

                    let jdata = JSON.parse(data);
                    database.resources[database.library[i]] = jdata;

                    if(!jdata.hasOwnProperty("id"))
                        console.error("WARNING: resource has no id attribute! (" + database.library[i] + ")");

                    else if(database.library[i] !== jdata.id)
                        console.error("WARNING: Mismatch between library entry and resource id! (" +
                            database.library[i] + "|" + jdata.id + ")");

                } else
                    console.error("ERROR: The resource requested could not be loaded to the database! (loadLibrary)");

            });

        }

        //load gallery library to database
        database.fileToLib("gallery-library",function(data, err) {

            if (!err) {

                database.library.galleries = JSON.parse(data);
                console.log("Gallery library successfully loaded!");

            } else {

                console.error("ERROR: Gallery library not found or corrupted!");
                return;

            }

            //load referenced resources to database
            database.resources.galleries = {};
            for (let i=0; i<database.library.galleries.length; i++) {

                database.fileToLib("galleries/" + database.library.galleries[i], function (data, err) {

                    if (!err)
                        database.resources.galleries[database.library.galleries[i]] = JSON.parse(data);

                    else
                        console.error("ERROR: The resource requested could not be loaded to the database! " +
                            "(loadLibrary/galleries)");

                });

            }


            //load document library to database
            database.fileToLib("document-library",function(data, err) {

                if (!err) {

                    database.library.documents = JSON.parse(data);
                    console.log("Document library successfully loaded!");

                } else {

                    console.error("ERROR: Document library not found or corrupted!");
                    return;

                }

                //load referenced resources to database
                database.resources.documents = {};
                for (let i=0; i<database.library.documents.length; i++) {

                    database.fileToLib("documents/" + database.library.documents[i], function (data, err) {

                        if (!err)
                            database.resources.documents[database.library.documents[i]] = JSON.parse(data);

                        else
                            console.error("ERROR: The resource requested could not be loaded to the database! " +
                                "(loadLibrary/documents)");

                    });

                }

                //load article library to database
                database.fileToLib("article-library",function(data, err) {

                    if (!err) {

                        database.library.articles = JSON.parse(data);
                        console.log("Article library successfully loaded!");

                    } else {

                        console.error("ERROR: Article library not found or corrupted!");
                        return;

                    }

                    //load referenced resources to database
                    database.resources.articles = {};
                    for (let i=0; i<database.library.articles.length; i++) {

                        database.fileToLib("articles/" + database.library.articles[i],
                            function (data, err) {

                            if (!err)
                                database.resources.articles[database.library.articles[i]] = JSON.parse(data);

                            else
                                console.error("ERROR: The resource requested could not be loaded to the database! " +
                                    "(loadLibrary/articles)");

                        });

                    }

                    //load language file to database
                    database.fileToLib("lang",function(data, err) {

                        if (!err) {

                            database.lang = JSON.parse(data);
                            f.setLanguageLibrary(database.lang);

                        } else {

                            console.error("ERROR: Language file not found or corrupted!");

                        }

                    });

                });

            });

        });

    });

}

//run on initialisation
loadLibrary();