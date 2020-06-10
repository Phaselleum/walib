const MAX_FILE_SIZE = 1e8; // ~100MB


/**
 * Gallery functions
 */


function addGalleryCS() {

    $.get("gallery-add/" + $("#g-a-name").val().replace(/\s/g, "-"), function(data){
        alert(data);
        window.location.reload();
    });

}

function removeGalleryCS(name) {

    $.get("gallery-remove/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function editGalleryCS(name) {

    $.get("gallery-edit/" + name + "/" + $("#g-e-" + name).val(), function(data){
        alert(data);
        window.location.reload();
    });

}

function moveGalleryCS(name) {

    $.get("gallery-move/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function addGalleryElementCS(name) {

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


function removeGalleryElementCS(galleryName, elementId) {

    $.get("gallery-remove-element/" + galleryName + "/" + elementId, function(data){
        alert(data);
        window.location.reload();
    });

}


function editGalleryElementCS(galleryName, elementId) {

    $.post("gallery-edit-element/" + galleryName + "/" + elementId,
        {"desc": $("#g-edit-" + galleryName + "-e-" + elementId + "i").val()}, function(data){
            alert(data);
            window.location.reload();
        });

}


function moveGalleryElementCS(galleryName, elementId) {

    $.get("gallery-move-element/" + galleryName + "/" + elementId, function(data){
        alert(data);
        window.location.reload();
    });

}

function addGalleryThumbnailCS(name) {

    let fd = new FormData(),
        fileElement = $("#g-atn-" + name)[0];

    if(fileElement.files[0].size > MAX_FILE_SIZE) {

        alert("The file ist too large to be uploaded!");
        return;

    }

    fd.append("file", fileElement.files[0]);

    $.ajax({

        url: '/gallery-add-thumbnail/' + name,
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


function removeGalleryThumbnailCS(name) {

    $.get("gallery-remove-thumbnail/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}


/**
 * Document functions
 */


function addDocumentCS() {

    let fd = new FormData(),
        fileElement = $("#g-f-in")[0];

    if(fileElement.files[0].size > MAX_FILE_SIZE)
        return alert("The file ist too large to be uploaded!");

    fd.append("name", $("#g-a-name").val());
    fd.append("file", fileElement.files[0]);

    if(fd.get("name").length < 1)
        return alert("please enter a different document name!");

    $.ajax({

        url: '/document-add/' + name,
        type: 'post',
        data: fd,
        contentType: false,
        processData: false,
        timeout: 5000,
        success: function(data) {

            alert(data);
            window.location.reload();

        },
        error: function(jqXHR, textStatus, errorThrown) {

            if(textStatus === "timeout") {

                alert("reloading page due to timeout (probably related to pdf-image if everything looks fine!");
                window.location.reload();

            } else alert("Error thrown during post: " + textStatus + ";" + errorThrown);

        }

    });

    $.post();

}

function removeDocumentCS(name) {

    $.get("document-remove/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function editDocumentCS(name) {

    let newName = hyphenate($("#g-e-" + name).val());

    if(newName.length < 1)
        return alert("please enter a different document name!");

    $.get("document-edit/" + name + "/" + newName, function(data){
        alert(data);
        window.location.reload();
    });


}

function moveDocumentCS(name) {

    $.get("document-move/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function uploadDocumentCS(name) {

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
        timeout: 5000,
        success: function(data) {

            alert(data);
            window.location.reload();

        },
        error: function(jqXHR, textStatus, errorThrown) {

            if(textStatus === "timeout") {

                alert("reloading page due to timeout (probably related to pdf-image if everything looks fine!");
                window.location.reload();

            } else alert("Error thrown during post: " + textStatus + ";" + errorThrown);

        }

    });

    $.post();

}

function editDocumentMetaCS(name) {

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

function addDocumentThumbnailCS(name) {

    let fd = new FormData(),
        fileElement = $("#g-atn-" + name)[0];

    if(fileElement.files[0].size > MAX_FILE_SIZE) {

        alert("The file ist too large to be uploaded!");
        return;

    }

    fd.append("file", fileElement.files[0]);

    $.ajax({

        url: '/document-add-thumbnail/' + name,
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


function removeDocumentThumbnailCS(name) {

    $.get("document-remove-thumbnail/" + name, function(data){
        alert(data);
        window.location.reload();
    });

}

function setUserPW(){

    let fd = new FormData();

    fd.append("password", sha512($("#uPW").val()));

    $.ajax({

        url: '/update-upw/' + name,
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

function setAdminPW(){

    let fd = new FormData(),
        old = $("#aPWo").val(),
        new1 = $("#aPW1").val(),
        new2 = $("#aPW2").val();

    if(new1 !== new2) return alert("The passwords don't match!");

    fd.append("oldpw", sha512(old));
    fd.append("newpw", sha512(new1));

    $.ajax({

        url: '/update-apw/' + name,
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