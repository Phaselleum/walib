const f = require("./methods.js"),
    fs = require("fs"),
    h = require("./htmlbase"),
    formidable = require('formidable'),
    PDFImage = require("pdf-image").PDFImage;

const MAX_FILE_SIZE = 1e8; //~100MB


/***
 * @function getGallery - Dynamically creates a HTML page over a given gallery dataset
 *
 * @param {string} galleryid - the id of the gallery resources Array from the corresponding main database object entry
 * @param {Object} resources - the gallery resources Object from the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function getGallery(galleryid, resources, req, res) {

    let gallery = [];
    let name = f.dehyphenate(galleryid);

    if(!resources.hasOwnProperty(galleryid))
        console.error("ERROR: Requested gallery \"" + galleryid + "\" not found.");
    else gallery = resources[galleryid];

    let html = h.getHead(getGalleryJS(), f.lang("Detailed View"), name) +
        "<div id='content'>\n" +
        "    <div id='personspace'>\n" +
        "        <div id='personcontent'>\n" +
        "            <div id='persontitle'>\n" +
        "                <h3>" + f.lang("Gallery") + ": " + name + "</h3>\n" +
        "            </div>\n" +
        "            <div class='persongallery'>\n";

    if(gallery.length > 0) {

        html +="<div class='persongallerylargeelement'>\n";
        html += "<img src='/getImg/galleries/" + galleryid + "/" + gallery[0][0] + "' alt='" + name + "'>";
        html += "<br><p id='galleryDesc'>" + gallery[0][1] + "</p>\n";
        html += "</div>\n";

        for(let i=0;i<gallery.length;i++) {

            html +="<div class='persongalleryelement'>\n";
            html += "<img class='gridc1r2' src='/getImg/galleries/" + galleryid + "/" + gallery[i][0]
                + "' onclick='galleryView(" + i + ");' alt='" + name + "'>\n";
            html += "<span class='gridc1r1'>" + gallery[i][1] + "</span>\n";
            html += "</div>\n";

        }

    }

    html += "</div>\n</div>\n</div>\n</div>\n";
    html += h.getFoot("");

    res.write(html, function () {res.end();});

}


/***
 * @function adminGallery - Creates a HTML page for managing the galleries
 *
 * @param {string[]} library - the gallery library Array from the main database object
 * @param {Object} resources - the resources library Object from the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 *
 * structure of gallery json:
 *
 * Array of entries:
 * -> two entry array:
 *     -> 0: image file name
 *     -> 1: image description
 *
 ***/
function adminGallery(library, resources, req, res) {

    let html = h.getHead(false, "Gallery Management", "Gallery Management Tool",
        "Gallery Management Tool") +
        "<div id='content'>\n" +
        "    <div id='personspace'>\n" +
        "        <div id='personcontent'>\n" +
        "            <div id='persontitle'>\n" +
        "                <h3>Available Galleries</h3>\n" +
        "            </div>\n";

    for(let i=0;i<library.length;i++) {

        let resc = resources[library[i]];

        html += "            <table class='ainfobox' id='g-" + library[i] + "'>\n" +
            "                <thead>\n" +
            "                    <tr id='g-disp-" + library[i] + "'>\n" +
            "                        <td colspan='2'>\n" +
            "                            <b>" + library[i] + "</b>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <img src='up.png' alt='move up' title='move up' " +
            "onclick='moveGalleryCS(\"" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <img src='edit.png' alt='edit' title='edit' " +
            "onclick='actedit(\"#g-disp-" + library[i] + "\",\"#g-edit-" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <input type='checkbox' onclick='actdel(\"#g-d-" + library[i] + "\", this)' " +
            "title='delete?'>\n" +
            "                            <img src='del.png' alt='delete' title='delete' " +
            "onclick='removeGalleryCS(\"" + library[i] + "\")' style='display:none;' id='g-d-" + library[i] + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr id='g-edit-" + library[i] + "' style='display:none;'>\n" +
            "                        <td colspan='2'>\n" +
            "                            <input id='g-e-" + library[i] + "' type='text' value='" + library[i] + "'>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <button onclick='editGalleryCS(\"" + library[i] + "\")'>Edit</button>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                </thead>\n" +
            "                <tbody>";

        for(let j=0;j<resc.length;j++) {

            html += "                    <tr id='g-" + library[i] + "-e-" + j + "'>\n" +
                "                        <td>\n" +
                "                            <img src='/getImg/galleries/" + library[i] + "/" + resc[j][0] + "' " +
                "alt='" + resc[j][0] + "'>\n" +
                "                        </td>\n" +
                "                        <td>\n" +
                "                            " + resc[j][1] + "\n" +
                "                        </td>\n" +
                "                        <td>\n" +
                "                            <img src='up.png' alt='move up' title='move up' " +
                "onclick='moveGalleryElementCS(\"" + library[i] + "\", \"" + j + "\")'>\n" +
                "                        </td>\n" +
                "                        <td>\n" +
                "                            <img src='edit.png' alt='edit' title='edit' " +
                "onclick='actedit(\"#g-" + library[i] + "-e-" + j + "\", " +
                "\"#g-edit-" + library[i] + "-e-" + j + "\")'>\n" +
                "                        </td>\n" +
                "                        <td>\n" +
                "                            <input type='checkbox' " +
                "onclick='actdel(\"#g-" + library[i] + "-e-d-" + j + "\", this)' title='delete?'>\n" +
                "                            <img id='g-" + library[i] + "-e-d-" + j + "' src='del.png' alt='delete' " +
                "title='delete' onclick='removeGalleryElementCS(\"" + library[i] + "\", \"" + j + "\")' " +
                "style='display:none;'>\n" +
                "                        </td>\n" +
                "                    </tr>\n" +
                "                    <tr id='g-edit-" + library[i] + "-e-" + j + "' style='display:none;'>\n" +
                "                        <td>\n" +
                "                            <img src='/getImg/galleries/" + library[i] + "/" + resc[j][0] + "' " +
                "alt='" + resc[j][0] + "'>\n" +
                "                        </td>\n" +
                "                        <td>\n" +
                "                            <input id='g-edit-" + library[i] + "-e-" + j + "i' type='text' " +
                "value='" + resc[j][1] + "'>\n" +
                "                        </td>\n" +
                "                        <td colspan='3'>\n" +
                "                            <button " +
                "onclick='editGalleryElementCS(\"" + library[i] + "\", \"" + j + "\")'>Edit</button>\n" +
                "                        </td>\n" +
                "                    </tr>\n";

        }

        html += "                    <tr id='g-ae-" + library[i] + "'>\n" +
            "                        <td>\n" +
            "                            <input id='g-ae-f-" + library[i] + "' type='file'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <input id='g-ae-d-" + library[i] + "' type='text' " +
            "placeholder='description'>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <button onclick='addGalleryElementCS(\"" + library[i] + "\")'>Add" +
            "</button>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                </tbody>\n" +
            "            </table>\n";

    }

    html += "            <table class='ainfobox'>\n" +
        "                <thead>\n" +
        "                    <tr>\n" +
        "                        <td colspan='2'>\n" +
        "                            <input id='g-a-name' type='text' placeholder='name'>\n" +
        "                        </td>\n" +
        "                        <td colspan='3'>\n" +
        "                            <button onclick='addGalleryCS()'>Add</button>\n" +
        "                        </td>\n" +
        "                    </tr>\n" +
        "                </thead>\n" +
        "            </table>\n" +
        "            <div style='text-align:center;'><a href='/panel'>return to admin page</a></div>" +
        "       </div>\n" +
        "   </div>\n" +
        "</div>\n" +
        "<script src='nomad.js'></script>\n" +
        h.getFoot(false);

    res.write(html, function () {res.end();});

}


