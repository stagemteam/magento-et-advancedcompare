//**
// * NOTICE OF LICENSE
// *
// * You may not sell, sub-license, rent or lease
// * any portion of the Software or Documentation to anyone.
// *
// * DISCLAIMER
// *
// * Do not edit or add to this file if you wish to upgrade to newer
// * versions in the future.
// *
// * @category   ET
// * @package    ET_AdvancedCompare
// * @copyright  Copyright (c) 2012 ET Web Solutions (http://etwebsolutions.com)
// * @contacts   support@etwebsolutions.com
// * @license    http://shop.etwebsolutions.com/etws-license-free-v1/   ETWS Free License (EFL1)
// */

var CompareNoReload = {

    compareAnimationCount: 0,

    compareRemoveFromListSilent: function(removeUrl)
    {
        new Ajax.Request(removeUrl, {
                onSuccess: function(response) {
                    var callBackMessage = response.responseText.evalJSON();
                    if (callBackMessage.unknown_error) {
                        alert(callBackMessage.unknown_error);
                    }
                CompareNoReload.compareUpdateSidebarHtml(response.responseText);
                CompareNoReload.rescanForNewCompare();
            }
        });
    },

    compareClearList: function (clearUrl,textAlert)
    {
        new Ajax.Request(clearUrl, {
                onSuccess: function(response) {
                var callBackMessage = response.responseText.evalJSON();
                if (callBackMessage.clear_error) {
                    alert(callBackMessage.clear_error);
                }
                CompareNoReload.compareUpdateSidebarHtml(response.responseText);
                CompareNoReload.rescanForNewCompare();
                }
            });
    },


    compareAddToList: function (addUrl,id2Animate)
    {
        this.startAnimation(id2Animate);
        new Ajax.Request(addUrl, {
                onSuccess: function(response) {
                var callBackMessage = response.responseText.evalJSON();
                    if (callBackMessage.cookieError) {
                        alert(callBackMessage.cookieError);
                    } else if (callBackMessage.unknown_error) {
                        alert(callBackMessage.unknown_error);
                    }
                CompareNoReload.compareUpdateSidebarHtml(response.responseText);
                CompareNoReload.rescanForNewCompare();
            }
        });
    return false;
    },

    /*
    compareUpdateSidebar: function ()
    {
        if(typeof($("compareUpdateUrl")) !== 'undefined')
           new Ajax.Request($("compareUpdateUrl").value, {
              method: 'post',
              parameters: $('shipping-type').serialize(true),
              onSuccess: function(response) {
            this.getCompareSideBlock().update(response.responseText);
            this.rescanForNewCompare();
            }
        });
    },
    */

    compareUpdateSidebarHtml: function (updateText)
    {
        if(typeof(this.getCompareSideBlock()) != 'undefined'){
        //compareAnimationText=eval(updateText);
            this.getCompareSideBlock().replace(eval(updateText));
        }
    },


    startAnimation: function (id2Animate)
    {
        if(typeof(id2Animate)!= 'undefined') {
        if((typeof(this.getCompareSideBlock()) != 'undefined')&($(id2Animate) != null)) {

            var xy=this.getCompareSideBlock().cumulativeOffset();
            var dmnsns = this.getCompareSideBlock().getDimensions();
            var endPosition={
                top    :xy[1]+dmnsns.height-5-22,
                left    :xy[0]+dmnsns.width-5-79,
                width    :79,
                height    :22
                };
            var animatedSteps=10;
            var animatedTime=0.75;
            var xy=$(id2Animate).cumulativeOffset();
            var dmnsns = $(id2Animate).getDimensions();

            var startPosition={
                top    :xy[1],
                left    :xy[0],
                width    :dmnsns.width,
                height    :dmnsns.height
                };

            var accelerationX=(endPosition.left-startPosition.left)*2/animatedSteps/animatedSteps;
            var accelerationY=(endPosition.top-startPosition.top)*2/animatedSteps/animatedSteps;

            if($('animated_div')==null)
                {
                $$('div.wrapper')[0].insert({bottom:'<div id="animated_div"></div>'});
                }
            
            $('animated_div').setStyle({
                    "position"    :"absolute",
                    "left"        :startPosition.left+"px",
                    "top"        :startPosition.top+'px',
                    "width"        :startPosition.width+'px',
                    "height"    :startPosition.height+'px',
                    "display"    :""
                    });
            $('animated_div').setOpacity(0.7);

            for(var i=0;i<animatedSteps;i++)
                {

                Element.setStyle.delay(animatedTime/animatedSteps*i, "animated_div",
                    {
                    "top"    :(startPosition.top+parseInt(accelerationY*i*i/2))+"px",
                    "left"    :(startPosition.left+parseInt(accelerationX*i*i/2))+"px",
                    "width"    :(startPosition.width-parseInt((startPosition.width-endPosition.width)/animatedSteps*i))+"px",
                    "height"    :(startPosition.height-parseInt((startPosition.height-endPosition.height)/animatedSteps*i))+"px"
                    });

                }

            Element.setStyle.delay(animatedTime/animatedSteps*(animatedSteps+1), "animated_div",
                {
                    "display"    :"none"
                });

                
            }
        }
    },

    compareAnimationMove: function()
    {
        new PeriodicalExecuter(function(pe) {
            this.compareAnimationCount++;
        }, 0.2);

    },


    rescanForNewCompare: function()
    {
        var allOldLinks=$$("a[href*=product_compare/add/product]");
        for (var i=0;i<allOldLinks.length;i++) {
           if(allOldLinks[i].readAttribute("oldlink")==null)
            {
            var tmpHref=allOldLinks[i].href;
            allOldLinks[i].href="#";
            allOldLinks[i].writeAttribute("oldlink",tmpHref);
            var fparent=this.findParentByCss(allOldLinks[i],"li.item");
            if (fparent==null) {
                fparent=this.findParentByCss(allOldLinks[i],"li");
            }
            if (fparent.id=="") {
                fparent.id="divforcomparing"+i;
            }

            var myString = new String(tmpHref)
            rExp = /\/add\//gi;
            tmpHref = myString.replace(rExp, "/silentadd/");

            allOldLinks[i]['onclick']=new Function("return CompareNoReload.compareAddToList('"+tmpHref+"','"+fparent.id+"')");
            }
        }

        var allOldLinks=$$("a[href*=product_compare/clear]");
        for (var i=0;i<allOldLinks.length;i++) {
            if(allOldLinks[i].readAttribute("oldlink")==null)
            {
            var tmpHref=allOldLinks[i].href;
            allOldLinks[i].writeAttribute("oldlink",tmpHref);

            var myString = new String(tmpHref)
            rExp = /\/clear\//gi;
            tmpHref = myString.replace(rExp, "/silentclear/");

            allOldLinks[i].href="javascript:CompareNoReload.compareClearList('"+tmpHref+"')";
            }
        }

        var allOldLinks=$$("a[href*=product_compare/remove]");
        for(var i=0;i<allOldLinks.length;i++) {
            if(allOldLinks[i].readAttribute("oldlink")==null)
            {
            var tmpHref=allOldLinks[i].href;
            allOldLinks[i].writeAttribute("oldlink",tmpHref);

            var myString = new String(tmpHref)
            rExp = /\/remove\//gi;
            tmpHref = myString.replace(rExp, "/silentremove/");

            allOldLinks[i].href="javascript:CompareNoReload.compareRemoveFromListSilent('"+tmpHref+"')";
            }
        }
    },


    findParentByCss: function(element,rule)
    {
        var el2ret=element.parentNode;
        if (el2ret.tagName=="body") {
            return null;
        }
        if (el2ret.tagName=="BODY") {
            return null;
        }
        if ($(el2ret).match(rule)) {
            return el2ret;
        } else {
            return this.findParentByCss(element.parentNode,rule);
        }
    },

    getCompareSideBlock: function ()
    {    //1.3.x.x
        if ($$("div.mini-compare-products").length>0) {
            return $$("div.mini-compare-products")[0];
        }
        //1.4+
        return $$("div.block-compare")[0];
    }
}



Event.observe(window, 'load', function()
{

//redefining click
    CompareNoReload.rescanForNewCompare();

if(CompareNoReload.getCompareSideBlock() == null) {
    if($$('div.col-left').length>0)$$('div.col-left')[0].insert({bottom:'<div class="block-compare"></div>'});
    else if($$('div.col-right').length>0)$$('div.col-right')[0].insert({bottom:'<div class="block-compare"></div>'});
    }
});
