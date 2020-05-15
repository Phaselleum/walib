function search(event){

    event.preventDefault();

    $.get("/database/search/" + $("#keywords").val(),function(data){

        console.log(data);

        $("#searchresults").html(data);

    });

}

$(document).ready(function(){

    $("#form").on("submit",function(event){search(event);});

});