/***
 * @function addGallery - adds a gallery to the database and file system
 *
 * @param {string} name - Name of the gallery to add
 * @param {Object} database - the main database object
 * @param {string[]} forbiddenNames - Array of names blocked by the system or plugins
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 *
 ***/
function addGallery(name, database, forbiddenNames, req, res) {

    let library = database.library.galleries,
        resources = database.resources.galleries;

    console.log("New gallery creation request: " + name);

    if(!library.includes(name) && !forbiddenNames.includes(name) && !name.includes(".")) {

        library.push(name);
        resources[name] = [];

        database.libToFile("gallery-library", JSON.stringify(library), function(err) {

            database.libToFile("galleries/" + name, "[]", function(err2) {

                fs.mkdir("data/galleries/" + name, function(err3) {

                    if(err || err2 || err3)
                        res.write("Error while writing to disk!;" + err + ";" + err2 + ";" + err3,
                            function(){res.end();});

                    else res.write("SUCCESS!", function(){res.end();});

                });

            });

        });

    } else res.write("ERROR: A gallery of this name already exists or is disallowed!", function(){res.end();});

}


/***
 * @function removeGallery - removes a gallery from the database and file system
 *
 * @param {string} name - Name of the gallery to remove
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function removeGallery(name, database, req, res) {

    let library = database.library.galleries,
        resources = database.resources.galleries;

    console.log("New gallery deletion request: " + name);

    if(library.includes(name)) {

        library.splice(library.indexOf(name), 1);
        delete resources[name];

        database.libToFile("gallery-library", JSON.stringify(library), function(err){

            fs.unlink("data/galleries/" + name + ".json", function(err2){

                fs.rmdir("data/galleries/" + name, function(err3){

                    if(err || err2 || err3)
                        res.write("Error while writing to disk!;" + err + ";" + err2 + ";" + err3,
                            function(){res.end();});

                    else res.write("SUCCESS!", function(){res.end();});

                });

            });

        });

    } else res.write("ERROR: A gallery of this name does not exist!", function(){res.end();});

}


/***
 * @function editGallery - changes a gallery's name in the database and updates the files in the file system
 *
 * @param {string} oldName - Name of the gallery to change from
 * @param {string} newName - Name of the gallery to change to
 * @param {Object} database - the main database object
 * @param {string[]} forbiddenNames - Array of names blocked by the system or plugins
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 *
 ***/
function editGallery(oldName, newName, database, forbiddenNames, req, res) {

    let library = database.library.galleries,
        resources = database.resources.galleries;

    console.log("New gallery renaming request: " + oldName + "->" + newName);

    if(library.includes(oldName)) {

        if(!library.includes(newName) && !forbiddenNames.includes(newName) && !newName.includes(".")) {

            library.splice(library.indexOf(oldName), 1, newName);

            if (oldName !== newName) {

                Object.defineProperty(resources, newName, Object.getOwnPropertyDescriptor(resources, oldName));
                delete resources[oldName];

            }

            database.libToFile("gallery-library", JSON.stringify(library), function(err){

                database.libToFile("galleries/" + oldName, JSON.stringify(resources[newName]),
                    function(err2){

                    fs.rename("data/galleries/" + oldName + ".json",
                        "data/galleries/" + newName + ".json", function(err3) {

                        fs.rename("data/galleries/" + oldName,"data/galleries/" + newName,
                            function(err4) {

                                if (err || err2 || err3 || err4)
                                    res.write("Error while writing to disk!;" + err + ";" + err2 + ";" + err3 +
                                        ";" + err4, function() {res.end();});

                                else res.write("SUCCESS!", function() {res.end();});

                            });

                        });

                    });

            });

        } else res.write("ERROR: A gallery of this name already exists or is disallowed!",
            function(){res.end();});

    } else res.write("ERROR: A gallery of this name does not exist!", function(){res.end();});

}


