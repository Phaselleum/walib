const f = require("./methods.js"),
    h = require("./htmlbase");

/***
 * Creates a HTML over a given multipage document / pdf dataset
 * parameters: document: meta data object, name: document name, callback: callback function
 ***/
function getDocument(document, library, callback) {

    let name = "MISSINGNAME";

    if(document.hasOwnProperty("title"))
        name = document.title;

    let html = h.getHead(false, true, f.lang("Detailed View"), name) +
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
        html += "<tr>\n<th>" + f.lang("Co-Authors") + "</th>\n<td>"
            + document.coauthors.join("<br>\n") + "</td>\n</tr>\n";

    if(document.hasOwnProperty("date"))
        html += "<tr>\n<th>" + f.lang("Published") + "</th>\n<td>" + document.date + "</td>\n</tr>\n";

    if(document.hasOwnProperty("document"))
        html += "<tr>\n<th>" + f.lang("File") + "</th>\n<td><a href='getDoc/" + document.document
            + "' target='_blank'>" + document.document + "</a></td>\n</tr>\n";

    if(document.hasOwnProperty("description"))
        html += "<tr>\n<th>" + f.lang("Description") + "</th>\n<td>" + document.description
            + "</td>\n</tr>\n";

    if(document.hasOwnProperty("links")) {

        html += "<tr>\n<th>" + f.lang("See Also") + "</th>\n<td>";

        for(let i=0; i<document.links.length; i++) {

            let res = library[document.links[i]];
            html += "<a href='/" + document.links[i] + "'>";

            if(res.hasOwnProperty("authors"))
                html += res.authors.join(", ") + ": ";

            else html += "[" + f.lang("unknown") + "]: ";

            if(res.hasOwnProperty("title"))
                html += res.title + ". ";

            else html += "[" + document.links[i] + "]. ";

            if(res.hasOwnProperty("date"))
                html += res.date;

            html += "</a><br>\n";

        }

        html += "</td>\n</tr>\n";

    }

    html += "</tbody>\n</table>\n";
    html += "</div>\n</div>\n</div>\n";
    html += h.getFoot(false);
    callback(html);
}


/***
 * Creates a HTML over a given gallery dataset
 * parameters: gallery: meta data object, name: gallery name, callback: callback
 ***/
function getGallery(gallery, name, callback) {

    let html = h.getHead(true, false, f.lang("Detailed View"), name) +
        "<div id='content'>\n" +
        "    <div id='personspace'>\n" +
        "        <div id='personcontent'>\n" +
        "            <div id='persontitle'>\n" +
        "                <h3>" + f.lang("Gallery") + ": " + name + "</h3>\n" +
        "            </div>\n" +
        "            <div class='persongallery'>\n";

    for(let i=0;i<gallery.length;i++) {

        html +="<div class='persongalleryelement'>\n";
        html += "<img class='gridc1r2' src='/getImg/galleries/" + name + "/" + gallery[i][0]
            + "' onclick='lightbox(" + i + ");' alt='" + name + "'>";
        html += "<br><span class='gridc1r1'>" + gallery[i][1] + "</span>\n";
        html += "</div>\n";

    }

    html += "</div>\n</div>\n</div>\n</div>\n";
    html += h.getFoot(true);
    callback(html);

}


/***
 * adds a gallery to the library and file system
 ***/
function addGallery(name, library, resources, forbiddenNames, callback) {

    console.log("New gallery creation request: " + name);

    if(!library.includes(name) && !forbiddenNames.includes(name)) {

        library.push(name);
        resources[name] = [];
        callback("SUCCESS!", false);

    } else {

        console.log("ERROR: A gallery of that name already exists or is disallowed!");

        callback("ERROR: A gallery of this name already exists or is disallowed!", true);

    }

}


/***
 * changes a gallery name
 ***/
function editGallery(oldName, newName, library, resources, forbiddenNames, callback) {

    console.log("New gallery renaming request: " + oldName + "->" + newName);

    if(library.includes(oldName)) {

        if(!library.includes(newName) && !forbiddenNames.includes(newName)) {

            library.splice(library.indexOf(oldName), 1, newName);

            if (oldName !== newName) {

                Object.defineProperty(resources, newName, Object.getOwnPropertyDescriptor(resources, oldName));
                delete resources[oldName];

            }

            callback("SUCCESS!");

        } else {

            console.log("ERROR: A gallery of that name already exists or is disallowed!");

            callback("ERROR: A gallery of this name already exists or is disallowed!", true);

        }

    } else {

        console.log("ERROR: A gallery of that name does not exist!");

        callback("ERROR: A gallery of that name does not exist!", true);

    }

}


/***
 * removes a gallery from the library and file system
 ***/
