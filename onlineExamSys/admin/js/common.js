/** 
* 在iframe中调用，在父窗口中出提示框(herf方式不用调父窗口)
*/
$.extend({
    show_warning: function (strTitle, strMsg) {
        $.messager.show({
            title: strTitle,
            width: 300,
            height: 100,
            msg: strMsg,
            closable: true,
            showType: 'slide',
            style: {
                right: '',
                top: document.body.scrollTop + document.documentElement.scrollTop,
                bottom: ''
            }
        });
    }
});

/** 
* 弹框
*/
$.extend({
    show_alert: function (strTitle, strMsg) {
        $.messager.alert(strTitle, strMsg);
    }
});

/**
* @author 孙宇
* 
* @requires jQuery,EasyUI
* 
* 扩展validatebox，添加验证两次密码功能
*/
$.extend($.fn.textbox.defaults.rules, {
    eqPwd: {
        validator: function (value, param) {
            return value == $(param[0]).val();
        },
        message: '密码不一致！'
    }
});

/**
* @author 风骑士
* 
* @requires jQuery,EasyUI
* 
* 初始化datagrid toolbar
*/
getToolBar = function (data) {
    if (data.toolbar != undefined && data.toolbar != '') {
        var toolbar = [];
        $.each(data.toolbar, function (index, row) {
            var handler = row.handler;
            row.handler = function () { eval(handler); };
            toolbar.push(row);
        });
        return toolbar;
    } else {
        return [];
    }
}

getButton = function (menucode) {
    $.ajax({     //请求当前用户可以操作的按钮
        url: "ashx/rm_button.ashx?menucode=" + menucode + "&pagename=" + "ui_" + menucode,
        type: "post",
        data: { "action": "getbutton" },
        dataType: "json",
        timeout: 5000,
        success: function (data) {
            if (data.success) {
                var toolbar = getToolBar(data);      //common.js
                if (data.browser) {     //判断是否有浏览权限                    
                    var func = eval("ui_" + menucode + "_init_list");
                    func(toolbar);
                }
                else {
                    $.show_warning("提示", "无权限，请联系管理员！");
                }
            } else {
                $.show_warning("错误", data.msg);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus == "timeout") {
                $.show_warning("提示", "请求超时，请刷新当前页重试！");
            }
            else {
                $.show_warning("错误", textStatus + "：" + errorThrown);
            }
        }
    });
    //回车搜索
    $("#ui_loginlog_search").find('input').on('keyup', function (event) {
        if (event.keyCode == '13') {
            ui_loginlog_searchdata();
        }
    })
}

/**
* @author 孙宇
*
* 接收一个以逗号分割的字符串，返回List，list里每一项都是一个字符串（做编辑功能的时候 传入id 然后自动勾选combo系列组件）
*
* @returns list
*/
stringToList = function (value) {
    if (value != undefined && value != '') {
        var values = [];
        var t = value.split(',');
        for (var i = 0; i < t.length; i++) {
            values.push('' + t[i]); /* 避免将ID当成数字 */
        }
        return values;
    } else {
        return [];
    }
};

/*
 * title: 对话框标题
 * modname: 模块名称
 * url:提交的url
 * html:编辑的网页
 * action: add|edit
 * w:对话框宽度
 * h:对话框高度
 * fnLoad:对话框加载后执行的函数
 * 
 */
ui_dg_add_edit = function(title,modname,submiturl,html,action,w,h,fnSuccess,fnLoad,fnValidate) {	
    $("<div/>").dialog({
        id: modname+"_add_dialog",
        href: html,
        title: title,
        iconCls: action=='add'?'icon-add':'icon-edit',
        height: h,
        width: w,
        modal: true,
        buttons: [{
            id: modname+"_add_btn",
            iconCls: action=='add'?'icon-add':'icon-edit',
            text: action=='add'?'添 加':'修改',
            handler: function () {
                $("#"+modname+"_editform").form("submit", {
                    url: submiturl,
                    onSubmit: function (param) {
                        $('#'+modname+'_add_btn').linkbutton('disable');    //点击就禁用按钮，防止连击
                        param.action = action;
                        if ($(this).form('validate')){
                        	var f = true;
                        	if(fnValidate) f = fnValidate();
                        	if(!f){
                        		$('#'+modname+'_add_btn').linkbutton('enable');   //恢复按钮
                        	}
                        	return f;
                        }
                        else {
                            $('#'+modname+'_add_btn').linkbutton('enable');   //恢复按钮
                            return false;
                        }
                    },
                    success: function (data) {                    	
                        var dataJson = eval('(' + data + ')');    //转成json格式
                        if (dataJson.success) {
                            $("#"+modname+"_add_dialog").dialog('destroy');  //销毁dialog对象
                            $.show_warning("提示", dataJson.msg);
                            if(fnSuccess){
                            	fnSuccess();
                            }else{
                            	$("#"+modname+"_dg").datagrid("reload").datagrid('clearSelections').datagrid('clearChecked');
                            }
                        } else {
                            $('#'+modname+'_add_btn').linkbutton('enable');   //恢复按钮
                            $.show_warning("提示", dataJson.msg);
                        }
                    }
                });
            }
        }],
        onLoad: function () {        	
        	if(fnLoad) fnLoad();
        },
        onClose: function () {
            $("#"+modname+"_add_dialog").dialog('destroy');  //销毁dialog对象
        }
    });
}

ui_common_dlg = function(title,modname,icon,btnname,html,action,w,h,fnHandler,fnLoad) {	
    $("<div/>").dialog({
        id: modname+"_common_dialog",
        href: html,
        title: title,
        iconCls: icon,
        height: h,
        width: w,
        modal: true,
        buttons: [{
            id: modname+"_common_btn",
            iconCls: icon,
            text:btnname ,
            handler: function () {
                if(fnHandler) fnHandler();
            }
        }],
        onLoad: function () {        	
        	if(fnLoad) fnLoad();
        },
        onClose: function () {
            $("#"+modname+"_common_dialog").dialog('destroy');  //销毁dialog对象
        }
    });
}

ui_dg_delete=function(title,modname,url,fnSuccess){
    var rows = $("#"+modname+"_dg").datagrid("getChecked");
    if (rows.length < 1) {
        $.show_warning("提示", "请先勾选要删除的"+title);
        return;
    }
    $.messager.confirm('提示', '确定删除勾选的这' + rows.length + '个'+title+'？', function (r) {
        if (r) {
            para = {};
            para.action = "delete";
            para.timespan = new Date().getTime();
            
            var ids = [];
            $.each(rows, function (i, row) {
                ids.push(row.id);
            });
            para.ids = ids.join(",");
            $.ajax({
                url: url,
                data: para,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.success) {
                        $.show_warning("提示", "删除成功！");
                        
                        if(fnSuccess){
                        	fnSuccess();
                        }
                        else{
                        	$("#"+modname+"_dg").datagrid("reload").datagrid('clearSelections').datagrid('clearChecked');
                        }
                    } else {
                        $.show_warning("提示", data.msg);
                    }
                }
            });
        }
    });
}


getNewTypeId=function(id){	
	var typeId = parseInt(id);
	if(typeId>=10 && typeId<20)
		return 1;
	if(typeId>=20 && typeId<30)
		return 2;
	if(typeId>=30 && typeId<40)
		return 3;
	if(typeId>=40 && typeId<50)
		return 4;
	if(typeId>=50 && typeId<60)
		return 5;
	
	return 6;
}

