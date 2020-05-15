const MAX_FILE_SIZE = 1e8; // ~100MB


/**
 * Gallery functions
 */


function addGallery() {

    $.get("gallery-add/" + $("#g-a-name").val(), function(data){
        alert(data);
        window.location.reload();
    });


}

function editGallery(name) {

    $.get("gallery-edit/" + name + "/" + $("#g-e-" + name).val(), function(data){
        alert(data);
        window.location.reload();
    });


}

function removeGallery(name) {

    $.get("gallery-remove/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function moveGallery(name) {

    $.get("gallery-move/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function addGalleryElement(name) {

    let fd = new FormData(),
        fileElement = $("#g-ae-f-" + name)[0];

    if(fileElement.files[0].size > MAX_FILE_SIZE) {

        alert("The file ist too large to be uploaded!");
        return;

    }

    fd.append("file", fileElement.files[0]);
    fd.append("desc", $("#g-ae-d-" + name).val());

    $.ajax({

        url: '/gallery-add-element/' + name,
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function(data) {

            alert(data);
            window.location.reload();

        },
        error: function(jqXHR, textStatus, errorThrown) {

            alert("Error thrown during post: " + textStatus + ";" + errorThrown);

        }

    });

    $.post();

}


function removeGalleryElement(galleryName, elementId) {

    $.get("gallery-remove-element/" + galleryName + "/" + elementId, function(data){
        alert(data);
        window.location.reload();
    });

}


function moveGalleryElement(galleryName, elementId) {

    $.get("gallery-move-element/" + galleryName + "/" + elementId, function(data){
        alert(data);
        window.location.reload();
    });

}


function editGalleryElement(galleryName, elementId) {

    $.post("gallery-edit-element/" + galleryName + "/" + elementId,
        {"desc": $("#g-edit-" + galleryName + "-e-" + elementId + "i").val()}, function(data){
        alert(data);
        window.location.reload();
    });

}


/**
 * Document functions
 */


function addDocument() {

    let fd = new FormData(),
        fileElement = $("#g-f-in")[0];

    if(fileElement.files[0].size > MAX_FILE_SIZE) {

        alert("The file ist too large to be uploaded!");
        return;

    }

    fd.append("file", fileElement.files[0]);
    fd.append("name", $("#g-a-name").val());

    if(fd.get("name").length < 1)
        return alert("please enter a different document name!");

    $.ajax({

        url: '/document-add/' + name,
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function(data) {

            alert(data);
            window.location.reload();

        },
        error: function(jqXHR, textStatus, errorThrown) {

            alert("Error thrown during post: " + textStatus + ";" + errorThrown);

        }

    });

    $.post();

}

function editDocument(name) {

    let newName = $("#g-e-" + name).val();

    if(newName.length < 1)
        return alert("please enter a different document name!");

    $.get("document-edit/" + name + "/" + newName, function(data){
        alert(data);
        window.location.reload();
    });


}

function removeDocument(name) {

    $.get("document-remove/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function moveDocument(name) {

    $.get("document-move/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function uploadDoc(name) {

    let fd = new FormData(),
        fileElement = $("#g-" + name + "-f-in")[0];

    if(fileElement.files[0].size > MAX_FILE_SIZE) {

        alert("The file ist too large to be uploaded!");
        return;

    }

    fd.append("file", fileElement.files[0]);

    $.ajax({

        url: '/document-upload/' + name,
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function(data) {

            alert(data);
            window.location.reload();

        },
        error: function(jqXHR, textStatus, errorThrown) {

            alert("Error thrown during post: " + textStatus + ";" + errorThrown);

        }

    });

    $.post();

}

function editDocumentMeta(name) {

    let fd = new FormData();

    fd.append("author", $("#g-" + name + "-author-in").val());
    fd.append("coauthor", $("#g-" + name + "-coauthor-in").val());
    fd.append("date", $("#g-" + name + "-date-in").val());
    fd.append("desc", $("#g-" + name + "-desc-in").val());
    fd.append("contributor", $("#g-" + name + "-contributor-in").val());
    fd.append("seealso", $("#g-" + name + "-seealso-in").val());

    $.ajax({

        url: '/document-edit-meta/' + name,
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        success: function(data) {

            alert(data);
            window.location.reload();

        },
        error: function(jqXHR, textStatus, errorThrown) {

            alert("Error thrown during post: " + textStatus + ";" + errorThrown);

        }

    });

    $.post();

}


/**
 * General functions
 */


function actdel(id, obj) {

    $(id).css("display","inline-block");
    $(obj).css("display","none");

}

function actedit(hideid, displayid) {

    $(displayid).css("display","table-row");
    $(hideid).css("display","none");

}