/* 后台响应数据节点名称 */
XML_SOURCE_TREE = "SourceTree";
XML_RECORD_DATA = "RecordData";
XML_SOURCE_INFO = "SourceInfo";

PAGESIZE = 100;

/* XMLHTTP请求地址汇总 */
URL_SOURCE_TREE    = AUTH_PATH + "rc/all";
URL_GROUPS_TREE    = AUTH_PATH + "rc/groups";
URL_SOURCE_DETAIL  = AUTH_PATH + "rc/detail";
URL_SAVE_SOURCE    = AUTH_PATH + "rc";
URL_DELETE_SOURCE  = AUTH_PATH + "rc/";
URL_DISABLE_SOURCE = AUTH_PATH + "rc/disable/";
URL_SORT_SOURCE    = AUTH_PATH + "rc/sort/";
URL_MOVE_SOURCE    = AUTH_PATH + "rc/move/";
URL_GET_OPERATION  = AUTH_PATH + "rc/operations/";  // {id}
URL_RECORD_CSV_TL  = AUTH_PATH + "xdata/import/tl/";
URL_EXPORT_RECORD  = AUTH_PATH + "export/record/"
URL_ROLE_LIST	   = AUTH_PATH + "service/roles";

if(IS_TEST) {
	URL_SOURCE_TREE    = "data/record_tree.xml?";
	URL_GROUPS_TREE    = "data/groups_tree.xml?";
	URL_SOURCE_DETAIL  = "data/record_detail.xml?";
	URL_SAVE_SOURCE    = "data/_success.xml?";
	URL_DELETE_SOURCE  = "data/_success.xml?";
	URL_DISABLE_SOURCE = "data/_success.xml?";
	URL_SORT_SOURCE    = "data/_success.xml?";
	URL_MOVE_SOURCE    = "data/_success.xml?";
	URL_GET_OPERATION  = "data/_operation.xml?";
	URL_EXPORT_RECORD  = "data/_success.xml?";
	URL_ROLE_LIST	   = "../um/data/role_list.json?";
}

$(function() {
	init();

	$.getJSON(URL_ROLE_LIST, {}, function(data) {
		var el1 = $1("_role1"), el2 = $1("_role2");
		data.push({});
		data.reverse();
		data.each(function(i, role) {
			el1.options[i] = $.createOption(role, 1, 1);
			el2.options[i] = $.createOption(role, 1, 1);
		});
	}, "GET");
});	

/* 页面初始化 */
function init() {
	initMenus();
	initEvents();

	loadInitData();
}

