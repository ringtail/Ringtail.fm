// 有关“空白”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: 此应用程序刚刚启动。在此处初始化
                //您的应用程序。
            } else {
                // TODO: 此应用程序已从挂起状态重新激活。
                // 在此处恢复应用程序状态。
            }

            WinJS.Application.onsettings = function (e) {
                e.detail.applicationcommands = {
                    //ADD 
                  
                }
                WinJS.UI.SettingsFlyout.populateSettings(e);
                var applicationCommandsVector = e.detail.e.request.applicationCommands;
                applicationCommandsVector.append(new Windows.UI.ApplicationSettings.SettingsCommand(
                    "privacy",
                    "隐私协议",
                    function () {
                        window.open('http://cnodejs.org/topic/50c1502b637ffa4155c8d504');
                    }
                ));
                applicationCommandsVector.append(new Windows.UI.ApplicationSettings.SettingsCommand(
                    "about",
                    "关于",
                    function () {
                        window.open('http://cnodejs.org/topic/50c1508a637ffa4155c8e359');
                    }
                ));
            }



            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.addEventListener("checkpoint", checkpointHandler);
    function checkpointHandler(eventArgs) {
        //处理挂起事件
       
    }
    var cf = new ContentFlow('contentFlow', { reflectionColor: "#000000" });
    $('body').css('background-image', DEFAULT_BG);
    app.start();
})();
