/// <reference path="../jquery-2.0.3.intellisense.js" />
var tab = 1;
var online = 0;
var chatHub = $.connection.chatHub,
       loginHub = $.connection.login;
//ScrollTo Plugin
//http://flesler.blogspot.com/2007/10/jqueryscrollto.html
$.fn.scrollTo = function (target, options, callback) {
    if (typeof options == 'function' && arguments.length == 2) { callback = options; options = target; }
    var settings = $.extend({
        scrollTarget: target,
        offsetTop: 50,
        duration: 500,
        easing: 'swing'
    }, options);
    return this.each(function () {
        var scrollPane = $(this);
        var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
        var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
        scrollPane.animate({ scrollTop: scrollY }, parseInt(settings.duration), settings.easing, function () {
            if (typeof callback == 'function') { callback.call(this); }
        });
    });
}
//Chat functions
//
function startTime()
{
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    var s=today.getSeconds();
    // add a zero in front of numbers<10
    m=checkTime(m);
    s=checkTime(s);
    var hd=h;
    //document.getElementById('txt').innerHTML=(hd=0?"12":hd>12?hd-12:hd)+":"+m+":"+s+" "+(h<12?"AM":"PM");
    //t=setTimeout(function(){startTime()},500);
}

function checkTime(i)
{
    if (i<10)
    {
        i="0" + i;
    }
    return i;
}


var template = $.templates("#ChatBox");
var UserInfo = $.templates("#UserItem");
var Message = $.templates("#MessageItem");
$.fn.AddMessage = function (data) {
    target = this;
    $(target).append(Message.render(data));
    $(target).scrollTo('li.last', { duration: 'slow', offsetTop: '50' }, function () { $('li.last').last().removeClass('last'); });
    $('.msgcon').emoticonize();
}
FindTab = function (user) {
    var tab = $('li[data-user="' + user + '"]');
    var isTab = tab.find('input#shown');
    var tabb = isTab.data('tab');
    if (isTab.val() == 'false') {
        var us = tab.data('user');
        insertTab(us, tabb);
        isTab.val('true');
    }
    return $('ul[data-dd="' + tabb + '"]');

}

function bindMe() {
    $('span.noUser').html(online);
    $('.chatBar div.user').click(function () {
        $('#Users').slideToggle('slow');
    });
    $('.hideBar').click(function () {
        $('#Users').slideToggle('slow');
    });
    $('.pm').click(function ()
    {
        var us = $(this).data('user');
        TabToggle(us);
        //var isTab = $(this).find('input#shown');
        //var tabb = isTab.data('tab');
        //var isTabbed = isTab.val();
        //if (isTab.val() == 'false')
        //{
        //    insertTab(us, tabb);
        //    isTab.val('true');
        //}
    });


}

function insertTab(username, tabed) {
    console.log(tabed);
    var data = { tab: tabed, username: username };
    $('#tabHolder').append(template.render(data));
    SetVisible();
}
function SearchTab(username){

}

function MiniMizeTab(user) {
    var tab = $('li[data-user="' + user + '"]');
    var isTab = tab.find('input#shown');
    var tabb = isTab.data('tab');
    if (isTab.val() == 'false') {
        var us = tab.data('user');
        insertTab(us, tabb);
        isTab.val('hide');
    }
    $('div[data-tabclose="' + tabb + '"]').hide();
    
}
function MaxiMizeTab(user) {
    var tab = $('li[data-user="' + user + '"]');
    var isTab = tab.find('input#shown');
    var tabb = isTab.data('tab');
    if (isTab.val() == 'false') {
        var us = tab.data('user');
        insertTab(us, tabb);
        isTab.val('true');
    }
    $('div[data-tabclose="' + tabb + '"]').show();


}
function TabToggle(user) {
    var tab = $('li[data-user="' + user + '"]');
    var isTab = tab.find('input#shown');
    var tabb = isTab.data('tab');
    if (isTab.val() == 'false') {
        var us = tab.data('user');
        insertTab(us, tabb);
        isTab.val('true');
        return;
    }
    if (isTab.val() == 'hide')
    {
        isTab.val('true');
    }
    if (isTab.val() == 'true')
    {
        isTab.val('hide');
    }
    $('div[data-tabclose="' + tabb + '"]').toggle();
}