/* 菜单初始化 */
function initMenus() {
	/* 树菜单初始化  */
	ICON = "images/"
	var item1 = {
		label:"录入数据",
		callback:showRecord,
		icon: ICON + "icon_edit.gif",
		visible:function() {return isRecord() && !isTreeNodeDisabled() && getOperation("1");}
	}
	var item21 = {
		label:"修改分组",
		callback: function() {
			loadRecordDetail(false, "0");
		},
		visible:function() { return isRecordGroup() && getOperation("2"); }
	}
	var item22 = {
		label:"修改数据表定义",
		callback: function() {
			loadRecordDetail(false, "1");
		},
		icon: ICON + "icon_define.gif",
		visible:function() { return isRecord() && getOperation("2"); }
	}
	var item23 = {
		label:"查看数据表定义",
		callback: function() {
			loadRecordDetail(false, "1", true);
		},
		icon: ICON + "icon_view.gif",
		visible:function() { return isRecord() && getOperation("1") && !getOperation("2"); }
	}
	var item24 = {
		label:"测试数据表",
		callback: function() {
			window.open( "recorder.html?id=" + getTreeNodeId() );
		},
		visible:function() { return isRecord() && getOperation("2"); }
	}
	var item3 = {
		label:"新增数据表",
		callback: function() {
			loadRecordDetail(true, "1");
		},
		icon: ICON + "record_0.png",
		visible:function() {return (isRecordGroup() || isTreeRoot()) && getOperation("2");}
	}
	var item4 = {
		label:"新增分组",
		callback: function() {
			loadRecordDetail(true, "0");
		},
		icon: ICON + "icon_folder_new.gif",
		visible:function() {return (isRecordGroup() || isTreeRoot()) && getOperation("2");}
	}
	var item10 = {
		label:"停用",
		callback:disableRecord,
		icon: ICON + "icon_stop.gif",
		visible:function() {return !isTreeRoot() && !isTreeNodeDisabled() && getOperation("2");}
	}
	var item9 = {
		label:"启用",
		callback:enableRecord,
		icon: ICON + "icon_start.gif",
		visible:function() {return !isTreeRoot() && isTreeNodeDisabled() && getOperation("2");}
	}
	var item5 = {
		label:"删除",
		callback: deleteRecord,
		icon: ICON + "icon_del.gif",
		visible:function() {return !isTreeRoot() && getOperation("3");}
	}
	var item6 = {
		label:"移动到",
		callback: moveRecord,
		icon: ICON + "icon_move.gif",
		visible:function() {return !isTreeRoot() && getOperation("2");}
	}
	var item7 = {
		label:"下载导入模板",
		callback: getImportTL,
		icon: ICON + "icon_down.gif",
		visible:function() { return isRecord() && getOperation("1") && canBatchImp(); }
	}
	var item8 = {
		label:"批量导入数据",
		callback: batchImport,
		icon: ICON + "icon_up.gif",
		visible:function() { return isRecord() && getOperation("1") && canBatchImp(); }
	}
	var item13 = {
        label:"导出数据表定义",
        callback:exportRecordDef,
        icon:ICON + "export.gif",
        visible:function() {return !isTreeRoot() && getOperation("2");}
    }
    var item14 = {
        label:"导入数据表定义",
        callback:importRecordDef,
        icon:ICON + "import.gif",
        visible:function() {return !isRecord() && getOperation("2");}
    }

	var menu = new $.Menu();
	menu.addItem(item1);
	menu.addItem(item7);
	menu.addItem(item8);
	menu.addSeparator();
	menu.addItem(item3);
	menu.addItem(item4);
	menu.addItem(item21);
	menu.addItem(item22);
	menu.addItem(item23);
	menu.addItem(item24);
	menu.addItem(item6);
	menu.addItem(item9);
	menu.addItem(item13);
	menu.addItem(item14);
	menu.addItem(item10);
	menu.addItem(item5);
	menu.addSeparator();
	menu.addItem(createPermissionMenuItem("D2"));
	
	$1("tree").contextmenu = menu;
}

function isRecordGroup() {
	return "0" == getTreeAttribute("type");
}

function isRecord() {
	return !isTreeRoot() && !isRecordGroup();
}

function canBatchImp() {
	return "1" == getTreeAttribute("batchImp") && !isTreeNodeDisabled();
}

function loadInitData() {
	var onresult = function() {
		var tree = $.T("tree", this.getNodeValue(XML_SOURCE_TREE));

		tree.onTreeNodeDoubleClick = function(ev) {
			var treeNode = getActiveTreeNode();
			getTreeOperation(treeNode, function(_operation) {            
				if( isRecord() && !isTreeNodeDisabled() && getOperation("1,2,3,4,5") ) {
					showRecord();
				}
				if( isRecordGroup() && getOperation("2") ) {
					loadRecordDetail(false, "0");
				}
			});
		}
		tree.onTreeNodeRightClick = function(ev) {
			onTreeNodeRightClick(ev, true);
		}
		tree.onTreeNodeMoved = function(ev) {
			sortTreeNode(URL_SORT_SOURCE, ev);
		}
	}

	$.ajax({url : URL_SOURCE_TREE, onresult : onresult});
}

