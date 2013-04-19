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
    	if (url!=null && url!=""){
    		var title = prompt("Inserisci titolo del video","");
    		if(title!=null && title!=""){
        		document.getElementById ("frmtxt").value += '[yt]'+url+'[\/yt][b]'+title+'[\/b]';
        		} else { document.getElementById ("frmtxt").value += '[yt]'+url+'[\/yt]'; }
        	}else { window.alert("Non hai inserito nessun URL"); }

    }, false);

    var img = document.createElement("input");
    img.setAttribute("type", "button");
    img.setAttribute("style", "float:left; margin-top:5px");
    img.setAttribute("value", "Image");
    img.addEventListener ("click", function() {
    	var url = prompt("Inserisci url immagine:","");
    	if (url!=null && url!=""){ 
        	document.getElementById ("frmtxt").value += '[img]'+url+'[\/img]';
        	}else { window.alert("Non hai inserito nessun URL"); }
    }, false);

    var url = document.createElement("input");
    url.setAttribute("type", "button");
    url.setAttribute("style", "float:left; margin-top:5px");
    url.setAttribute("value", "Link");
    url.addEventListener ("click", function() {
    	var url = prompt("Inserisci url:","");
    	if (url!=null && url!=""){
    		var title = prompt("Inserisci titolo per l'URL","");
    	if(title!=null && title!=""){
        	document.getElementById ("frmtxt").value += '[url='+url+']'+title+'[\/url]';
        } else { document.getElementById ("frmtxt").value += '[url]'+url+'[\/url]'; }
        } else { window.alert("Non hai inserito nessun URL"); }
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
    	if(prog!=null && prog!=""){
        document.getElementById ("frmtxt").value += '[code='+prog+'][\/code]';
        } else { window.alert("Non hai inserito un linguaggio!"); }
    }, false);
    

    
    var cor = document.createElement("input");
   	cor.setAttribute("type", "button");
    	cor.setAttribute("style", "float:right; margin-right:120px;");
    	cor.setAttribute("value", "cur");
    	cor.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[cur][\/cur]';
    }, false);
    	
    var small = document.createElement("input");
   	small.setAttribute("type", "button");
    	small.setAttribute("style", "float:right;");
    	small.setAttribute("value", "small");
    	small.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[small][\/small]';
    }, false);

    var del = document.createElement("input");
   	del.setAttribute("type", "button");
    	del.setAttribute("style", "float:right; ");
    	del.setAttribute("value", "del");
    	del.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[del][\/del]';
    }, false);
    	
    var u = document.createElement("input");
   	u.setAttribute("type", "button");
    	u.setAttribute("style", "float:right; ");
    	u.setAttribute("value", "u");
    	u.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[u][\/u]';
    }, false);

    var b = document.createElement("input");
   	b.setAttribute("type", "button");
    	b.setAttribute("style", "float:right; ");
    	b.setAttribute("value", "b");
    	b.addEventListener ("click", function() {
        document.getElementById ("frmtxt").value += '[b][\/b]';
    }, false);
    	

    
    var testo = document.createElement("input");
    testo.setAttribute("type", "button");
    testo.setAttribute("style", "float:left; margin-top:5px");
    testo.setAttribute("value", ">>>");
    testo.addEventListener ("click", function() {
    	nerdz_form.appendChild(cor);
    	nerdz_form.appendChild(small);
    	nerdz_form.appendChild(del);
    	nerdz_form.appendChild(u);
    	nerdz_form.appendChild(b);
    }, false);
    


    nerdz_form.removeChild(nerdz_form.childNodes[3]);
    nerdz_form.appendChild(youtube);
    nerdz_form.appendChild(img);
    nerdz_form.appendChild(url);
    nerdz_form.appendChild(wiki);
    nerdz_form.appendChild(spoiler);
    nerdz_form.appendChild(code);
    nerdz_form.appendChild(testo);
    nerdz_form.appendChild(pmessagenew);
    

    
}, false);