/***
 * @function moveGallery - moves the position of a gallery within the database and up by one position
 *
 * @param {string} name - Name of the gallery to move
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function moveGallery(name, database, req, res) {

    let library = database.library.galleries;

    console.log("New gallery move request: " + name);

    if(library.includes(name)) {

        if (library.indexOf(name) > 0)
            library.splice(library.indexOf(name) - 1, 0, library.splice(library.indexOf(name), 1)[0]);

        database.libToFile("gallery-library", JSON.stringify(library), function (err) {

            if (err) res.write("Error while writing to disk!;" + err, function () {
                res.end();
            });
            else res.write("SUCCESS!", function () {
                res.end();
            });

        });

    } else res.write("ERROR: A gallery of this name does not exist!", function(){res.end();});

}


/***
 * @function addGalleryElement - add an image to the gallery and updates database and file system
 *
 * @param {string} name - Name of the gallery to add to
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function addGalleryElement(name, database, req, res) {

    let resources = database.resources.galleries;

    if (req.method === "POST") {

        console.log("POST request received.");

        let form = formidable.IncomingForm(),
            field = "",
            fileName = "",
            error = "";

        form.parse(req);

        form.on("field", function(key, value){

            console.log("Field received: " + key + "=>" + value);

            if(key === "desc")
                field = value;

        });

        form.on("fileBegin", function(key, file) {

            fileName = file.name;
            file.path = "data/galleries/" + name + "/" + file.name;

        });

        form.on("file", function (key, file) {

            console.log("File received: " + file.name);

            if(file.size > MAX_FILE_SIZE) {

                res.writeHead(413,{"Content-Type": "text/html"});
                res.write("The file is too large!");
                error += "413[MAX_FILE_SIZE_EXCEEDED];";

            }

            res.write("File uploaded!\n");

        });

        req.on("end", function () {

            console.log("POST request ended: " + fileName + ":" + field);

            resources[name].push([fileName, field]);

            database.libToFile("galleries/" + name, JSON.stringify(resources[name]),function(err){

                if(err) {

                    res.write("\nError while writing to disk!;" + err);
                    error += err + ";";

                }

                if(error === "") res.write("File uploaded successfully!", function(){res.end();});
                else res.write("The following errors were thrown:\n" + error, function(){res.end();});

            });

        });

        form.on("error", function (err) {

            res.write("\nError while uploading file(s)!;" + err, function(){res.end();});

        });

    } else {

        //Only allow POST connections here
        res.writeHead(405,{"Allow": "POST"});
        res.write("Only POST connections allowed here!", function(){res.end();});

    }

}


/***
 * @function removeGalleryElement - removes an image from the gallery and updates database and file system
 *
 * @param {string} name - Name of the gallery to remove from
 * @param {string} id - Id of the gallery element to remove
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function removeGalleryElement(name, id, database, req, res) {

    let resources = database.resources.galleries;

    if(resources.hasOwnProperty(name) && resources[name].length >= id) {

        let fileName = resources[name][id][0];
        resources[name].splice(id, 1);

        database.libToFile("galleries/" + name, JSON.stringify(resources[name]),function(err){

            fs.unlink("data/galleries/" + name + "/" + fileName,function(err2){

                if(err || err2)
                    res.write("Error while writing to disk!;" + err + ";" + err2, function(){res.end();});

                else res.write(data, function(){res.end();});

            });

        });

    } else res.write("Element removal failed. The element was not found.", function(){res.end();});

}


/***
 * @function editGalleryElement - edit an element within a gallery
 *
 * @param {string} name - Name of the gallery to remove from
 * @param {string} id - Id of the gallery element to remove
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function editGalleryElement(name, id, database, req, res) {

    let resources = database.resources.galleries;

    if (req.method === "POST") {

        console.log("POST request received.");

        let form = formidable.IncomingForm(),
            field = "";

        form.parse(req);

        form.on("field", function(key, value){

            console.log("Field received: " + key + "=>" + value);

            if(key === "desc") field = value;

        });

        req.on("end", function () {

            console.log("POST request ended: " + field);

            resources[name][id][1] = field;

            database.libToFile("galleries/" + name,
                JSON.stringify(resources[name]),function(err){

                    if(err) res.write("\nError while writing to disk!;" + err,function(){res.end();});
                    else res.write("Data successfully received!", function(){res.end();});

                });

        });

        form.on("error", function (err) {

            res.write("\nError while uploading file(s)!;" + err, function(){res.end();});

        });

    } else {

        //Only allow POST connections here
        res.writeHead(405,{"Allow": "POST"});
        res.write("Only POST connections allowed here!", function(){res.end();});

    }

}


/***
 * @function moveGalleryElement - move an image within a gallery, updating the database
 *
 * @param {string} name - Name of the gallery to remove from
 * @param {string} id - Id of the gallery element to remove
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function moveGalleryElement(name, id, database, req, res) {

    let library = database.library.galleries,
        resources = database.resources.galleries;

    if(resources.hasOwnProperty(name) && resources[name].length >= id) {

        if(id !== "0") resources[name].splice(id - 1, 0, resources[name].splice(id, 1)[0]);

        database.libToFile("gallery-library", JSON.stringify(library),function(err) {

            if (err) res.write("Error while writing to disk!;" + err + ";" + data,function () {res.end();});
            else res.write(data, function () {res.end();});

        });

    } else res.write("Element moving failed. The element was not found.", function(){res.end();});

}


/***
 * @function getGallery - Dynamically creates a HTML page over a given multipage document / pdf dataset
 *
 * @param {string} docid - the id of the document resources Array from the corresponding main database object entry
 * @param {Object} resources - the document resources Object from the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function getDocument(docid, resources, req, res) {

    let name = "MISSINGNAME",
        document = {};

    if(!resources.hasOwnProperty(docid))
        console.error("ERROR: Requested document \"" + docid + "\" not found.");
    else document = resources[docid]

    if(document.hasOwnProperty("name"))
        name = document.name;

    let html = h.getHead(getBookReaderHead(), f.lang("Detailed View"), name) +
        "<div id='content'>\n" +
        "    <div id='personspace'>\n" +
        "        <div id='personcontent'>\n" +
        "            <div id='persontitle'>\n" +
        "                <h3>" + name + "</h3>\n" +
        "            </div>\n" +
        "            <div id='persondescription'>\n" +
        "                <div id='BookReader'>\n" +
        "                    Internet Archive BookReader Demo<br/>\n" +
        "                    <noscript>\n" +
        "                        <p>The BookReader requires JavaScript to be enabled. Please check that your browser" +
        " supports JavaScript and that it is enabled in the browser settings.  You can also try one of the" +
        " <a href='https://archive.org/details/goodytwoshoes00newyiala'> other formats of the book</a>." +
        "                        </p>\n" +
        "                    </noscript>\n" +
        "                </div>\n" +
        "                <script>" + getBookScript(document) + "</script>\n" +
        "                <table>\n" +
        "                    <tbody>\n";

    if(document.hasOwnProperty("authors")) {

        let a_ = f.lang("Author");

        if(document.authors.length !== 1)
            a_ = f.lang("Authors");

        html += "<tr>\n<th>" + a_ + "</th>\n<td>" + document.authors.join("<br>\n") + "</td>\n</tr>\n";
        html += "</td>\n</tr>\n";

    }

    if(document.hasOwnProperty("coauthors"))
        html += "<tr>\n<th>" + f.lang("Co-Authors") + "</th>\n<td>" + document.coauthors.join("<br>\n") +
            "</td>\n</tr>\n";

    if(document.hasOwnProperty("pageCount"))
        html += "<tr>\n<th>" + f.lang("Pages") + "</th>\n<td>" + document.pageCount + "</td>\n</tr>\n";

    if(document.hasOwnProperty("date"))
        html += "<tr>\n<th>" + f.lang("Date") + "</th>\n<td>" + f.stringToDate(document.date,'c') +
            "</td>\n</tr>\n";

    if(document.hasOwnProperty("file"))
        html += "<tr>\n<th>" + f.lang("File") + "</th>\n<td><a href='/getDoc/documents/" + document.file
            + "' target='_blank'>" + document.file + "</a></td>\n</tr>\n";

    if(document.hasOwnProperty("description"))
        html += "<tr>\n<th>" + f.lang("Description") + "</th>\n<td>" + document.description + "</td>\n</tr>\n";

    if(document.hasOwnProperty("seealso")) {

        html += "<tr>\n<th>" + f.lang("See Also") + "</th>\n<td>";

        for(let i=0; i<document.seealso.length; i++) {

            let res = resources[document.seealso[i]];
            html += "<a href='/" + document.seealso[i] + "'>";

            if(res.hasOwnProperty("authors"))
                html += res.authors.join(", ") + ": ";
            else html += "[" + f.lang("unknown") + "]: ";

            if(res.hasOwnProperty("name"))
                html += res.name + ". ";
            else html += "[" + document.seealso[i] + "]. ";

            if(res.hasOwnProperty("date"))
                html += res.date;

            html += "</a><br>\n";

        }

        html += "</td>\n</tr>\n";

    }

    if(document.hasOwnProperty("contributor"))
        html += "<tr>\n<th>" + f.lang("Contributor") + "</th>\n<td>" + document.contributor + "</td>\n</tr>\n";

    html += "</tbody>\n</table>\n";
    html += "</div>\n</div>\n</div>\n";
    html += h.getFoot("");

    res.write(html, function () {res.end();});
}


/***
 * @function adminDocument - Creates a HTML page for managing the documents
 *
 * @param {string[]} library - the document library Array from the main database object
 * @param {Object} resources - the document resources Object from the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 *
 * structure of document json (json name is hyphenated "name" entry):
 *
 * name: given name
 * authors: Array of authors
 * coauthors: Array of coauthors
 * pageCount: number of pages in document
 * date: given date of creation, ideally in the format yyyymmdd
 * file: filename of the pdf
 * description: file description
 * contributor: given name of the uploader
 * seealso: Array of ids of related documents
 *
 ***/
