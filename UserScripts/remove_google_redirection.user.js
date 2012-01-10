// ==UserScript==
// @id             remove_google_redirection@google.com
// @name           Remove Google Redirection
// @namespace      http://dango-akachan.appspot.com
// @description    Remove Google redirection, Disable click-tracking in Google search result, and repair Google cache links (because of GFW) 
// @author         tuantuan <dangoakachan@gmail.com>
// @homepage       http://dango-akachan.appspot.com
// @version        0.7.1
// @include        http://www.google.*/search*
// @include        http://www.google.*/*sclient=psy*
// @include        http://ipv6.google.com/search*
// @include        https://www.ggssl.com/search*
// @include        http://groups.google.com/groups/search*
// @include        https://groups.google.com/groups/search*
// @include https://encrypted.google.com/search* 
// ==/UserScript==

/*
 * This scripts has these following features:
 * a. Disable click-tracking in Google search result.
 * b. Repair Google cache with gggssl.com
 * c. Remove Google redirection, restore the url from
 *      "http://www.google.com/url?url=http://example.com" 
 *    to 
 *      "http://example.com" 
 *
 * Now Support:
 * a. Google search (including news search)
 * b. Google Groups search
 *
 * Problem:
 * a. Not work very well with Google Instant
 * 
 * Changelog:
 * version 0.7
 * a. Add tooltip to each link.
 *
 * version 0.6 13/03/2011
 * a. Code optimization.
 * b. Fix a bug in Google Instant with "show more results from .."
 *
 * version 0.5 12/03/2011
 * a. Fix a bug with "Show more results from .."
 *
 * version 0.4 12/03/2011
 * a. More accurate and faster to find links that needed to be 
 *    processed by using XPath.
 * b. Optimize code structure.
 * 
 * version 0.3 09/03/2011
 * a. Add event listener to "hashchange" instead of "DOMAttrModified".
 * b. Add Google Group search support.
 */

(function() {
    function xpath(expr)
    {
        return document.evaluate(
            expr,
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
    }

    function base_process(evt) 
    {
        var redirect_re = /url\?(?:url|q)=([^&]*)/;
        var links = xpath("//div[@id='res']//a[starts-with(@href, '/url') or \
            starts-with(@href, 'http://www.google.com/url') or \
            starts-with(@href, 'https://encrypted.google.com/url') or \
            starts-with(@href, 'http://webcache.googleusercontent.com') or \
            starts-with(@onmousedown, 'return rwt(this,') or \
            starts-with(@onmousedown, 'return clk(this,')]");

        // Stop propagation
        evt.stopPropagation();

        for (var i=0, l="", len=links.snapshotLength; i < len; i++) {
            l = links.snapshotItem(i);

            //Remove click tracking 
            if (l.hasAttribute("onmousedown"))
                l.removeAttribute("onmousedown");

            //Google cache repair
            if (l.href.indexOf("http://webcache.googleusercontent.com") != -1)
                l.href = l.href.replace("http://webcache.googleusercontent.com", 
                    "https://www.ggssl.com/cache");
            else if (redirect_re.test(l.href))  // Remove redirection
                l.href = decodeURIComponent(l.href.match(redirect_re)[1]);

            // Add tooltip to each link
            if (!l.hasAttribute("title"))
                l.setAttribute("title", l.href);
        }
    }

    function process(evt)
    {
        base_process(evt)

        // Trigger when click "Show more results from .."
        var mblinks = xpath("//a[@class='mblink']");

        for(var i = 0, len = mblinks.snapshotLength; i < len; i++)
           mblinks.snapshotItem(i).addEventListener("DOMNodeInserted", base_process, false);
    }
    
    // Trigger when page loaded
    window.addEventListener("DOMContentLoaded", process, false);

    // Trigger when location.hash change ( For Google Instant Search )
    // This still doesn't work very well with google instant.
    window.addEventListener("hashchange", process, false);
})();
