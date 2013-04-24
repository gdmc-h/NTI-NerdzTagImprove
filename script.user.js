// ==UserScript==
// @name        NERDZ Tag Improve
// @namespace   tag: nerdz, tag, improve
// @description Easy-to-use tags button under post forms.
// @match       http://www.nerdz.eu/*
// @version     1.2
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
                _AVAILABLE_BTNS  = {},
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
                    // JustHvost was here! (and maybe Robertof)
                    addToTextBox (text);
                    if (caretPos != null && caretPos > -1)
                        setCaretPosition (TEXTBOX, TEXTBOX.selectionStart - caretPos);
                },
                createButton = function (value, listener, customStylingCode, _hidden, _noHideClass, notShown) {
                    // we may want to use jquery here since we have it, but
                    // we're lazy and we'll use normal DOM functions
                    if (!NERDZ_FORM) return;
                    var btn = document.createElement ("input");
                    btn.type = "button";
                    btn.value = value;
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
                    _AVAILABLE_BTNS[value] = [ btn, !notShown ];
                    console.log ("[NTI] Registered button {0}, hidden: {1}, no-hide-class: {2}".format (value, _hidden, _noHideClass));
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
                createAppendButton = function (value, whatToAppend, caretPos, customStyling, _hidden, notShown) {
                    createButton (value, function() {
                        addToTextBox (whatToAppend);
                        // NOTE: here I use selectionStart, where in other functions I
                        // used legacy support for old IEs. I realized this isn't needed
                        // since:
                        // - IE doesn't support userscripts (YAYYYYY -JustHvost)
                        // - IE >= 8 handles selectionStart better than previous versions
                        // but I'm too lazy to drop support for IE in other functions since
                        // they are not mine. Feel free to to it!
                        if (caretPos != null && caretPos > -1)
                            setCaretPosition (TEXTBOX, TEXTBOX.selectionStart - caretPos);
                    }, customStyling, _hidden, false, notShown);
                },
                OptionsAPI = {
                    registeredOptions: {},
                    _currentInterval:  null,
                    registerOption: function (uniqId, name, subName, generateSecondTdCb)
                    {
                        if (typeof generateSecondTdCb !== "function" || uniqId in OptionsAPI.registeredOptions)
                            return;
                        OptionsAPI.registeredOptions[uniqId] = {
                            uniqId       : uniqId,
                            firstTd      : name,
                            firstTd_sName: subName,
                            secondTdCb   : generateSecondTdCb,
                            api          : OptionsAPI,
                            get          : function (key) {
                                return OptionsAPI.get (uniqId, key);
                            },
                            getBool      : function (key) {
                                return OptionsAPI.getBool (uniqId, key);
                            },
                            store        : function (key, value) {
                                OptionsAPI.store (uniqId, key, value);
                            }
                        };
                    },
                    registerCheckboxOption: function (uniqId, name, subName)
                    {
                        OptionsAPI.registerOption (uniqId, name, subName, function() {
                            var checkbox = document.createElement ("input"), context = this;
                            checkbox.type = "checkbox";
                            checkbox.checked = context.getBool (context.uniqId);
                            checkbox.addEventListener ("click", function() {
                                context.store (context.uniqId, this.checked);
                            }, false);
                            return checkbox;
                        });
                    },
                    store: function (uniqId, key, value)
                    {
                        var realValue = ( typeof value === "boolean" ? ( value ? "true" : "false" ) : value );
                        localStorage["OptionsAPI_" + uniqId] = realValue;
                    },
                    get: function (uniqId, key)
                    {
                        return localStorage["OptionsAPI_" + uniqId];
                    },
                    getBool: function (uniqId, key)
                    {
                        var sRet = OptionsAPI.get (uniqId, key);
                        return (sRet !== undefined && sRet === "true");
                    },
                    hookIfNecessary: function()
                    {
                        // needs to be called only once, hooks into preferences.php only
                        if (/preferences\.php$/.test (document.location.href))
                        {
                            OptionsAPI._currentInterval = setInterval (OptionsAPI._hookOnce, 1000);
                            setInterval (function() {
                                if (OptionsAPI._currentInterval == null && !document.getElementById ("edprofrm"))
                                    OptionsAPI._currentInterval = setInterval (OptionsAPI._hookOnce, 1000);
                            }, 1500);
                        }
                    },
                    _hookOnce: function() {
                        if (!document.getElementById ("edprofrm")) return;
                        clearInterval (OptionsAPI._currentInterval);
                        OptionsAPI._currentInterval = null;
                        var trList  = document.getElementsByTagName ("tr");
                        var insertb = document.getElementsByTagName ("tbody")[1];
                        for (key in OptionsAPI.registeredOptions)
                        {
                            var mainTr = document.createElement ("tr");
                            var option = OptionsAPI.registeredOptions[key];
                            var optionHeader = document.createElement ("td");
                            optionHeader.innerHTML = "<br>" + option.firstTd;
                            if (option.firstTd_sName)
                                optionHeader.innerHTML += "<br><p class='small'>{0}</p>".format (option.firstTd_sName);
                            var sTd = document.createElement ("td");
                            sTd.appendChild (option.secondTdCb.call (option));
                            mainTr.appendChild (optionHeader);
                            mainTr.appendChild (sTd);
                            insertb.insertBefore (mainTr, trList[trList.length - 1]);
                        }
                        document.getElementsByTagName ("tbody")[1].insertBefore (mainTr, trList[trList.length - 1]);
                    }
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
            // TODO: fix bad links with #! at the end
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
            
            //Spoiler tag update. -JustHvost
            createButton ("Spoiler", function() {
                var spoiler = prompt ("Argomento:", "");
                if (spoiler != null && spoiler != "")
                    addToTextBoxWithPos ("[spoiler={0}][/spoiler]".format (nome), 8);
                else
                    addToTextBoxWithPos ("[spoiler][/spoiler]", 8);
            }, null, true);
            
            createPromptButton ("Codice", "Inserisci il linguaggio:", "[code={0}][/code]", 7);
            // Hidden buttons -JustHvost
            createButton (">>>", function() {
                // sorry for the bad code
                var buttons = document.getElementsByClassName ("ntiBtn"),
                    hButtons= document.getElementsByClassName ("ntiHidden"),
                    isRight = this.value === ">>>";
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
            createAppendButton ("B", "[b][/b]", 4, function() {
                this.style.fontWeight = "bold";
            }, true);
            createAppendButton ("I", "[cur][/cur]", 6, function() {
                this.style.fontStyle = "italic";
            }, true);
            createAppendButton ("U", "[u][/u]", 4, function() {
                this.style.textDecoration = "underline";
            }, true);
            createAppendButton ("Del", "[del][/del]", 6, function() {
                this.style.textDecoration = "line-through";
            }, true);
            createAppendButton ("Small", "[small][/small]", 8, null, true);
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
            createAppendButton ("Wiki", "[wiki=it][/wiki]", 7, null, true);

            createButton ("Quote", function() {
                var nome = prompt ("Citazione di:", "");
                if (nome != null && nome != "")
                    addToTextBoxWithPos ("[quote={0}][/quote]".format (nome), 8);
                else
                    addToTextBoxWithPos ("[quote][/quote]", 8);
            }, null, true);
            createAppendButton ("Hr", "[hr]", -1, null, true);
            createAppendButton ("Math", "[math][/math]", 7, null, true);
            createButton ("?", function() {
                alert ("Hotkey:\nAlt+1 => [b]\nAlt+2 => [cur]\nAlt+3 => [u]\nAlt+4 => [del]\nAlt+5 => [small]");
            }, null, true);
            //HOTKEYS ARE HERE, BITCHES!!! -JustHvost
            //AND U INDENTED LIKE A BITCH!!! -Robertof
            var isAlt = false;
            document.onkeyup = function (e) {
                if (e.which == 18) isAlt = false;
            };
            document.onkeydown = function (e) {
                if (e.which == 18) isAlt = true;
                if (e.which == 49 && isAlt) { // 1
                    addToTextBoxWithPos ("[b][/b]", 4);
                    return false;
                }
                if (e.which == 50 && isAlt) { // 2
                    addToTextBoxWithPos ("[cur][/cur]", 6); 
                    return false;
                }
                if (e.which == 51 && isAlt) { // 3
                    addToTextBoxWithPos ("[u][/u]", 4);
                    return false;
                }
                if (e.which == 52 && isAlt) { // 4
                    addToTextBoxWithPos ("[del][/del]", 6);
                    return false;
                }
                if (e.which == 53 && isAlt) { // 5
                    addToTextBoxWithPos ("[small][/small]", 8);
                    return false;
                }
            };
            // temporary fix for dev build users to show buttons
            for (i in _AVAILABLE_BTNS)
            {
                if (_AVAILABLE_BTNS.hasOwnProperty (i))
                    NERDZ_FORM.insertBefore (_AVAILABLE_BTNS[i][0], PMESSAGE);
            }
            // Options API stuff begins now
            OptionsAPI.registerCheckboxOption ("prothemesupport", "NTI: Robertof's Pro Theme Support", "Automatically saved when you check.");
            OptionsAPI.registerCheckboxOption ("enablehotkeys",   "NTI: Enable Hotkeys", "Automatically saved when you check.");
            OptionsAPI.registerOption         ("enabledbuttons",  "NTI: Enabled buttons", "Automatically saved when you make changes.", function() {
                // this is gonna be quite interesting to code (LOL WTF!?)
                // justhvost is faggot
                
            });
            OptionsAPI.hookIfNecessary();
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