function adminDocument(library, resources, req, res) {

    let html = h.getHead(false, "Document Management", "Document Management Tool",
        "Document Management Tool") +
        "<div id='content'>\n" +
        "    <div id='personspace'>\n" +
        "        <div id='personcontent'>\n" +
        "            <div id='persontitle'>\n" +
        "                <h3>Available Documents</h3>\n" +
        "            </div>\n";

    for(let i=0;i<library.length;i++) {

        let resc = resources[library[i]];

        html += "            <table class='ainfobox' id='g-" + library[i] + "'>\n" +
            "                <thead>\n" +
            "                    <tr id='g-disp-" + library[i] + "'>\n" +
            "                        <td colspan='2'>\n" +
            "                            <b>" + resc.name + "</b>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <img src='up.png' alt='move up' title='move up' " +
            "onclick='moveDocumentCS(\"" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <img src='edit.png' alt='edit' title='edit' " +
            "onclick='actedit(\"#g-disp-" + library[i] + "\",\"#g-edit-" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <input type='checkbox' onclick='actdel(\"#g-d-" + library[i] + "\", this)' " +
            "title='delete?'>\n" +
            "                            <img src='del.png' alt='delete' title='delete' " +
            "onclick='removeDocumentCS(\"" + library[i] + "\")' style='display:none;' id='g-d-" + library[i] + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr id='g-edit-" + library[i] + "' style='display:none;'>\n" +
            "                        <td colspan='2'>\n" +
            "                            <input id='g-e-" + library[i] + "' type='text' value='" + resc.name + "'>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <button onclick='editDocumentCS(\"" + library[i] + "\")'>Edit</button>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                </thead>\n" +
            "                <tbody>\n" +
            "                    <tr id='g-" + library[i] + "-add-doc-b'>\n" +
            "                        <td colspan='5'>\n" +
            "                            <button onclick='actedit(\"#g-" + library[i] + "-add-doc-b\"," +
            "\"#g-" + library[i] + "-add-doc\")'>Replace document</button>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr id='g-" + library[i] + "-add-doc' style='display:none;'>\n" +
            "                        <td colspan='5'>\n" +
            "                            <input id='g-" + library[i] + "-f-in' type='file' accept='.pdf'>\n" +
            "                            <button onclick='uploadDocumentCS(\"" + library[i] + "\")'>Upload</button><br>\n" +
            "                            <p>This might take a few seconds, please be patient!</p>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td colspan='2'>\n" +
            "                            <label for='g-" + library[i] + "-author-in'>authors</label>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <input id='g-" + library[i] + "-author-in' type='text' " +
            "placeholder='author1,author2,author3' value='" + resc.authors + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td colspan='2'>\n" +
            "                            <label for='g-" + library[i] + "-coauthor-in'>co-authors</label>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <input id='g-" + library[i] + "-coauthor-in' type='text' " +
            "placeholder='coauthor1,coauthor2,coauthor3' value='" + resc.coauthors + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td colspan='2'>\n" +
            "                            <label for='g-" + library[i] + "-date-in'>date (yyyy(mm(dd)))</label>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <input id='g-" + library[i] + "-date-in' type='text' " +
            "placeholder='year' value='" + resc.date + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td colspan='2'>\n" +
            "                            <label for='g-" + library[i] + "-desc-in'>description</label>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <textarea id='g-" + library[i] + "-desc-in'>" + resc.description +
            "</textarea>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td colspan='2'>\n" +
            "                            <label for='g-" + library[i] + "-contributor-in'>contributor</label>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <input id='g-" + library[i] + "-contributor-in' type='text' " +
            "value='" + resc.contributor + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td colspan='2'>\n" +
            "                            <label for='g-" + library[i] + "-seealso-in'>see also</label>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <input id='g-" + library[i] + "-seealso-in' type='text' " +
            "placeholder='doc1,doc2,doc3' value='" + resc.seealso + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr>\n" +
            "                        <td colspan='5'>\n" +
            "                            <button onclick='editDocumentMetaCS(\"" + library[i] + "\")'>Update metadata" +
            "</button>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                </tbody>\n" +
            "            </table>\n";

    }

    html += "            <table class='ainfobox'>\n" +
        "                <thead>\n" +
        "                    <tr id='g-add-doc'>\n" +
        "                        <td colspan='5'>\n" +
        "                            <input id='g-f-in' type='file' accept='.pdf'>\n" +
        "                            <p>This might take a few seconds, please be patient!</p>\n" +
        "                        </td>\n" +
        "                    </tr>\n" +
        "                    <tr>\n" +
        "                        <td colspan='2'>\n" +
        "                            <input id='g-a-name' type='text' placeholder='name'>\n" +
        "                        </td>\n" +
        "                        <td colspan='3'>\n" +
        "                            <button onclick='addDocumentCS()'>Add</button>\n" +
        "                        </td>\n" +
        "                    </tr>\n" +
        "                </thead>\n" +
        "            </table>\n" +
        "            <div style='text-align:center;'><a href='/panel'>return to manager</a></div>" +
        "       </div>\n" +
        "   </div>\n" +
        "</div>\n" +
        "<script src='nomad.js'></script>\n" +
        h.getFoot(false);

    res.write(html,function(){res.end();});

}