function loadRecordDetail(isCreate, type, readonly) { 
	var treeNode = $.T("tree").getActiveTreeNode();
	var treeNodeID = treeNode.id;
	type = type || treeNode.getAttribute("type") ;
	
	$("#chatFrame").hide();
	$("#recordFormDiv").show(true);
	closeDefine();
	
	var params = {};
	if( isCreate ) {
		params["parentId"] = treeNodeID; // 新增
	} else {
		params["recordId"] = treeNodeID; // 修改					
	}

	$.ajax({
		url : URL_SOURCE_DETAIL + "/" + type,
		params : params,
		onresult : function() { 
			var sourceInfoNode = this.getNodeValue(XML_SOURCE_INFO);
			$.cache.XmlDatas[treeNodeID] = sourceInfoNode;
			
			var xform = $.F("recordForm", sourceInfoNode);
		
			// 设置保存/关闭按钮操作
			$1("closeRecordForm").onclick = function() {
				closeRecordFormDiv();
			}

			if(readonly) {
				$("#sourceSave").hide();
				xform.setEditable("false");
			} 
			else {
				$("#sourceSave").show().click( function() {
					saveRecord(treeNodeID);
				});
			}
		},
		onexception : function() { 
			closeRecordFormDiv();
		}
	});
}

function saveRecord(treeNodeID) {
	var xform = $.F("recordForm");	
	if( !xform.checkForm() ) return;

	var request = new $.HttpRequest();
	request.url = URL_SAVE_SOURCE;

	var sourceInfoNode = $.cache.XmlDatas[treeNodeID];
	var dataNode = sourceInfoNode.querySelector("data");
	request.setFormContent(dataNode);

	syncButton([$1("sourceSave")], request); // 同步按钮状态

	request.onresult = function() { // 新增结果返回              
		var xmlNode = this.getResponseXML().querySelector("treeNode");
		appendTreeNode(treeNodeID, xmlNode);

		closeRecordFormDiv();
		delete $.cache.XmlDatas[treeNodeID];
	}
	request.onsuccess = function() { // 更新
		modifyTreeNode(treeNodeID, "name", xform.getData("name"));
		modifyTreeNode(treeNodeID, "define", xform.getData("define"));
		modifyTreeNode(treeNodeID, "customizePage", xform.getData("customizePage"));
		modifyTreeNode(treeNodeID, "batchImp", xform.getData("batchImp"));
		
		closeRecordFormDiv();
		delete $.cache.XmlDatas[treeNodeID];

		// 如果已经打开录入界面，则先关闭；以便下次打开时能实时更新
	    var $iframe = $("#chatFrame_" + treeNodeID);
	    $iframe.length && $iframe.remove();
	}
	request.send();
}

function closeRecordFormDiv() {
	$("#recordDefinesDiv").hide();
	$("#recordFormDiv").hide();
}

function deleteRecord()  { delTreeNode(URL_DELETE_SOURCE); }
function disableRecord() { stopOrStartTreeNode("1", URL_DISABLE_SOURCE); }
function enableRecord()  { stopOrStartTreeNode("0", URL_DISABLE_SOURCE); }

function exportRecordDef() {
	var url = URL_EXPORT_RECORD + getTreeNodeId();
    var frameName = createExportFrame();
    $1(frameName).setAttribute("src", url);
}

function importRecordDef() {
	var params = {"isTree": false};
	params._title = "请选择相应的数据源";

	popupTree("/tss/param/xml/combo/datasource_list", "ParamTree", params, function(target) {
	    function checkFileWrong(subfix) {
			return subfix == ".json";
		}

		var ds = target.attrs["value"];
		var url = URL_UPLOAD_FILE + "?groupId=" + getTreeNodeId() + "&dataSource=" + ds;
		url += "&afterUploadClass=com.boubei.tss.dm.ext.ImportRecord";
		var importDiv = createImportDiv("只支持json文件格式导入", checkFileWrong, url);
		$(importDiv).show().center();
    });	
}	

