// ==UserScript==
// @name            Google Keys Extended
// @namespace       google_ke@googl.com
// @description     Use VIM-like keys to browse google search and edit search keywords
// @include         http://www.google.tld/search*
// @include         http://www.google.com/search*
// @include         https://www.google.com/search*
// @include         http://www.google.com.hk/search*
// @version         1.1.0
// ==/UserScript==

var keysEnable = true;
var replaceEnable = false;
var hideSidebar = false;
var help = -1;
var searchBar = -1;
var selectedResult = -1;
var lastReplace = -1;
var resultNodes = new Array();
var tabMode = GM_getValue("tabMode");
var gotoMode = false;

function xpath(query)
{
    return document.evaluate(
            query, 
            document, 
            null, 
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
    );
}

if (typeof GM_addStyle == "undefined") { 
    GM_addStyle = function(css) {
        var style = document.createElement('style');
        style.textContent = css;
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}

if (typeof GM_openInTab == "undefined") {
    GM_openInTab = function(url) {
        location.href = "javascript:window.open("about:blank");void(0);";
        //window.open(url, "");
    }
}

if ((typeof GM_getValue == "undefined") || (GM_getValue('a', 'b') == undefined)) {

    GM_getValue = function(name, defaultValue) {
        var value = localStorage.getItem(name);
        if (!value)
            return defaultValue;

		var type = value[0];
		value = value.substring(1);

		switch (type) {
			case 'b':
				return value == 'true';
			case 'n':
				return Number(value);
			default:
				return value;
		}
    }

    GM_setValue = function(name, value) {
        value = (typeof value)[0] + value;
        localStorage.setItem(name, value);
    }
}

// Class Result 
function Result(resultNode, resultUrl, resultCache)
{
    this.resultNode = resultNode;
    this.resultUrl = resultUrl;
    this.resultCache = resultCache;
}

// Go to this result, and also disable google tracking 
Result.prototype.browserTo = function(flag) {
    url = flag?this.resultUrl:this.resultCache;

    if (!url)
        return;

    if (!tabMode)
        document.location = url;
    else {
        GM_openInTab(url);
    }
} 

Result.prototype.focus = function() {
    offsetTop = this.resultNode.offsetTop;

    if (window.pageYOffset+300 > offsetTop
     || window.pageYOffset+window.innerHeight < offsetTop+300) {
       window.scrollTo(0, offsetTop - window.innerHeight/2); 
    }
    
    this.resultNode.setAttribute("style", "padding:10px;-moz-border-radius: 10px;-moz-opacity:0.2;background-color:#D3e1f9;");
}

Result.prototype.blur = function() {
    this.resultNode.setAttribute("style", "padding-left:10px;");
}

function replace()
{
    keywords = searchBar.value;
    var space = new Array();
    space[0] = 0;
    cspace = 1;

    for (i = 0; i < keywords.length; i++) {
        if(keywords.charAt(i)==" " && keywords.charAt(i+1)!=" ") {
            space[cspace++]=i;
        }
    }

    space[cspace] = keywords.length;

	if (lastReplace+2 > space.length) 
        lastReplace = 0;
    if (lastReplace < 0)
        lastReplace = space.length - 2;

	start = space[lastReplace];
	end = space[lastReplace+1];

	while (keywords.charAt(start) == " " || keywords.charAt(start) == '"') {
		start++;
	}

	while (keywords.charAt(end-1) == " " || keywords.charAt(end-1) == '"') {
		end--;
	}

	searchBar.selectionStart=start;
	searchBar.selectionEnd=end;
}

function toggleSidebar()
{
    sidebar = document.getElementById("leftnav");
    hideSidebar = !hideSidebar;
    sidebar.style.visibility = hideSidebar?"hidden":"";
}

function init() 
{
    // Disable shortcut keys in text input
    inputs = xpath("//input[@type='text']");

    for (i = 0; i < inputs.snapshotLength; i++) {
        if (searchBar == -1)
            searchBar = inputs.snapshotItem(i);

        inputs.snapshotItem(i).addEventListener("focus", function(evt){
            keysEnable = false;
        }, false);

        inputs.snapshotItem(i).addEventListener("blur", function(evt){
            keysEnable = true;
        }, false);
    }

    //FIXME
    nodes = xpath("//li[@class='g' or @class='g w0']");

    for (i = 0; i < nodes.snapshotLength; i++) {
        if (i < 10) {
            nr = (i+1) % 10;
            numFont = document.createElement("font");
            numFont.id = "_nr";
            numFont.style.color="#ffffff";
            numFont.style.backgroundColor= tabMode?"#0CAE1A":"#0E38DA";
            numFont.style.padding = "0px 5px";
            numFont.style.marginRight = "3px";
            numFont.innerHTML = nr;

            resultNode = nodes.snapshotItem(i);
            
            res = resultNode.getElementsByTagName("a");
            resultCache = "";
            for (j = 0; j < res.length; j++) {
                url = res[j].href;
                if (j == 0)
                    resultUrl = url;

                if (url.indexOf("http://webcache.googleusercontent.com")==0 ||
                    url.indexOf("https://webcache.googleusercontent.com")==0)
                    resultCache = url;
            }

            resultNode.insertBefore(numFont, resultNode.firstChild);
            resultNode.setAttribute("style", "padding-left:10px;");
            resultNodes.push(new Result(resultNode, resultUrl, resultCache));
        }
    }

    toggleSidebar();
}

// Key table
// Move Key
const KEY_H = 72;
const KEY_J = 74;
const KEY_K = 75;
const KEY_L = 76;
const KEY_F = 70;
const KEY_B = 66;

// Edit Key
const KEY_R = 82;
const KEY_E = 69;
const KEY_A = 65;
const KEY_I = 73;

// Toggle Key
const KEY_T = 84;
const KEY_G = 71;
const KEY_S = 83;
const KEY_ESC = 27;

// Goto Key
const KEY_ENTER = 13;
const KEY_O = 79;
const KEY_C = 67;

// Num Key
const KEY_0 = 48;
const KEY_9 = 57;
const KEY_INV = -1;
const KEY_NUM = 1000;

function keydownHandler(evt)
{
    keyCode = evt.keyCode || evt.which || evt.charCode;
    trigger = true;

    if (replaceEnable) {
        if (keyCode == KEY_B) { // Go back a word
            evt.preventDefault();
            lastReplace--;
            replace();
        } else if (keyCode == KEY_F) { // Go foward a word
            evt.preventDefault();
            lastReplace++;
            replace();
        } else {
            searchBar.focus();
            replaceEnable = false;
        }

        return;
    }

    if (!keysEnable) {
        if (evt.target.tagName == "INPUT" && evt.target.name == "q" 
         && evt.keyCode == KEY_ESC) {
            searchBar.blur();
        } else 
            searchBar.focus();

        return;
    }

    if (keyCode >= KEY_0 && keyCode <= KEY_9) {  // 0,1,2...9
        nr = (keyCode >= 49) ? keyCode-49 : 9;
        if (nr > resultNodes.length)
            keyCode = KEY_INV;
        keyCode = KEY_NUM;          
    }

    switch (keyCode) {
        case KEY_NUM: 
            if (selectedResult != -1)
               resultNodes[selectedResult].blur(); 

            selectedResult = nr; 
            resultNodes[selectedResult].focus();

            if (!gotoMode)
                resultNodes[selectedResult].browserTo(1);

            break;
        case KEY_H: // Go to previous page
            prevNode = xpath("//td[@class='b'][1]/a");

            if (prevNode.snapshotLength != 0)
                document.location = prevNode.snapshotItem(0).href;

            break;
        case KEY_J: // Go to next result
            if (selectedResult != -1)
               resultNodes[selectedResult].blur(); 

            if (selectedResult >= resultNodes.length-1)
                selectedResult = 0;
            else 
                selectedResult++;			

            resultNodes[selectedResult].focus();

            break;
        case KEY_K: // Go to previous result
            if (selectedResult != -1)
               resultNodes[selectedResult].blur(); 

            if (selectedResult <= 0)
                selectedResult = resultNodes.length - 1;
            else 
                selectedResult--;			

            resultNodes[selectedResult].focus();

            break;
        case KEY_L: // Go to next page
            nextNode = xpath("//td[@class='b'][2]/a");

            if (nextNode.snapshotLength != 0)
                document.location = nextNode.snapshotItem(0).href;
            break;
        case KEY_R: // replace
            window.scrollTo(0, 0);
            replaceEnable = true;
            lastReplace = 0;
            replace();

            break;
        case KEY_E: // edit search string
            window.scrollTo(0, 0);
            searchBar.select();
            keysEnable = false;

            break;
        case KEY_A: // append search keyword or alt+a to open all results
            if (evt.altKey == true) {
                for (nr in resultNodes)
                    GM_openInTab(resultNodes[nr].resultUrl);
            } else {
                window.scrollTo(0, 0);
                searchBar.value += "  ";
                searchBar.selectionStart = searchBar.value.length - 1;
                searchBar.selectionEnd = searchBar.value.length;
                keysEnable = false;
            }

            break;
        case KEY_I: // insert search keyword
            window.scrollTo(0, 0);
            searchBar.value = "  " + searchBar.value;
            searchBar.selectionStart = 0;
            searchBar.selectionEnd = 1;
            keysEnable = false;

            break;
        case KEY_C:
            if (selectedResult != -1)
                resultNodes[selectedResult].browserTo(0);

            break;
        case KEY_T: // Toggle tabMode 
            tabMode = !tabMode;
            gotoMode = false;
            GM_setValue("tabMode", tabMode);
            nodes = xpath("//*[@id='_nr']"); 
            
            for (i = 0; i < nodes.snapshotLength; i++)
                nodes.snapshotItem(i).style.backgroundColor = tabMode?"#0CAE1A":"#0E38DA";

            break;
        case KEY_G: // Goto result
            gotoMode = !gotoMode;
            nodes = xpath("//*[@id='_nr']"); 
            
            for (i = 0; i < nodes.snapshotLength; i++)
                nodes.snapshotItem(i).style.backgroundColor = gotoMode?"#EF9202":(tabMode?"#0CAE1A":"#0E38DA");

            break;
        case KEY_S: // Toggle sidebar
            toggleSidebar();
            break;

        case KEY_ENTER: // Open the selected result
        case KEY_O:
            if (selectedResult != -1)
                resultNodes[selectedResult].browserTo(1);

            break;
        case KEY_ESC: // Quit help
            if (help != -1) {
                help.style.visibility = "hidden";
            }

            break;
        default:
            trigger = false;
    }

    if (trigger)
        evt.preventDefault();
}

const KEY_QMARK = 63; // ? question-mark 

function keypressHandler(evt)
{
    keyCode = evt.keyCode || evt.which || evt.charCode;

    if (keyCode == KEY_QMARK) {
        if (help == -1) {
            evt.preventDefault();
            help = document.createElement("div");
            document.body.appendChild(help);

            help.id = "help";
            help.className = "help";
            help.innerHTML = "<div role='alert' title='Click anywhere or press ESC to quit' style='padding:1em' tabindex='-1'>"
                + "<table class='title'><tbody><tr>"
                + "<td class='ltd'>Google Keys Extended Help</td>"
                + "<td class='rtd'><a href='http://userscripts.org/scripts/show/77817' class='a1'>Homepage</a> | <a class='a1' href='mailto:lvtuantuan1988@gmail.com'>Contact me</a></td>"
                + "</tr></tbody></table><table class='content'><tbody>"
                + "<tr><td class='key'>0,1,2...9:</td><td class='use'>Jump to result url<td></td></tr>"
                + "<tr><td class='key'>enter/o:</td><td class='use'>Go to selected result<td></td></tr>"
                + "<tr><td class='key'>?/esc:</td><td class='use'>Show/Quit help<td></td></tr>"
                + "<tr><td class='key'>alt+a:</td><td class='use'>Open all results in the page<td></td></tr>"
                + "<tr><td class='key'>esc:</td><td class='use'>Leave the search bar<td></td></tr>"
                + "<tr><td class='key'>j,k:</td><td class='use'>Go to next/previous result<td></td></tr>"
                + "<tr><td class='key'>h,l:</td><td class='use'>Go to next/previous page<td></td></tr>"
                + "<tr><td class='key'>c:</td><td class='use'>Go to selected result's cache content<td></td></tr>"
                + "<tr><td class='key'>t:</td><td class='use'>Tab mode, open in current/new tab<td></td></tr>"
                + "<tr><td class='key'>g:</td><td class='use'>Go to but not open result<td></td></tr>"
                + "<tr><td class='key'>e:</td><td class='use'>Edit/Erase the current search keywords<td></td></tr>"
                + "<tr><td class='key'>a:</td><td class='use'>Append search keyword to the current<td></td></tr>"
                + "<tr><td class='key'>i:</td><td class='use'>Insert search keyword to the current<td></td></tr>"
                + "<tr><td class='key'>r:</td><td class='use'>Replace mode, use f/b key to select keyword<td></td></tr>"
                + "<tr><td class='key'>s:</td><td class='use'>Show/Hide sidebar<td></td></tr>"
                + "</tbody></table></div>";

            GM_addStyle("\
                div.help{\
                    -moz-border-radius:10px;\
                    -webkit-border-radius:10px;\
                    background:none repeat scroll 0 50% #000000;\
                    color:#FFFFFF;\
                    font-weight:bold;\
                    position:fixed;\
                    top:10%;\
                    left:30%;\
                    width:40%;\
                    opacity:0.85;\
                    z-index:100;\
                }\
                table.title{\
                    width:100%;\
                    padding-bottom: 10px;\
                }\
                table.content{\
                    border-top: 1px solid #999999;\
                    padding: 10px 10px 0px 10px;\
                    width:100%;\
                }\
                td.ltd{\
                    text-align:left;\
                    font-size: 100%;\
                }\
                td.rtd{\
                    text-align:right;\
                }\
                .a1, .a1 visited, .a1 hover{\
                    color:#4343D5 !important;\
                    cursor:pointer;\
                    text-decoration:underline;\
                }\
                td.key{\
                    padding: 0.15em 1em;\
                    font-weight:bold;\
                    color:#F29603;\
                    text-align:right;\
                    width:20%;\
                }\
                td.use{\
                    padding:0.15em 1em;\
                    font-weight:normal;\
                    text-align:left;\
                }\
           ");
        }
        help.style.visibility = "";
    }
}

window.addEventListener("load", init, false);
window.addEventListener("keydown", keydownHandler, false);
window.addEventListener("keypress", keypressHandler, false);

window.addEventListener("click", function(evt) {
    if (evt.target.tagName != "INPUT" && evt.target.tagName != "A") {
        keysEnable = true;
        replaceEnable = false;

		if(help!=-1) {
			help.style.visibility="hidden";
		}
    }
}, false);