function removeGallery(name, library, resources, callback) {

    console.log("New gallery deletion request: " + name);

    if(library.includes(name)) {

        library.splice(library.indexOf(name), 1);
        delete resources[name];
        callback("SUCCESS!");

    } else {

        console.log("ERROR: A gallery of that name does not exist!");

        callback("ERROR: A gallery of this name does not exist!", true);

    }

}


/***
 * moves the position of a gallery within the library and file system up by one position
 ***/
function moveGallery(name, library, resources, callback) {

    if(library.indexOf(name) > 0)
        library.splice(library.indexOf(name) - 1, 0, library.splice(library.indexOf(name), 1)[0]);

    callback("SUCCESS!");

}


/***
 * add an image to the gallery
 ***/
function addGalleryElement(name, library, resources, callback) {

    callback("SUCCESS!");

}


/***
 * remove an image from the gallery
 ***/
function removeGalleryElement(name, id, library, resources, callback) {

    if(resources.hasOwnProperty(name) && resources[name].length >= id) {

        let fileName = resources[name][id][0];
        resources[name].splice(id, 1);
        callback(fileName, "SUCCESS!");

    } else
        callback("", "Element removal failed. The element was not found.", true)

}


/***
 * move an image in the gallery
 ***/
function moveGalleryElement(name, id, library, resources, callback) {

    if(resources.hasOwnProperty(name) && resources[name].length >= id) {

        if(id !== "0")
            resources[name].splice(id - 1, 0, resources[name].splice(id, 1)[0]);

        callback("SUCCESS!");

    } else
        callback("Element moving failed. The element was not found.")

}


/***
 * add an image to the gallery
 ***/
function editGalleryElement(name, library, resources, callback) {

    callback("SUCCESS!");

}


/***
 * Creates a HTML page for managing the galleries
 *
 * structure of gallery json:
 *
 * Array of entries:
 * -> two entry array:
 *     -> 0: image file name
 *     -> 1: image description
 *
 ***/