/***
 * @function addDocument - adds a document to the database and file system
 *
 * @param {Object} database - the main database object
 * @param {string[]} forbiddenNames - Array of names blocked by the system or plugins
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function addDocument(database, forbiddenNames, req, res) {

    let library = database.library.documents,
        resources = database.resources.documents;

    console.log("New document creation request.");

    if (req.method === "POST") {

        console.log("POST request received.");

        let form = formidable.IncomingForm(),
            field = "",
            fileName = "",
            error = "";

        form.parse(req);

        form.on("field", function(key, value){

            console.log("Field received: " + key + "=>" + value);

            if(key === "name") field = value;

        });

        form.on("fileBegin", function(key, file) {

            fileName = file.name;
            file.path = "data/documents/" + file.name;

        });

        form.on("file", function (key, file) {

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

            if(!library.includes(docId) && !forbiddenNames.includes(docId) && !docId.includes(".")) {

                library.push(docId);
                resources[docId] = {
                    name: field,
                    authors: [],
                    coauthors: [],
                    pageCount: "",
                    date: "",
                    file: "",
                    description: "",
                    contributor: "",
                    seealso: []
                };

                resources[docId]["file"] = fileName;

                let pdfimg = new PDFImage("data/documents/" + docId + "/" + fileName);

                pdfimg.numberOfPages().then(function(pageCount){

                    resources[docId]["pageCount"] = pageCount;

                });

                database.libToFile("documents/" + docId, JSON.stringify(resources[docId]),
                    function (err) {

                    database.libToFile("document-library", JSON.stringify(library), function (err2) {

                        fs.mkdir("data/documents/" + docId, function (err3) {

                            pdfimg.convertFile().then(function () {

                                console.log("Document successfully converted to images!");

                                if (err || err2 || err3)
                                    res.write("Error while writing to disk!;" + err + ";" + err2 + ";" +
                                        err3, function () {res.end();});

                                else res.write("SUCCESS!", function () {res.end();});

                            }, function(error) {

                                console.log("Document conversion failed!");

                                if (err || err2 || err3)
                                    res.write("Error while writing to disk!;" + err + ";" + err2 + ";" +
                                        err3 + ";" + error, function () {res.end();});

                                else res.write("SUCCESS!", function () {res.end();});

                            });

                        });

                    });

                });

            } else res.write("ERROR: A document of this name already exists or is disallowed!", function(){res.end();});

        });

        form.on("error", function (err) {

            res.write("\nError while uploading file(s)!;" + err,function(){res.end();});

        });

    } else {

        //Only allow POST connections here
        res.writeHead(405,{"Allow": "POST"});
        res.write("Only POST connections allowed here!",function(){res.end();});

    }

}


/***
 * @function removeDocument - removes a document from the database and file system
 *
 * @param {string} name - the id of the document to be removed
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function removeDocument(name, database, req, res) {

    let library = database.library.documents,
        resources = database.resources.documents;

    console.log("New document deletion request: " + name);

    if(library.includes(name)) {

        let fileName = "";

        if(resources[name].hasOwnProperty("file")) fileName = resources[name].file + "";

        library.splice(library.indexOf(name), 1);
        delete resources[name];

        database.libToFile("document-library", JSON.stringify(library), function(err){

            fs.unlink("data/documents/" + name + ".json", function(err2){

                fs.unlink("data/documents/" + fileName, function(err3){

                    fs.rmdir("data/documents/" + name, function(err4){

                        if(err || err2 || err3 || err4)
                            res.write("Error while writing to disk!;" + err + ";" + err2 + ";" + err3 + ";" +
                                err4, function(){res.end();});

                        else res.write("SUCCESS (" + fileName + ")!", function(){res.end();});

                    });

                });

            });

        });

    } else res.write("ERROR: A document of this name does not exist!", function(){res.end();});

}


/***
 * @function editDocument - changes a document name and updates database and filesystem
 *
 * @param {string} oldName - the id of the document to be changed from
 * @param {string} newName - the id of the document to be changed to
 * @param {Object} database - the main database object
 * @param {string[]} forbiddenNames - Array of names blocked by the system or plugins
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function editDocument(oldName, newName, database, forbiddenNames, req, res) {

    let library = database.library.documents,
        resources = database.resources.documents;

    console.log("New document renaming request: " + oldName + "->" + newName);

    if(library.includes(oldName)) {

        if(!library.includes(newName) && !forbiddenNames.includes(newName) && !newName.includes(".")) {

            library.splice(library.indexOf(oldName), 1, newName);

            if (oldName !== newName) {

                Object.defineProperty(resources, newName, Object.getOwnPropertyDescriptor(resources, oldName));
                delete resources[oldName];
                resources[newName].name =
                    f.dehyphenate(newName);

            }

            database.libToFile("document-library", JSON.stringify(library), function(err){

                database.libToFile("documents/" + oldName, JSON.stringify(resources[newName]),
                    function(err2){

                    fs.rename("data/documents/" + oldName + ".json",
                        "data/documents/" + newName + ".json", function(err3) {

                        fs.rename("data/documents/" + oldName, "data/documents/" + newName,
                            function(err4) {

                            if (err || err2 || err3 || err4)
                                res.write("Error while writing to disk!;" + err + ";" + err2 + ";" + err3 + ";" +
                                    err4, function() {res.end();});

                            else res.write(data, function() {res.end();});

                        });

                    });

                });

            });

        } else res.write("ERROR: A document of that name already exists or is disallowed!",
            function(){res.end();});

    } else res.write("ERROR: A document of that name does not exist!", function(){res.end();});

}


/***
 * @function moveDocument - moves the position of a document within the library and file system up by one position
 *
 * @param {string} name - the id of the document to be moved
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function moveDocument(name, database, res, req) {

    let library = database.library.documents;

    console.log("New document move request: " + name);

    if(library.includes(name)) {

        if(library.indexOf(name) > 0)
            library.splice(library.indexOf(name) - 1, 0,
                library.splice(library.indexOf(name), 1)[0]);

        database.libToFile("document-library", JSON.stringify(library), function(err){

            if(err) res.write("Error while writing to disk!;" + err, function(){res.end();});
            else res.write(data, function(){res.end();});

        });

    } else res.write("ERROR: A document of that name does not exist!", function(){res.end();});

}


/***
 * @function uploadDocument - replaces the file of a document in the database and file system
 *
 * @param {string} name - the id of the document to be uploaded
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function uploadDocument(name, database, req, res) {

    let resources = database.resources.documents;

    console.log("New document upload request.");

    if (req.method === "POST") {

        console.log("POST request received.");

        let form = formidable.IncomingForm(),
            fileName = "",
            error = "";

        form.parse(req);

        form.on("fileBegin", function(key, file) {

            fileName = file.name;
            file.path = "data/documents/" + name + "/" + file.name;

        });

        form.on("file", function (key, file) {

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

            resources[name]["file"] = fileName;

            database.libToFile("documents/" + name, JSON.stringify(resources[name]),function(err){

                if(err) {

                    res.write("\nError while writing to disk!;" + err);
                    error += err + ";";

                }

                let pdfimg = new PDFImage("data/documents/" + name + "/" + fileName);

                resources[name]["pageCount"] = pdfimg.numberOfPages();

                pdfimg.convertFile().then(function () {

                    console.log("Document successfully converted to images!");

                    if(error === "") res.write("File uploaded successfully!", function(){res.end();});
                    else res.write("The following errors were thrown:\n" + error, function(){res.end();});

                });

            });

        });

        form.on("error", function (err) {

            res.write("\nError while uploading file(s)!;" + err + ";" + data,function(){res.end();});

        });

    } else {

        //Only allow POST connections here
        res.writeHead(405,{"Allow": "POST"});
        res.write("Only POST connections allowed here!",function(){res.end();});

    }

}


/***
 * @function editDocumentMeta - edits the metadata of a document and updates the database and filesystem
 *
 * @param {string} name - the id of the document to be edited
 * @param {Object} database - the main database object
 * @param {IncomingMessage} req - request Object created by the http.Server Object
 * @param {ServerResponse} res - response Object created by the http.Server Object
 ***/