function moveRecord() {
	var tree = $.T("tree");
	var treeNode = tree.getActiveTreeNode();
	var id  = treeNode.id;
    var pId = treeNode.parent.id;

    var params = {id:id, parentID: pId};
    popupTree(URL_GROUPS_TREE, "SourceTree", params, function(target) {
    	var targetId = (target.id == '_root' ? '0' : target.id);
        moveTreeNode(tree, id, targetId, URL_MOVE_SOURCE);
    });
}		

function showRecord() {
	var treeNode = getActiveTreeNode();

	globalValiable.id = treeNode.id;
	globalValiable.name  = treeNode.name;
	globalValiable._operation = treeNode.getAttribute("_operation");

	closePalette(); // 关闭左栏
	$("#recordFormDiv").hide();
    closeDefine();

	var customizePage = (treeNode.getAttribute("customizePage") || "").trim(); 
	customizePage = customizePage || 'recorder.html';

	if( $.Query.get("udf") ) {
		customizePage += "?udf=" + $.Query.get("udf");
	}

	$("iframe.container").hide();
	var iframeId = "chatFrame_" + treeNode.id;
    var $iframe = $("#" + iframeId);
    if( !$iframe.length ) {
        var iframeEl = $.createElement("iframe", "container", iframeId);
        $(".panel td.groove").appendChild(iframeEl);

        $iframe = $(iframeEl);
        $iframe.attr("frameborder", 0).attr("src", customizePage);
    }
    $iframe.show();
}  

function getImportTL() {
	var recordId = getTreeNodeId();
	$("#downloadFrame").attr( "src", encodeURI(URL_RECORD_CSV_TL + recordId ) );
}

function batchImport() {
    function checkFileWrong(subfix) {
        return subfix != ".csv";
    }

    var recordId = getTreeNodeId();
    var url = URL_UPLOAD_FILE + "?afterUploadClass=com.boubei.tss.dm.record.file.ImportCSV";
    url += "&recordId=" + recordId;
    var importDiv = createImportDiv("请点击图标选择CSV文件导入", checkFileWrong, url);
    $(importDiv).show();
}

// -------------------------------------------------   配置数据数据表   ------------------------------------------------
var fieldTree, count = 0;
function configDefine() {
	var rform = $.F("recordForm");
	var defVal = rform.getData("define");

	if(defVal && defVal.indexOf('{') < 0) {  // 根据Excel表头快速定义的录入表，eg: 仓库 货主 库位 货品 包装 数量
		var columns = defVal.split(" ");
		defVal = [];
		columns.each(function(i, column) {
			defVal.push( " {'label':'" +column.trim()+ "', 'code':'c" +(i+1)+ "'}" );
		});
		defVal = "[" + defVal.join(", \n") + "]";
	}
	var _define = $.parseJSON( defVal ) || [];

	var fieldNodes = [];
	_define.each(function(index, item){
		var paramNode = {"id": index+1, "name": item.label, "value": JSON.stringify(item)};
		fieldNodes.push(paramNode); 
	});

	var treeData = [{"id": "_root", "name": "字段列表", "children": fieldNodes}];
	fieldTree = $.T("fieldTree", treeData);	
	initFieldTreeMenus();

	fieldTree.onTreeNodeActived = function(ev) {
		if(fieldTree.getActiveTreeNodeId() != '_root') {
			editFieldConfig();
		}
	}
	fieldTree.onTreeNodeRightClick = function(ev) {
		if(fieldTree.getActiveTreeNodeId() != '_root') {
			editFieldConfig();
		}
		fieldTree.el.contextmenu.show(ev.clientX, ev.clientY);
	}
	fieldTree.onTreeNodeMoved = function(ev) {
		ev.ownTree.sortTreeNode(ev.dragNode, ev.destNode);
	}

	$("#recordDefinesDiv").show(true).center();

	// 默认选中第一个参数，如果没有则清空表单
	var fieldNodeIds = fieldTree.getAllNodeIds();
	count = fieldNodeIds.length;
	if( count > 0) {
		fieldTree.setActiveTreeNode(fieldNodeIds[0]);
		editFieldConfig();
	}
	else {
		RECORD_PARAM_FIELDS.each(function(i, field){
    		$("#_" + field).value('');
    	});
    	createNewField();
	}	
}