function adminGallery(library, resources, callback) {

    let html = h.getHead(false, false, "Gallery Management Tool",
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
            "onclick='moveGallery(\"" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <img src='edit.png' alt='edit' title='edit' " +
            "onclick='actedit(\"#g-disp-" + library[i] + "\",\"#g-edit-" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <input type='checkbox' onclick='actdel(\"#g-d-" + library[i] + "\", this)' " +
            "title='delete?'>\n" +
            "                            <img src='del.png' alt='delete' title='delete' " +
            "onclick='removeGallery(\"" + library[i] + "\")' style='display:none;' id='g-d-" + library[i] + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr id='g-edit-" + library[i] + "' style='display:none;'>\n" +
            "                        <td colspan='2'>\n" +
            "                            <input id='g-e-" + library[i] + "' type='text' value='" + library[i] + "'>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <button onclick='editGallery(\"" + library[i] + "\")'>Edit</button>\n" +
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
                "onclick='moveGalleryElement(\"" + library[i] + "\", \"" + j + "\")'>\n" +
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
                "title='delete' onclick='removeGalleryElement(\"" + library[i] + "\", \"" + j + "\")' " +
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
                "onclick='editGalleryElement(\"" + library[i] + "\", \"" + j + "\")'>Edit</button>\n" +
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
            "                            <button onclick='addGalleryElement(\"" + library[i] + "\")'>Add" +
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
        "                            <button onclick='addGallery()'>Add</button>\n" +
        "                        </td>\n" +
        "                    </tr>\n" +
        "                </thead>\n" +
        "            </table>\n" +
        "            <div style='text-align:center;'><a href='nomad.html'>return to admin page</a></div>" +
        "       </div>\n" +
        "   </div>\n" +
        "</div>\n" +
        "<script src='nomad.js'></script>\n" +
        h.getFoot(false);
    callback(html);

}


/***
 * adds a document to the library and file system
 ***/
function addDocument(name, id, library, resources, forbiddenNames, callback) {

    console.log("New document creation request: " + id);

    if(!library.includes(id) && !forbiddenNames.includes(id)) {

        library.push(id);
        resources[id] = {
            name: name,
            authors: [],
            coauthors: [],
            pageCount: [],
            date: "",
            file: "",
            description: "",
            contributor: "",
            seealso: []
        };
        callback("SUCCESS!", false);

    } else {

        console.log("ERROR: A document of that name already exists or is disallowed!");

        callback("ERROR: A document of this name already exists or is disallowed!", true);

    }

}


/***
 * changes a document name
 ***/
function editDocument(oldName, newName, library, resources, forbiddenNames, callback) {

    console.log("New document renaming request: " + oldName + "->" + newName);

    if(library.includes(oldName)) {

        if(!library.includes(newName) && !forbiddenNames.includes(newName)) {

            library.splice(library.indexOf(oldName), 1, newName);

            if (oldName !== newName) {

                Object.defineProperty(resources, newName, Object.getOwnPropertyDescriptor(resources, oldName));
                delete resources[oldName];

            }

            callback("SUCCESS!");

        } else {

            console.log("ERROR: A document of that name already exists or is disallowed!");

            callback("ERROR: A document of this name already exists or is disallowed!", true);

        }

    } else {

        console.log("ERROR: A document of that name does not exist!");

        callback("ERROR: A document of that name does not exist!", true);

    }

}


/***
 * removes a document from the library and file system
 ***/
function removeDocument(name, library, resources, callback) {

    console.log("New document deletion request: " + name);

    if(library.includes(name)) {

        library.splice(library.indexOf(name), 1);
        delete resources[name];
        callback("SUCCESS!");

    } else {

        console.log("ERROR: A document of that name does not exist!");

        callback("ERROR: A document of this name does not exist!", true);

    }

}


/***
 * moves the position of a document within the library and file system up by one position
 ***/
function moveDocument(name, library, resources, callback) {

    if(library.indexOf(name) > 0)
        library.splice(library.indexOf(name) - 1, 0, library.splice(library.indexOf(name), 1)[0]);

    callback("SUCCESS!");

}


/***
 * Creates a HTML page for managing the documents
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
function adminDocument(library, resources, callback) {

    let html = h.getHead(false, false, "Document Management Tool",
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
            "onclick='moveDocument(\"" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <img src='edit.png' alt='edit' title='edit' " +
            "onclick='actedit(\"#g-disp-" + library[i] + "\",\"#g-edit-" + library[i] + "\")'>\n" +
            "                        </td>\n" +
            "                        <td>\n" +
            "                            <input type='checkbox' onclick='actdel(\"#g-d-" + library[i] + "\", this)' " +
            "title='delete?'>\n" +
            "                            <img src='del.png' alt='delete' title='delete' " +
            "onclick='removeDocument(\"" + library[i] + "\")' style='display:none;' id='g-d-" + library[i] + "'>\n" +
            "                        </td>\n" +
            "                    </tr>\n" +
            "                    <tr id='g-edit-" + library[i] + "' style='display:none;'>\n" +
            "                        <td colspan='2'>\n" +
            "                            <input id='g-e-" + library[i] + "' type='text' value='" + library[i] + "'>\n" +
            "                        </td>\n" +
            "                        <td colspan='3'>\n" +
            "                            <button onclick='editDocument(\"" + library[i] + "\")'>Edit</button>\n" +
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
            "                            <button onclick='uploadDoc(\"" + library[i] + "\")'>Upload</button><br>\n" +
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
            "                            <button onclick='editDocumentMeta(\"" + library[i] + "\)'>Update metadata" +
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
        "                            <button onclick='addDocument()'>Add</button>\n" +
        "                        </td>\n" +
        "                    </tr>\n" +
        "                </thead>\n" +
        "            </table>\n" +
        "            <div style='text-align:center;'><a href='nomad.html'>return to manager</a></div>" +
        "       </div>\n" +
        "   </div>\n" +
        "</div>\n" +
        "<script src='nomad.js'></script>\n" +
        h.getFoot(false);
    callback(html);

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

    else
        script = script.replace("$pagecount$","100");

    if(document.hasOwnProperty("id"))
        script = script.replace("$bookid$",document.id);

    else
        script = script.replace("$bookid$","0");

    if(document.hasOwnProperty("title"))
        script = script.replace("$booktitle$",document.title);

    else
        script = script.replace("$booktitle$","[Titel]");

    if(document.hasOwnProperty("authors"))
        script = script.replace("$bookauthor$",document.authors.join(", "));

    else
        script = script.replace("$bookauthor$","[Autor]");

    return script;

}



/* **************************** *
 * ********* EXPORTS ********** *
 * **************************** */


module.exports.getDocument = getDocument;
module.exports.getGallery = getGallery;
module.exports.adminGallery = adminGallery;
module.exports.addGallery = addGallery;
module.exports.editGallery = editGallery;
module.exports.removeGallery = removeGallery;
module.exports.moveGallery = moveGallery;
module.exports.addGalleryElement = addGalleryElement;
module.exports.removeGalleryElement = removeGalleryElement;
module.exports.moveGalleryElement = moveGalleryElement;
module.exports.editGalleryElement = editGalleryElement;
module.exports.adminDocument = adminDocument;
module.exports.addDocument = addDocument;
module.exports.editDocument = editDocument;
module.exports.removeDocument = removeDocument;
module.exports.moveDocument = moveDocument;