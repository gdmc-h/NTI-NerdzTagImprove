// ==UserScript==
// @name        NERDZ Tag Improve
// @namespace   tag: nerdz, tag, improve
// @description Easy-to-use tags button under post forms.
// @match       http://www.nerdz.eu/*
// @version     1.1
// @grant       none
// ==/UserScript==

// NERDZ Tag Improve - by JustHvost
// contributors:
// - nicolapcweek94: original author, various fixes
// - Robertof: code refactoring, API for buttons, protheme support, 
//   greasemonkey/tampermonkey/chrom* support
// - Dlion: add gist support



(function() {
    var generalUtils = {
        inject: function (cb) {
            var elm = document.createElement ("script");
            elm.appendChild (document.createTextNode ("(" + cb + ")()"));
            (document.body || document.head || document.documentElement).appendChild (elm);
        },
        executeUserScript: function() {
            // we don't know about generalUtils functions if we are in
            // a greasemonkey environment, so I'll avoid specifying tags function
            // in there
            // implement a format method in string prototype function to avoid
            // bad concatenations (source: http://stackoverflow.com/a/4673436)
            if (!String.prototype.format)
                String.prototype.format = function() {
                    var args = arguments;
                    return this.replace (/{(\d+)}/g, function (match, number) {
                        return typeof args[number] != "undefined" ? args[number] : match;
                    });
                };
            var NERDZ_FORM       = document.getElementById ("stdfrm"),
                PMESSAGE         = document.getElementById ("pmessage"),
                TEXTBOX          = document.getElementById ("frmtxt"),
                PROTHEME_SUPPORT = localStorage.NTIPThemeSupport === "true",
                IS_WEBKIT        = /webkit/.test (navigator.userAgent.toLowerCase()),
                _INTERNAL_F_BUTTON = false,
                // allows to move the cursor in a textbox where you want
                // thanks to http://stackoverflow.com/a/512542
                setCaretPosition = function (elm, caretPos) {
                    if (elm.createTextRange)
                    {
                        var range = elm.createTextRange();
                        range.move ("character", caretPos);
                        range.select();
                    }
                    else
                    {
                        if (elm.selectionStart)
                        {
                            elm.focus();
                            elm.setSelectionRange (caretPos, caretPos);
                        }
                        else
                            elm.focus();
                    }
                },
                addToTextBox = function (text) {
                    // OLD Implementation: TEXTBOX.value += text;
                    // TEXTBOX.focus();
                    // append the text where the caret it is
                    // adapted from http://stackoverflow.com/a/4384173
                    if (document.selection)
                    {
                        TEXTBOX.focus();
                        var sel = document.selection.createRange();
                        sel.text = text;
                        TEXTBOX.focus();
                    }
                    else if (TEXTBOX.selectionStart || TEXTBOX.selectionStart === 0)
                    {
                        var startPos  = TEXTBOX.selectionStart;
                        var endPos    = TEXTBOX.selectionEnd;
                        var scrollTop = TEXTBOX.scrollTop;
                        TEXTBOX.value = TEXTBOX.value.substring (0, startPos) + text + TEXTBOX.value.substring (endPos, TEXTBOX.value.length);
                        TEXTBOX.focus();
                        TEXTBOX.selectionStart = startPos + text.length;
                        TEXTBOX.selectionEnd   = startPos + text.length;
                        TEXTBOX.scrollTop = scrollTop;
                    }
                    else
                    {
                        TEXTBOX.value += text;
                        TEXTBOX.focus();
                    }
                },
                addToTextBoxWithPos = function (text, caretPos) {
			//Yep... JustHvost was here...
                    if (document.selection)
                    {
                        TEXTBOX.focus();
                        var sel = document.selection.createRange();
                        sel.text = text;
                        TEXTBOX.focus();
                    }
                    else if (TEXTBOX.selectionStart || TEXTBOX.selectionStart === 0)
                    {
                        var startPos  = TEXTBOX.selectionStart;
                        var endPos    = TEXTBOX.selectionEnd;
                        var scrollTop = TEXTBOX.scrollTop;
                        TEXTBOX.value = TEXTBOX.value.substring (0, startPos) + text + TEXTBOX.value.substring (endPos, TEXTBOX.value.length);
                        TEXTBOX.focus();
                        TEXTBOX.selectionStart = startPos + text.length;
                        TEXTBOX.selectionEnd   = startPos + text.length;
                        TEXTBOX.scrollTop = scrollTop;
                    }
                    else
                    {
                        TEXTBOX.value += text;
                        TEXTBOX.focus();
                    }
                         if (caretPos != null && caretPos > -1)
                         setCaretPosition (TEXTBOX, TEXTBOX.selectionStart - caretPos);
                },
                createButton = function (value, listener, customStylingCode, _hidden, _noHideClass) {
                    // we may want to use jquery here since we have it, but
                    // we're lazy and we'll use normal DOM functions
                    if (!NERDZ_FORM) return;
                    var btn = document.createElement ("input");
                    btn.setAttribute ("type", "button");
                    btn.setAttribute ("value", value);
                    btn.style.cssFloat  = "left";
                    btn.style.marginTop = "5px";
                    if (PROTHEME_SUPPORT)
                    {
                        if (!_INTERNAL_F_BUTTON)
                            _INTERNAL_F_BUTTON = true;
                        else
                            btn.style.marginLeft =  ( IS_WEBKIT ? "0px" : "-4px" ); // correct button's margin
                    }
                    if (!_noHideClass)
                        btn.className = "ntiBtn";
                    if (_hidden)
                    {
                        btn.style.display = "none";
                        btn.className = "ntiHidden";
                    }
                    if (typeof customStylingCode === "function")
                        customStylingCode.call (btn);
                    btn.addEventListener ("click", listener, false);
                    NERDZ_FORM.insertBefore (btn, PMESSAGE);
                },
                createPromptButton = function (value, question, tagFormat, caretPos, customStyling, _hidden) {
                    createButton (value, function() {
                        var data = prompt (question, "");
                        if (data != null && data != "")
                        {
                            addToTextBox (tagFormat.format (data));
                            if (caretPos != null && caretPos > -1)
                                setCaretPosition (TEXTBOX, TEXTBOX.selectionStart - caretPos);
                        }
                    }, customStyling, _hidden);
                },
                createAppendButton = function (value, whatToAppend, caretPos, customStyling, _hidden) {
                    createButton (value, function() {
                        addToTextBox (whatToAppend);
                        // NOTE: here I use selectionStart, where in other functions I
                        // used legacy support for old IEs. I realized this isn't needed
                        // since:
                        // - IE doesn't support userscripts
                        // - IE >= 8 handles selectionStart better than previous versions
                        // but I'm too lazy to drop support for IE in other functions since
                        // they are not mine. Feel free to to it!
                        if (caretPos != null && caretPos > -1)
                            setCaretPosition (TEXTBOX, TEXTBOX.selectionStart - caretPos);
                    }, customStyling, _hidden);
                };
            /*
             * Note for those who will edit the code
             * ======================================
             * Hints for correct developing with the refactored code:
             * - use createButton (buttonName, callback, customStylingCode, hidden, skipHiddenClass) to add buttons.
             *   customStylingCode is an optional callback to specify any additional styling the button should receive.
             *   Use this inside customStylingCode callback to access the button.
             *   hidden specifies if the button should be hidden and showed later with the '>>>' button.
             *   skipHiddenClass is intended mainly for internal use - it makes the button permanently visible, i.e. it
             *   is used in the '>>>' button.
             * - use addToTextBox (value) to add stuff to the main NERDZ textbox.
             * - for simple buttons that just ask a question and put a bbcode in the
             *   textbox, use createPromptButton (buttonName, questionAsked, bbcode, caretPos)
             *   for caretPos details, see the next documentation entry
             *   example: createPromptButton ('test', 'Test value:', '[test]{0}[/test]', 7)
             * - for even simpler buttons that JUST add something to the textbox, use
             *   createAppendButton (value, bbcode, caretPos, customStyling, hidden). caretPos is the desidered
             *   position of the cursor after inserting the tag (calculated from textLength - cPos).
             *   Null or -1 disables this. Referer to createButton's doc for hidden and customStyling parameters.
             *   NOTE: it is recommended to use this implementation for bbcodes that just
             *   ask one value (i.e. the ones in createPromptButton). It is simpler and much
             *   cooler to see.
             * - use "string{0}".format (value) to avoid bad concatenations. Works also with
             *   {1}, ecc.
             * Enjoy
             */
            createAppendButton ("Video", "[yt][/yt]", 5);
            // TODO: localization? Will be possible with APIs maybe
            createAppendButton ("Immagine", "[img][/img]", 6);
            createButton ("URL", function() {
                var fg = prompt ("Inserisci il link:", "");
                if (fg != null && fg != "")
                {
                    if (!/^(ftp|https?)/.test (fg))
                        fg = "http://" + fg;
                    var title = prompt ("Inserisci il titolo del link:", "");
                    if (title != null && title != "")
                        addToTextBox ("[url=\"{0}\"]{1}[/url]".format (fg, title));
                    else
                        addToTextBox ("[url]{0}[/url]".format (fg));
                }
            });
            // note: 7 is the length of the [/wiki] tag
            createAppendButton ("Wiki",    "[wiki=it][/wiki]", 7);
            createAppendButton ("Spoiler", "[spoiler][/spoiler]", 10);
           
            // Hidden buttons -JustHvost
            createButton (">>>", function() {
                // sorry for the bad code
                var buttons = document.getElementsByClassName ("ntiBtn");
                var hButtons= document.getElementsByClassName ("ntiHidden");
                var isRight = this.value === ">>>";
                for (var i = 0; i < buttons.length; i++)
                {
                    buttons[i].style.display = ( isRight ? "none" : "block" );
                }
                for (i = 0; i < hButtons.length; i++)
                {
                    hButtons[i].style.display = ( isRight ? "block" : "none" );
                }
                if (!isRight && PROTHEME_SUPPORT)
                    this.style.marginLeft = ( IS_WEBKIT ? "0px" : "-4px" );
                else if (isRight && PROTHEME_SUPPORT)
                    this.style.marginLeft = ( IS_WEBKIT ? "2px" : "0px" );
                this.value = ( isRight ? "<<<" : ">>>" );
            }, null, false, true);
            createPromptButton ("Codice", "Inserisci il linguaggio:", "[code={0}][/code]", 7, null, true);
            createButton ("Gist", function() {
                var link = prompt ("Inserisci il link o l'id del tuo Gist:", "");
                if (link != null && link != "")
                {
                    // allow to use an URl too instead of an ID. simpler and more epic
                    if (/^http/.test (link))
                    {
                        // try to parse the link
                        var tmpGistId = /\/([^\/]+)$/.exec (link);
                        if (tmpGistId != null)
                            link = tmpGistId[1];
                    }
                    addToTextBox ("[gist]{0}[/gist]".format (link));
                }
            }, null, true);
            createAppendButton ("Quote", "[quote][/quote]", 8, null, true);
            createAppendButton ("Hr", "[hr]", -1, null, true);
            createAppendButton ("Math", "[math][/math]", 7, null, true);
            
            //HOTKEYS ARE HERE, BITCHES!!! -JustHvost 
            var isCtrl = false;
		document.onkeyup=function(e) {
    			if(e.which == 17) isCtrl=false;
		}
		document.onkeydown=function(e){
   			if(e.which == 17) isCtrl=true;
			if(e.which == 49 && isCtrl == true) {
         		addToTextBoxWithPos("[b][/b]", 4);
         		return false;
    			}
    			if(e.which == 50 && isCtrl == true) {
         		addToTextBoxWithPos("[i][/i]", 4);
         		return false;
    			}
    			if(e.which == 51 && isCtrl == true) {
         		addToTextBoxWithPos("[u][/u]", 4);
         		return false;
    			}
    			if(e.which == 52 && isCtrl == true) {
         		addToTextBoxWithPos("[del][/del]", 6);
         		return false;
    			}
    			if(e.which == 53 && isCtrl == true) {
         		addToTextBoxWithPos("[small][/small]", 8);
         		return false;
    			}
		}
		
		
            // add support for NERDZ protheme
            // autodetect isn't supported since stylish css replacing is done in a weird
            // way. let the user select if he wants protheme adjustments or not
            // hook in the preferences page
            if (/preferences\.php$/.test (document.location.href))
            {
                var nastyInterval = setInterval (function() {
                    if (!document.getElementById ("edprofrm")) return;
                    clearInterval (nastyInterval);
                    var mainTr = document.createElement ("tr");
                    var subTd1 = document.createElement ("td");
                    subTd1.innerHTML = "<br>Enable NTI ProTheme support";
                    var subTd2 = document.createElement ("td");
                    var sChkbx = document.createElement ("input");
                    sChkbx.setAttribute ("type", "checkbox");
                    if (localStorage.NTIPThemeSupport === "true")
                        sChkbx.checked = true;
                    else
                        sChkbx.checked = false;
                    sChkbx.setAttribute ("id", "nti-protheme");
                    var sApply = document.createElement ("input");
                    sApply.setAttribute ("type", "button");
                    sApply.setAttribute ("value", "Apply");
                    sApply.addEventListener ("click", function() {
                        // avoid using booleans in localStorage
                        localStorage.NTIPThemeSupport = ( sChkbx.checked ? "true" : "false" );
                    }, false);
                    subTd2.innerHTML = "<br>";
                    subTd2.appendChild (sChkbx);
                    subTd2.appendChild (sApply);
                    mainTr.appendChild (subTd1);
                    mainTr.appendChild (subTd2);
                    var trList = document.getElementsByTagName ("tr");
                    // insert before the tr with the apply button
                    document.getElementsByTagName ("tbody")[1].insertBefore (mainTr, trList[trList.length - 1]);
                }, 1000);
            }
        }
    };
    // developer note: unsafeWindow is exported also on chrome, GM_info is not.
    // fucking shitty browsers /rage
    // developer note x2: specifying @grant none in the header disables
    // greasemonkey sandbox, effectively allowing the script to access elements
    // of the pages without problems. but that is on firefox. I don't know
    // the situation with chrome so I'll stick with the injecting method which
    // always works
    if (typeof unsafeWindow == "object" || typeof GM_info !== "undefined")
        generalUtils.inject (generalUtils.executeUserScript);
    else // we're not in userscript context, wait for document load with jquery
        $(document).ready (generalUtils.executeUserScript);
})();