function CloseTab(username) {

}


function SetVisible() {
    $('.chatc').click(function () {
        var ctb = $(this).data('tab');
        $('div[data-tabclose="' + ctb + '"]').remove();
        $('input[data-tab="' + ctb + '"]').val('false');

    });
    $('button.send').click(function () {
        var tabbed = $(this).data('tab');
        var msg = $('input[data-id="' + tabbed + '"]').val();
        console.log(msg);
        if (msg != null) {
            $('input[data-id="' + tabbed + '"]').val('');
            var use = $(this).data('user');
            $('ul[data-dd="' + tabbed + '"]').append('<li class="last from"><div class="msgcon sent">' + msg + '</div><div class=""></div></li>');
            $('ul[data-dd="' + tabbed + '"]').scrollTo('ul[data-dd="' + tabbed + '"] li.last', { duration: 'slow', offsetTop: '50' }, function () { $('ul[data-dd="' + tabbed + '"] li.last').last().removeClass('last'); });
            //$('ul[data-dd="' + tabbed + '"] ').animate({
            //    scrollTop: $('ul[data-dd="' + tabbed + '"] li.last').last().offset().top
            //}, 20, 'swing', function () { $('ul[data-dd="' + tabbed + '"] li.last').last().removeClass('last'); });


            $('.msgcon').emoticonize();
            chatHub.server.send(msg, use).fail(function (err) {
                console.log('Send method failed: ' + err);
            });
        }

    });
    $('.tm').keypress(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code === 13) {

            var use = $(this).data('user');
            var msg = $(this).val();
            $(this).val('');
            if (msg.length > 0) {

                var tab = $(this).data('id');
                $('ul[data-dd="' + tab + '"]').append('<li class="last from"><div class="msgcon sent">' + msg + '</div><div class=""></div></li>');
                $('ul[data-dd="' + tab + '"]').scrollTo('ul[data-dd="' + tab + '"] li.last', { duration: 'slow', offsetTop: '50' }, function () { $('ul[data-dd="' + tab + '"] li.last').last().removeClass('last'); });
                $('.msgcon').emoticonize();
                chatHub.server.send(msg, use).fail(function (err) {
                    console.log('Send method failed: ' + err);
                });
            }
        }
    });

}
function beep() {

    doPlay();
}

function getPlayer(pid) {
    var obj = document.getElementById(pid);
    if (obj.doPlay) return obj;
    for (i = 0; i < obj.childNodes.length; i++) {
        var child = obj.childNodes[i];
        if (child.tagName == "EMBED") return child;
    }
}
function doPlay(fname) {
    var player = getPlayer("audio1");
    player.play(fname);
}
function doStop() {
    var player = getPlayer("audio1");
    player.doStop();
}


$(function () {
  
   // turn the logging on for demo purposes
   // $.connection.hub.logging = true;

    chatHub.client.received = function (message) {
        
        var data = { message: message.message, status: "recived", status1: "recive" };
        FindTab(message.sender).AddMessage(data);
        beep();


        
    };

    chatHub.client.userConnected = function (username) {
        var data = { tabid: username + tab, username: username, state: "false" };
        $('#ull').append(UserInfo.render(data));
        tab++;
        online++;
        bindMe();

    };

    chatHub.client.userDisconnected = function (username) {
        console.log(username);
        online--;
        $('li[data-user="' + username+'"]').remove();
        bindMe();

    };

    // $.connection.hub.starting(callback)
    // there is also $.connection.hub.(received|stateChanged|error|disconnected|connectionSlow|reconnected)

    // $($.connection.hub).bind($.signalR.events.onStart, callback)

    // $.connection.hub.error(function () {
    //     console.log("foo");
    // });

    startConnection();
  

    function startConnection() {

        $.connection.hub.start().done(function () {

            

            chatHub.server.getConnectedUsers().done(function (users) {

                var str = "<ul id='ull'>";
                $.each(users, function (i, username) {
                    online++;
                    var data = { tabid: username + tab, username: username,state:"false" };
                    str += UserInfo.render(data);
                    tab++;
                });
                str += '</ul>';
                $('#Users').append(str);
                bindMe();
            });

        }).fail(function (err) {

            console.log(err);
        });
    }

  


    
});