function initFieldTreeMenus() {
    var item1 = {
        label:"删除字段",
        icon: ICON + "icon_del.gif",
        callback: function() { fieldTree.removeActiveNode(); },
        visible: function() { 
        	return fieldTree.getActiveTreeNodeId() !== '_root';
        }
    }
    var item2 = {
        label:"新建字段",
        callback: createNewField,
        visible: function() { 
        	return fieldTree.getActiveTreeNodeId() === '_root'; 
        }
    }
 
    var menu1 = new $.Menu();
    menu1.addItem(item2);
	menu1.addItem(item1);
    fieldTree.el.contextmenu = menu1;
}

function createNewField() {
	var id = $.now(), name = '字段' + (++count);
	var newNode = {'id': id, 'name': name, 'value': '{"label": "' +name+ '"}'};
	var _root = fieldTree.getTreeNodeById("_root");
	fieldTree.addTreeNode(newNode, _root);
	fieldTree.setActiveTreeNode(id);
	editFieldConfig();
}

function closeDefine() {
	$("#recordDefinesDiv").hide();
}

var RECORD_PARAM_FIELDS = ['label', 'code', 'type', 'nullable', 'unique', 'defaultValue', 'isparam', 'role1', 'role2',
	'calign', 'cwidth', 'checkReg', 'errorMsg', 'width', 'height', 'options', 'multiple', 'onchange'];

