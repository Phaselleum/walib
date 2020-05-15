$(document).ready(function(){lightboxSetup();});


var images = [],
    lbc = 0;


function lightboxSetup() {

    $(".persongallery img").each(function(){images.push($(this).attr("src"));});
    $("#lightbox").on("click",function(event){hidelightbox(event)});

}


function lightbox(i) {

    if(!i)
        i = 0;

    if(i >= images.length)
        i = 0;

    if(i<0)
        i= images.length - 1;

    lbc = i;

    $("#lightbox").css("visibility","visible");
    $("#lightbox img").attr("src",images[i]);

}


function hidelightbox(e) {

    if($(e.target).is("a")) return;
    if($(e.target).is("#lightboxleft")) return;
    if($(e.target).is("#lightboxright")) return;

    $("#lightbox").css("visibility","hidden");

}