function editDocumentMeta(name, database, req, res) {

    let resources = database.resources.documents;

    console.log("New document meta edit request.");

    if (req.method === "POST") {

        console.log("POST request received.");

        let form = formidable.IncomingForm(),
            fields = {};

        form.parse(req);

        form.on("field", function(key, value){

            console.log("Field received: " + key + "=>" + value);

            fields[key] = value;

        });

        req.on("end", function () {

            console.log("POST request ended: " + fields);

            if(fields.hasOwnProperty("author")) resources[name]["authors"] = fields.author.split(",");
            if(fields.hasOwnProperty("coauthor")) resources[name]["coauthors"] = fields.coauthor.split(",");
            if(fields.hasOwnProperty("date")) resources[name]["date"] = fields.date;
            if(fields.hasOwnProperty("desc")) resources[name]["description"] = fields.desc;
            if(fields.hasOwnProperty("contributor")) resources[name]["contributor"] = fields.contributor;
            if(fields.hasOwnProperty("seealso")) resources[name]["seealso"] = fields.seealso.split(",");

            res.write("Document updated successfully!", function(){res.end();});

        });

        form.on("error", function (err) {

            res.write("\nError while updating document!;" + err, function(){res.end();});

        });

    } else {

        //Only allow POST connections here
        res.writeHead(405,{"Allow": "POST"});
        res.write("Only POST connections allowed here!",function(){res.end();});

    }

}