function editFieldConfig() {
	var activeNode = fieldTree.getActiveTreeNode();
	if( !activeNode ) return;

    var valuesMap = $.parseJSON(fieldTree.getActiveTreeNodeAttr("value")) || {};
    RECORD_PARAM_FIELDS.each(function(i, field){
    	var fieldEl = $1("_" + field);
    	var fieldValue = valuesMap[field] || '';

		if(field === 'type') {
			fieldValue = fieldValue.toLowerCase();
			checkType(fieldValue);
		}

		if( field === 'options' ) {
			if(fieldValue.codes) {
				var names = fieldValue.names;

				fieldValue = fieldValue.codes;
				if( names ) {
					fieldValue += ',' + names;
				}
			}
			else if( valuesMap['jsonUrl'] ) {
				fieldValue = valuesMap['jsonUrl']
			}
		}

	    if(field === 'width' || field === 'height') { 
	    	fieldValue = fieldValue ? fieldValue.replace('px', '') : (field === 'width' ? 250 : 18);
	    	$('#_' + field + '_').html(fieldValue);
			
			fieldEl.onchange = function() {
				$('#_' + field + '_').html(this.value);
			}
		}
		if( $(fieldEl).attr("type") == 'checkbox' ) { // checkbox
			fieldEl.checked = fieldValue == 'true';
			if(field == 'nullable') {
				fieldEl.checked = fieldValue == 'false';
			}
		} else {
			fieldEl.value = fieldValue;
		}

		if( field == 'onchange' ) {
			$(".ld>input").value("");
			if( fieldValue ) {
				if(fieldValue.indexOf("getNextLevelOption(") >= 0) {
					var c = fieldValue.replace(/\^/g, "");
					c = c.substr(c.indexOf("(")+1, c.indexOf(")")-c.indexOf("(")-1).split(",");
					if(c.length == 3) {
						$("#ldField").value( c[0].trim() );
						$("#ldService").value( c[1].trim() );
						$("#ldParam").value( c[2].trim() );
					}
				}
				else {
					$("#ldField").value("");
					$("#ldService").value( fieldValue.trim() );
					$("#ldParam").value("");
				}
			}

			$1("ldField").onblur = $1("ldService").onblur = $1("ldParam").onblur = function() {
				var v,
					v1 = ($("#ldField").value()||"").trim(),
					v2 = ($("#ldService").value()||"").trim(),
					v3 = ($("#ldParam").value()||"").trim();

				if(v1 && v2 && v3) {
					v = "getNextLevelOption(^" +v1+ "^, ^" +v2+ "^, ^" +v3+ "^)";
				} else {
					v = v2;
				}

				$("#_onchange").value(v);
				if(v) {
					valuesMap['onchange'] = v;
				} else {
					delete valuesMap['onchange'];
				}
				activeNode.setAttribute("value", JSON.stringify(valuesMap));
			};
		}
		
    	fieldEl.onblur = function() {
    		var newValue;
    		if( $(fieldEl).attr("type") == 'checkbox' ) { // checkbox
				newValue = fieldEl.checked ? 'true' : "";
				if(field == 'nullable') {
					newValue = fieldEl.checked ? 'false' : "";
				}
			} else {
				newValue = fieldEl.value;
			}
    		
			if( $.isNullOrEmpty(newValue) ) {
				if(field === 'label') {
					return $(fieldEl).notice("新建字段名称不能为空");
				}
				if(field === 'code') {
					return $(fieldEl).notice("新建字段CODE不能为空");
				}
				delete valuesMap[field];
			}
			else {
				if(field === 'label') {
					newValue = newValue.replace(/\|/g, ""); // 过滤名称里的特殊字符:|
				}
				if(field === 'code') {
					newValue = newValue.trim().toLowerCase(); // code 不能有空格
				}
				valuesMap[field] = newValue;
			}			

    		if(field === 'label') {
				activeNode.attrs[field] = newValue;
				activeNode.li.a.title = newValue;
				$(activeNode.li.a).html(newValue);
    		}

    		if(field === 'options') {
    			if( newValue ) {
	    			newValue = newValue.replace(/，/ig, ',') // 替换中文逗号
	    			if( newValue.indexOf('|') < 0 ) { // 必须要两个或以上选项，否则当做jsonUrl
	    				delete valuesMap['options'];
	    				valuesMap['jsonUrl'] = newValue;
	    			}
	    			else {
		    			delete valuesMap['jsonUrl'];
						var tmpArray = newValue.split(",");
						valuesMap['options'] = {"codes": tmpArray[0]};

						if(tmpArray.length > 1) {
							valuesMap['options'].names = tmpArray[1];
						} 
		    		}
		    	} else {
		    		delete valuesMap['options'];
		    		delete valuesMap['jsonUrl'];
		    	}
    		} 

    		if(field === 'type') {
    			var tip = "";
    			if(newValue == "date" || newValue == "datetime") {
					tip = "示例：today-3";
				}
				$1("_defaultValue").setAttribute("placeholder", tip);
    			checkType(newValue);
    		}
    		activeNode.setAttribute("value", JSON.stringify(valuesMap));
    	}
    });
}

function checkType(type) {
	if(type == "date" || type == "datetime" || type == "hidden" || type == "file") {
		$(".optionCfg").hide();
	}
	else {
		$(".optionCfg").show();
	}

	if(type == "file") { $(".nofile").hide(); } else { $(".nofile").show(); }
	if(type == "hidden") { $(".nohidden").hide(); } else { $(".nohidden").show(); }
	if(type == "number") { $(".nonumber").hide(); } else { $(".nonumber").show(); }
}

function saveDefine() {
	var result = [];
	var fieldNodes = fieldTree.getAllNodes();
	fieldNodes.each(function(i, node){
		var valuesMap = $.parseJSON(node.attrs["value"] || '{}');
		result.push( valuesMap );
	});

	var formatResult = JSON.stringify(result).replace(/\"/g, "'").replace(/\{'label/g, "\n  {'label");
	$.F("recordForm").updateDataExternal("define", formatResult.replace(/\}]/g, "}\n]"));

	closeDefine();
}
