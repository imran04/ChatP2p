/// <reference path="../jquery-2.0.3.intellisense.js" />
var tab = 1;

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

$(function () {

    var chatHub = $.connection.chatHub,
        loginHub = $.connection.login,
        $sendBtn = $('#btnSend'),
        $msgTxt = $('#txtMsg');
       
    
   // turn the logging on for demo purposes
   // $.connection.hub.logging = true;

    chatHub.client.received = function (message) {

        var tab = $('li[data-user="' + message.sender + '"]');
        console.log(tab);
        var us = tab.data('user');
        var isTab = tab.find('input#shown');
        var tabb = isTab.data('tab');
        var isTabbed = isTab.val();
        console.log(tabb);
        if (isTab.val() == 'false') {
            insertTab(us, tabb);
            console.log('go');
            isTab.val('true');
        }
        $('ul[data-dd="' + tabb + '"]').append('<li class="recived last"><div class=""></div><div class="msgcon recive">' + message.message + '</div></li>');
        $('ul[data-dd="' + tabb + '"]').scrollTo('ul[data-dd="' + tabb + '"] li.last', { duration: 'slow', offsetTop: '50' }, function () { $('ul[data-dd="' + tabb + '"] li.last').last().removeClass('last'); });
        $('.msgcon').emoticonize();
        console.log(isTab.val());
        beep();


        
    };

    chatHub.client.userConnected = function (username) {
        $('#ull').append('<li class="pm" id="' + tab + username + '" data-user="' + username + '" ><span>' + username + '</span><input type="hidden" id="tab" value="' + tab + username + '"><input type="hidden" id="shown" data-tab="' + tab + username + '" value="false"/></li>');
        tab++;
        bindMe();

    };

    chatHub.client.userDisconnected = function (username) {
        console.log(username);
        $('li#' + username).remove();
        bindMe();

    };

    // $.connection.hub.starting(callback)
    // there is also $.connection.hub.(received|stateChanged|error|disconnected|connectionSlow|reconnected)

    // $($.connection.hub).bind($.signalR.events.onStart, callback)

    // $.connection.hub.error(function () {
    //     console.log("foo");
    // });

    startConnection();
    // ko.applyBindings(viewModel);

    function startConnection() {

        $.connection.hub.start().done(function () {

            toggleInputs(false);
            bindClickEvents();

            $msgTxt.focus();

            chatHub.server.getConnectedUsers().done(function (users) {

                var str = "<ul id='ull'>";
                $.each(users, function (i, username) {
                    console.log(username);
                    str += '<li class="pm" id="'
                        + tab + username + '"  data-user="' + username + '" ><span>'
                        + username + '</span><input type="hidden" id="shown" data-tab="'
                        + tab + username + '" value="false"/></li>';
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

    function bindClickEvents() {

        $msgTxt.keypress(function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code === 13) {
                sendMessage();
            }
        });

        $sendBtn.click(function (e) {

            sendMessage();
            e.preventDefault();
        });
    }

    function sendMessage() {

        var msgValue = $msgTxt.val();
        if (msgValue !== null && msgValue.length > 0) {

            if (viewModel.isInPrivateChat()) {

                chatHub.server.send(msgValue, viewModel.privateChatUser()).fail(function (err) {
                    console.log('Send method failed: ' + err);
                });
            }
            else {
                chatHub.server.send(msgValue).fail(function (err) {
                    console.log('Send method failed: ' + err);
                });
            }
        }

        $msgTxt.val(null);
        $msgTxt.focus();
    }

    function toggleInputs(status) {

        $sendBtn.prop('disabled', status);
        $msgTxt.prop('disabled', status);
    }


    function bindMe() {
        console.log('bind');
        $('.pm').click(function () {
            var us = $(this).data('user');
            var isTab = $(this).find('input#shown');
            var tabb = isTab.data('tab');
            var isTabbed = isTab.val();
            console.log(tabb);
            if (isTab.val() == 'false') {


                insertTab(us, tabb);
                console.log('go');
                isTab.val('true');
            }
            console.log(isTab.val());
            //$('#myTab a[href="#'+isTab+'"]').tab('show');
            //bindMe();
        });


    }

    function insertTab(username, tabed) {
        console.log(tabed);
        var str = "<div data-tabclose=" + tabed + " id='tbb'>" +
            "<div>" +
            "<h5>" + username +
            "<span data-tab=" + tabed + " class='close chatc'>x</span>" +
            "</h5>" +
            "<ul id='msg' class='msg ps-scrollbar' data-dd='" + tabed + "'></ul>" +
            "</div>" +
            "<div>" +
            "<textarea placeholder='Enter some text !' data-id='" + tabed + "' data-user='" + username + "' id='" + tabed + "' class='tm' ></textarea><button class='send' data-user=" + username + " data-tab=" + tabed + ">send</button>" +
            "</div></div>";
        $('#tabHolder').append(str);
        removeD();
    }

    function removeD() {
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
                if (msg.length>0) {
                    
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
});