//returns the customised Javascript settings for the BookReader
function getBookScript(document) {

    let script = "var options={\n" +
        "getNumLeafs:function() {return'$pagecount$'},\n" +
        "getPageWidth:function() {return 800},\n" +
        "getPageHeight:function() {return 1200},\n" +
        "getPageURI:function(a) {var b=(a+1).toString(),\n" +
        "c=new RegExp('0{'+b.length+'}$'),\n" +
        "d='getPage/$bookid$/page'+'000'.replace(c,b)+'.jpg';return d},\n" +
        "getPageSide:function(a) {return 0==(1&a)?'R':'L'},\n" +
        "getSpreadIndices:function(a) {var b=[null,null];return'rl'===this.pageProgression?'R'===this.getPageSide(a)?" +
        "(b[1]=a,b[0]=a+1):(b[0]=a,b[1]=a-1):'L'===this.getPageSide(a)?(b[0]=a,b[1]=a+1):(b[1]=a,b[0]=a-1),b},\n" +
        "getPageNum:function(a) {return a+1},\n" +
        "bookTitle:'$booktitle$',\n" +
        "bookUrl:null,bookUrlText:null,bookUrlTitle:null,thumbnail:null,\n" +
        "metadata:[{label:'Title',value:'$booktitle$'},{label:'Author',value:'$bookauthor$'}," +
        "{label:'Demo Info',value:null}],\n" +
        "enableMobileNav:!1,mobileNavTitle:'BookReader',imagesBaseURL:'BookReader/images/',\n" +
        "getEmbedCode:function() {return'Embed code not supported.'},ui:'full'},\n" +
        "br=new BookReader(options);br.init();";

    if(document.hasOwnProperty("pageCount"))
        script = script.replace("$pagecount$",document.pageCount);
    else script = script.replace("$pagecount$","100");

    if(document.hasOwnProperty("id"))
        script = script.replace("$bookid$",document.id);
    else script = script.replace("$bookid$","0");

    if(document.hasOwnProperty("title"))
        script = script.replace("$booktitle$",document.title);
    else script = script.replace("$booktitle$","[Titel]");

    if(document.hasOwnProperty("authors"))
        script = script.replace("$bookauthor$",document.authors.join(", "));
    else script = script.replace("$bookauthor$","[Autor]");

    return script;

}

