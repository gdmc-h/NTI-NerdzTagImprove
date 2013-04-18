/*
  "Nerdz Tag Improve" by JustHvost.
*/

document.addEventListener ("DOMContentLoaded", function() {
    var nerdz_form = document.getElementById('stdfrm');

    var pmessage = document.getElementById('pmessage'); 
    pmessage.parentNode.removeChild(pmessage);

    var pmessagenew = document.createElement("div");
    pmessagenew.setAttribute("id", "pmessage");
    pmessagenew.setAttribute("class", "error");
    
    var youtube = document.createElement("input");
    youtube.setAttribute("type", "button");
    youtube.setAttribute("style", "float:left; margin-top:5px");
    youtube.setAttribute("value", "Video");
    youtube.addEventListener ("click", function() {
    	var url = prompt("Inserisci url video:","");
    	var title = prompt("Inserisci titolo del video","");
        document.getElementById ("frmtxt").value += '[yt]'+url+'[\/yt][b]'+title+'[\/b]';

    }, false);

    var img = document.createElement("input");
    img.setAttribute("type", "button");
    img.setAttribute("style", "float:left; margin-top:5px");
    img.setAttribute("value", "Image");
    img.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[img][\/img]';
    }, false);

    var url = document.createElement("input");
    url.setAttribute("type", "button");
    url.setAttribute("style", "float:left; margin-top:5px");
    url.setAttribute("value", "Link");
    url.addEventListener ("click", function() {
    	var url = prompt("Inserisci url:","");
    	var title = prompt("Inserisci titolo per l'URL","");
        document.getElementById ("frmtxt").value += '[url='+url+']'+title+'[\/url]';
    }, false);

    var wiki = document.createElement("input");
    wiki.setAttribute("type", "button");
    wiki.setAttribute("style", "float:left; margin-top:5px");
    wiki.setAttribute("value", "Wiki");
    wiki.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[wiki=it][\/wiki]';
    }, false);

    var spoiler = document.createElement("input");
    spoiler.setAttribute("type", "button");
    spoiler.setAttribute("style", "float:left; margin-top:5px");
    spoiler.setAttribute("value", "Spoiler");
    spoiler.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[spoiler][\/spoiler]';
    }, false);

    var code = document.createElement("input");
    code.setAttribute("type", "button");
    code.setAttribute("style", "float:left; margin-top:5px");
    code.setAttribute("value", "Code");
    code.addEventListener ("click", function() {
    	var prog = prompt("Inserisci linguaggio:","");
        document.getElementById ("frmtxt").value += '[code='+prog+'][\/code]';
    }, false);


    nerdz_form.removeChild(nerdz_form.childNodes[3]);
    nerdz_form.appendChild(youtube);
    nerdz_form.appendChild(img);
    nerdz_form.appendChild(url);
    nerdz_form.appendChild(wiki);
    nerdz_form.appendChild(spoiler);
    nerdz_form.appendChild(code);
    nerdz_form.appendChild(pmessagenew);
    
}, false);
