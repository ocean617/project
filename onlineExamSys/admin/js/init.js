$(function () {
    initLogin();
})

function initLogin() {
    $('#treeLeft').tree({    //初始化左侧功能树（不同用户显示的树是不同的）
        method: 'GET',
        url: 'menuServlet.do?action=listSysMenu',
        lines: true,        
        onClick: function (node) {    //点击左侧的tree节点  打开右侧tabs显示内容
            if (node.url) {
                addTab(node.text, node.url, node.iconCls);
            }
        }
    });

    $.ajax({
        url: "loginServlet.do",
        type: "post",
        data: { action: "getuser" },
        dataType: "json",
        success: function (user) {
        	
            if (user && user.name) {
            	 $("#div_welcome").html("当前登录用户：" + user.name + "["+user.deptName+"]");              
            }
            else {            	
            	window.location.href = "login.html";  
            }
        }
    });
}

function addTab(subtitle, url, icon) {
    if (!$('#tabs').tabs('exists', subtitle)) {
        $('#tabs').tabs('add', {
            title: subtitle,
            href: url,
            iconCls: icon,
            closable: true,
            loadingMessage: '正在加载中......'
        });
    } else {
        $('#tabs').tabs('select', subtitle);
    }
}

function refreshTab() {
    var index = $('#tabs').tabs('getTabIndex', $('#tabs').tabs('getSelected'));
    if (index != -1) {
        $('#tabs').tabs('getTab', index).panel('refresh');
    }
}

function closeTab() {
    $('.tabs-inner span').each(function (i, n) {
        var t = $(n).text();
        if (t != '') {
            $('#tabs').tabs('close', t);
        }
    });
}

//查看当前用户信息
function searchMyInfo() {
    $("<div/>").dialog({
        id: "ui_myinfo_dialog",
        href: "myinfo.html",
        title: "我的信息",
        iconCls:'icon-boss',
        height:200,
        width: 320,
        modal: true,
        onLoad: function () {
            $.ajax({
                url: "loginServlet.do?action=getuser&t=" + new Date().getTime(),
                type: "post",
                dataType: "json",
                success: function (user) {
                    $("#ui_myinfo_username").html(user.no);
                    $("#ui_myinfo_realname").html(user.name);
                    $("#ui_myinfo_adddate").html(user.regTime);
                    $("#ui_myinfo_roles").html( user.roleName);
                    $("#ui_myinfo_departments").html(user.deptName);
                    //长度超过12个字符就隐藏
                }
            });
        },
        onClose: function () {
            $("#ui_myinfo_dialog").dialog('destroy');  //销毁dialog对象
        }
    });
}

//修改密码
function changePwd() {
    $("<div/>").dialog({
        id: "ui_user_changepwd_dialog",
        href: "changepwd.html",
        title: "修改密码",
        iconCls:'icon-set',
        height: 240,
        width: 380,
        modal: true,
        closable: false,
        buttons: [{
            id: "ui_user_changepwd_edit",
            text: '修 改',
            iconCls:'icon-edit',
            handler: function () {
                $("#ui_user_changepwd_form").form("submit", {
                    url: "loginServlet.do",
                    onSubmit: function (param) {
                        $('#ui_user_changepwd_edit').linkbutton('disable');  //点击就不可用，防止连击
                        param.action = 'changepwd';
                        if ($(this).form('validate'))
                            return true;
                        else {
                            $('#ui_user_changepwd_edit').linkbutton('enable');   //恢复按钮
                            return false;
                        }
                    },
                    success: function (data) {
                        $('#ui_user_changepwd_edit').linkbutton('enable');       //恢复按钮
                        var dataBack = $.parseJSON(data);                       //序列化成对象
                        if (dataBack.success) {                            
                            alert(dataBack.msg);
                            window.location.href = "login.html";
                        }
                        else {
                            $('#ui_user_changepwd_edit').linkbutton('enable');
                            $.show_warning("提示", dataBack.msg);
                        }
                    }
                });
            }
        }, {
            text: '取 消',
            iconCls: 'icon-cancel',
            handler: function () { $("#ui_user_changepwd_dialog").dialog('destroy'); }
        }],
        onLoad: function () {
            $("#ui_user_changepwd_originalpwd").focus();
        }
    });
}

//退出系统
function loginOut() {
    if (confirm("确定退出当前陆登账户？")) {
        var para = { "action": "logout" };
        $.ajax({
            url: "loginServlet.do",
            type: "post",
            data: para,
            dataType: "json",
            success: function (result) {
                if (result.success) {
                    window.location.href = "login.html";
                }
                else {
                    $.show_warning("提示", result.msg);
                }
            }
        })
    }
}