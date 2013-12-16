var tab = 1;

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
        $('ul[data-dd="' + tabb + '"]').append('<li class="recived">' + message.message + '</li>');
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
            "<ul id='msg' data-dd='" + tabed + "'></ul>" +
            "</div>" +
            "<div>" +
            "<input type='text' data-id=" + tabed + " data-user=" + username + " id=" + tabed + " class='tm'/><button class='send' data-user=" + username + " data-tab=" + tabed + ">send</button>" +
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
            $('input[data-id="' + tabbed + '"]').val('');
            var use = $(this).data('user');
            $('ul[data-dd="' + tabbed + '"]').append('<li>' + msg + '</li>');
            chatHub.server.send(msg, use).fail(function (err) {
                console.log('Send method failed: ' + err);
            });

        });
        $('.tm').keypress(function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code === 13) {
                var use = $(this).data('user');
                var msg = $(this).val();
                $(this).val('');
                var tab = $(this).data('id');
                $('ul[data-dd="' + tab + '"]').append('<li>' + msg + '</li>');
                chatHub.server.send(msg, use).fail(function (err) {
                    console.log('Send method failed: ' + err);
                });
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