function getBookReaderHead() {

    return "<script src='BookReader/jquery-1.10.1.js'></script>\n" +
        "<script src='BookReader/jquery-ui-1.12.0.min.js'></script>\n" +
        "<script src='BookReader/jquery.browser.min.js'></script>\n" +
        "<script src='BookReader/dragscrollable-br.js'></script>\n" +
        "<script src='BookReader/jquery.colorbox-min.js'></script>\n" +
        "<script src='BookReader/jquery.bt.min.js'></script>\n" +
        "<link rel='stylesheet' href='BookReader/BookReader.css'/>\n" +
        "<script src='BookReader/BookReader.js'></script>\n" +
        "<script type='text/javascript' src='BookReader/plugins/plugin.url.js'></script>\n" +
        "<link rel='stylesheet' href='BookReaderDemo.css'/>\n";

}

function getGalleryJS() {

    return "<script>function galleryView(i) {" +
        "let e=$('.persongalleryelement').get(i);" +
        "$('.persongallerylargeelement img').attr('src',e.getElementsByClassName('gridc1r2')[0].getAttribute('src'));" +
        "$('.persongallerylargeelement p').html(e.getElementsByClassName('gridc1r1')[0].innerHTML);" +
        "}</script>";

}


/* ************************************************************ *
 * *Methods reuired by node_server for dynamic implementation** *
 * ************************************************************ */


function getURLParts() {

    return [
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
        "document-edit-meta"
    ];

}

function publicSubFolders() {

    return ["BookReader"];

}

function getPanelItems() {

    return [{name: "manage galleries", url: "gallery-admin"}, {name: "manage documents", url: "document-admin"}];

}

function getIndexItems(resources) {

    let items = {Documents: [], Galleries: []};
    let i = 0;

    for(const item in resources.galleries) {

        items.Galleries[i++] = {name: item, url: "/gallery/" + item};

    }

    i = 0;

    for(const item in resources.documents) {

        items.Documents[i++] = {name: item, url: "/document/" + item};

    }

    return items;

}

function handleURL(url, admin, req, res, nameList, database) {

    let galLib = database.library.galleries,
        galRes = database.resources.galleries,
        docLib = database.library.documents,
        docRes = database.resources.documents;

    switch(url[0]) {

        case "gallery": getGallery(url[1], galRes, req, res); break;
        case "document": getDocument(url[1], docRes, req, res); break;

        case "gallery-admin": if(admin) adminGallery(galLib, galRes, req, res); break;
        case "gallery-add": if(admin) addGallery(url[1], database, nameList, req, res); break;
        case "gallery-remove": if(admin) removeGallery(url[1], database, req, res); break;
        case "gallery-edit": if(admin) editGallery(url[1], url[2], database, nameList, req, res); break;
        case "gallery-move": if(admin) moveGallery(url[1], database, req, res); break;
        case "gallery-add-element": if(admin) addGalleryElement(url[1], database, req, res); break;
        case "gallery-remove-element": if(admin) removeGalleryElement(url[1], url[2], database, req, res); break;
        case "gallery-edit-element": if(admin) editGalleryElement(url[1], url[2], database, req, res); break;
        case "gallery-move-element": if(admin) moveGalleryElement(url[1], url[2], database, req, res); break;

        case "document-admin": if(admin) adminDocument(docLib, docRes, req, res); break;
        case "document-add": if(admin) addDocument(database, nameList, req, res); break;
        case "document-remove": if(admin) removeDocument(url[1], database, req, res); break;
        case "document-edit": if(admin) editDocument(url[1], url[2], database, nameList, req, res); break;
        case "document-move": if(admin) moveDocument(url[1], database, req, res); break;
        case "document-upload": if(admin) uploadDocument(url[1], database, req, res); break;
        case "document-edit-meta": if(admin) editDocumentMeta(url[1], database, req, res); break;

    }

    //Catch and redirect unauthorised access
    if(!admin && !(url[0] === "gallery" || url[0] === "document"))
        return res.writeHead(302, {'Location': 'index.html'}).end();

}

function loadDatabase(database){

    //load gallery library to database
    database.fileToLib("gallery-library",function(data, err) {

        if (!err) {

            database.library.galleries = JSON.parse(data);
            console.log("Gallery library successfully loaded!");

        } else console.error("ERROR: Gallery library not found or corrupted. " +
                "The file will be replaced or overwritten if the server is not restarted.");

        //load referenced resources to database
        database.resources.galleries = {};

        for (let i=0; i<database.library.galleries.length; i++) {

            database.fileToLib("galleries/" + database.library.galleries[i], function (data, err) {

                if (!err) database.resources.galleries[database.library.galleries[i]] = JSON.parse(data);
                else console.error("ERROR: The resource requested could not be loaded to the database! " +
                        "(loadLibrary/galleries)");

            });

        }


        //load document library to database
        database.fileToLib("document-library",function(data, err) {

            if (!err) {

                database.library.documents = JSON.parse(data);
                console.log("Document library successfully loaded!");

            } else console.error("ERROR: Document library not found or corrupted! " +
                    "The file will be replaced or overwritten if the server is not restarted.");

            //load referenced resources to database
            database.resources.documents = {};
            
            for (let i=0; i<database.library.documents.length; i++) {

                database.fileToLib("documents/" + database.library.documents[i], function (data, err) {

                    if (!err)
                        database.resources.documents[database.library.documents[i]] = JSON.parse(data);

                    else console.error("ERROR: The resource requested could not be loaded to the database! " +
                            "(loadLibrary/documents)");

                });

            }

        });

    });

}


/* **************************** *
 * ********* EXPORTS ********** *
 * **************************** */


module.exports.getDocument = getDocument;
module.exports.getGallery = getGallery;

module.exports.getURLParts = getURLParts;
module.exports.publicSubFolders = publicSubFolders;
module.exports.getPanelItems = getPanelItems;
module.exports.getIndexItems = getIndexItems;
module.exports.handleURL = handleURL;
module.exports.loadDatabase = loadDatabase;