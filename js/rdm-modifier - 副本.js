/**
 * 降序比较
 * @param firstValue
 * @param secondValue
 * @returns {number}
 */
function sortDesc(firstValue, secondValue) {
    if (firstValue.text > secondValue.text) {
        return -1;
    } else if (firstValue.text < secondValue.text) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * 升序比较
 * @param firstValue
 * @param secondValue
 * @returns {number}
 */
function sortAsc(firstValue, secondValue) {
    if (firstValue.text > secondValue.text) {
        return 1;
    } else if (firstValue.text < secondValue.text) {
        return -1;
    } else {
        return 0;
    }
}

/**
 * 修改specailElement并构建formatSelectOption
 * @param specailElement
 * @returns {{specailElement: *, selectOptionList: Array}}
 */
function formatSelectOption(specailElement)
{
    var selectedVal = specailElement.options[specailElement.selectedIndex].value;//原来被选中的值
    var selectOptionList = [];
    for (var i = 0; i < specailElement.options.length; i++) {
        var currentText = specailElement.options[i].text;
        var convert2pyText = convert2py(currentText);//获得当前Text的拼音字符串
        specailElement.options[i].text = convert2pyText + currentText;//添加拼音前缀
        var selected = specailElement.options[i].value == selectedVal ? 1 : 0;
        selectOptionList.push({
            "value": specailElement.options[i].value,
            "text": specailElement.options[i].text,
            "selected": selected
        });
    }
    selectOptionList.sort(sortAsc);
    return {"specailElement":specailElement, "selectOptionList":selectOptionList};
}

/**
 * 修改指定元素
 * @param idList
 */
function modifySpecialElement(idList) {
    modified = true;
    
    var currentLoginUserName = getCurrentUser();//获得当前登录用户
    var currentIssueStatus = rdmFindIssueStatus();//当前issue的状态
    
    idList.forEach(function (id) {
        var specailSelector = document.getElementById(id);//获得指定select   元素
        if (specailSelector) {
            var neededModifyAssigned = needModifyAssignedToSelector(currentLoginUserName, id, currentIssueStatus);//判断是否需要修改assign下来框
            var formatedSelectOption =  formatSelectOption(specailSelector);
            var selectOptionList = formatedSelectOption.selectOptionList;
            specailSelector = formatedSelectOption.specailElement;
            console.log("neededModifyAssigned");
            console.table(neededModifyAssigned);
            console.log("assignTo:" + neededModifyAssigned.assignTo);
            selectSpecialOptional(specailSelector, selectOptionList, neededModifyAssigned.status, neededModifyAssigned.assignTo, id);
        } else {
            showError("not found specail element");
        }
    });
}

/**
 * 重新处理selector并自动选择指定的选项
 * @param specailSelector 指定的selector
 * @param formatedOptions 格式化好的 option
 * @param modifySelectedIndex 需要修改选中项
 * @param selectedTxt 需要选中的text
 * @param id
 */
function selectSpecialOptional(specailSelector, formatedOptions, modifySelectedIndex, selectedTxt, id) {
    specailSelector.options.length = 0; //清空原来select的option 
    var selectedText = "";
    var selectedIndex = -1;
    for (var k = 0; k < formatedOptions.length; k++) {
        specailSelector.options.add(new Option(formatedOptions[k].text, formatedOptions[k].value));
        if (modifySelectedIndex) { //需要修改选中项 按照指定的text来修改
            if (formatedOptions[k].text == selectedTxt) {
                specailSelector.selectedIndex = k;
                selectedText = formatedOptions[k].text;
                selectedIndex = k;
            }
        } else {
            if (formatedOptions[k].selected == 1) { //设置原来的选定值
                specailSelector.selectedIndex = k;
                selectedText = formatedOptions[k].text;
                selectedIndex = k;
            }
        }
    }
    var selector = '#' + id;
    $(specailSelector).on('click', selector, function () {
        initSelector(this);
    });
    $(specailSelector).on('focus', selector, function () {
        initSelector(this);
    });
    
    return specailSelector;
}

var modifyAssignedToList = ["liuwy"];

/**
 * 获得issue 的 “状态”
 * @returns {*}
 */
function rdmFindIssueStatus()
{
    var status;
    var statusList = document.getElementsByClassName("status");
    if (statusList.length >= 1) {
        var children = statusList[1].childNodes;
        if (children.length < 1) {
            showError("not found status info(children is wrong)!!");
        } else {
            status = children[0].textContent;
        }
    } else {
        showError("not found status info!!");
    }
    return status;
}

/**
 * 判断是否需要修改assign select框
 * @param currentUser
 * @param id
 * @param status
 * @returns {*}
 */
function needModifyAssignedToSelector(currentUser, id, status) {
    var needed = {"status":false, "assignTo":""};
    if (id == "issue_assigned_to_id") {
        for (var i = 0; i < modifyAssignedToList.length; i++) {
            if (modifyAssignedToList[i] === currentUser) { //当前用户操作
                var assignTo = "gongliang龚亮";
                for(var j = 0;j<autoAssign.length;j++) {
                    if (status == autoAssign[j].status) {
                        return {"status":true, "assignTo":autoAssign[j].assignTo}; 
                    }
                }
                return {"status":true, "assignTo":assignTo};
            }
        }
    }
    return needed;
}

var autoAssign = [
    {"status": "开发评估", "assignTo": "liujl刘健林"},
    {"status": "交付测试", "assignTo": "gongliang龚亮"},
    {"status": "开发中", "assignTo": "gongliang龚亮"}
];

/**
 * 当前issue创建人(author)
 */
function rdmFindAuthorName() {
    var authorList = document.getElementsByClassName("author");
    if (authorList.length >= 1) {//如果一个issue 被作者回复，则会出现 多个author elements 这里面取第一条记录就可以了
        var children = authorList[0].childNodes;
        if (children.length < 1) {
            showError("not found author info(children is wrong)!!");
        } else {
            var authorName = children[1].textContent;
            showError("info authorName:" + authorName);
        }
    } else {
        showError("not found author info!!");
    }
    return authorName;
}

/**
 * 获得当前登录用户名
 * @returns {string}
 */
function getCurrentUser() {
    var loginName = "";
    var loggedas = document.getElementById("loggedas");
    if (loggedas.childNodes.length == 2) {//第一个为：“登录为” 第二个为所需的用户名
        loginName = loggedas.childNodes[1].textContent;
    }
    return loginName;
}

/**
 * 显示错误信息
 * @param errorMsg
 */
function showError(errorMsg) {
    if (typeof console.log !== "undefined") {
        console.log(errorMsg);
    } else {
        alert(errorMsg);
    }
}

//需要修改的selector id 列表
var idList = ["values_assigned_to_id_1", "issue_assigned_to_id", "testId", "issue_custom_field_values_4"];

var modified = false;
modifySpecialElement(idList);
var checkModifiedInter = null;
checkModifiedInter = setInterval(function () {
    if (modified) {
        clearInterval(checkModifiedInter);
    } else {
        modifySpecialElement();
    }
}, 2000);

/**
 * 加载指定url的 JS
 * @param url
 * @param onload
 * @returns {boolean}
 */
function loadJS(url, onload) {
    if (typeof url === 'undefined' || url == '') {
        return false;
    }
    var domscript = document.createElement('script');
    domscript.src = url;
    domscript.charset = 'utf-8';
    if (onload) {
        domscript.onloadDone = false;
        domscript.onload = onload;
        domscript.onreadystatechange = function () {
            if ("loaded" === domscript.readyState && domscript.onloadDone) {
                domscript.onloadDone = true;
                domscript.onload();
                domscript.removeNode(true);
            }
        };

    }
    document.getElementsByTagName('head')[0].appendChild(domscript);
}