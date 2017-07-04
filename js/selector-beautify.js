var origin_data = [{"text": "aa", "value": "aav"}, {"text": "ab", "value": "abv"}, {
    "text": "ac",
    "value": "acv"
}, {"text": "dd", "value": "ddv"}, {"text": "eee", "value": "eeev"}, {"text": "fff", "value": "fffv"}];


/**
 * 根据queryValue 生成对应的pattern字符串
 * @param queryValue
 * @returns {string}
 */
function queryValue2pattern(queryValue) {
    var pattern = '';
    if (queryValue) {
        var queryValueList = queryValue.split("");//字符串转化为数组
        pattern += queryValueList.join('\\w*');
    }
    pattern += '\\w*';
    console.log("pattern:" + pattern);
    return pattern;
}

/**
 * 根据pattern和data对数据进行过滤
 * @param data
 * @param pattern
 * @returns {Array}
 */
function filterDataByPattern(data, pattern) {
    var newData = [];
    var len = data.length;
    pattern = new RegExp(pattern, 'i');
    var k = 0;
    for (var i = 0; i < len; i++) {
        var text = data[i].text;
        if (pattern.test(text)) {
            newData[k++] = data[i];
        }
    }
    return newData;
}

function getJsonListFromCode(queryValue, callback, tips) {
    var data;
    if (queryValue) {
        var pattern = queryValue2pattern(queryValue);//字符串转化为数组
        contentD.innerHTML = tips;
        data = filterDataByPattern(origin_data, pattern);
    } else {
        data = origin_data;
    }
    callback(data);
}

function getJsonListFromCodeSync(queryValue, callback, tips) {
    getJsonListFromCode(queryValue, callback, tips);
}

var oRegion = document.getElementById("txtRegion");     //需要弹出下拉列表的文本框  
var oDivList = document.getElementById("divList"); 	     //要弹出的下拉列表 
var contentD = document.getElementById("contentDiv");
//var oClose = document.getElementById("tdClose");　　   //关闭div的单元格，也可使用按钮实现  
var bNoAdjusted = true;
var html = "";
var all_html = "";
var colOptions = "";

//设置下列选择项的一些事件  
function setEvent(colOptions) {
    for (var i = 0; i < colOptions.length; i++) {
        colOptions[i].onclick = function () { //为列表项添加单击事件  
            oRegion.value = this.innerText;     //显示选择的文本；
            oRegion.style.backgroundColor = "#219DEF";
            oDivList.style.display = "none";
        };
        colOptions[i].onmouseover = function () { //为列表项添加鼠标移动事件  
            this.style.backgroundColor = "#219DEF";
        };
        colOptions[i].onmouseout = function () { //为列表项添加鼠标移走事件  
            this.style.backgroundColor = "";
        };
    }
}

function initializeDIV(value) {
    var sql = "";
    if (value != "") {
        html += "<ul><li style='text-align:left; padding-left:3px;'>按" + '"' + "<font style='color :red;'>" + value + "</font>" + '"' + "检索:</li>";
        sql += 'value=' + value;
    } else {
        html += "<ul><li style='text-align:left; padding-left:3px;'>请输入检索条件:" + "</li>";
        sql = "";
    }
    getJsonListFromCodeSync(value, function (data) {
        if (data != null && data != "") { // 存在查询结果 ;
            $.each(data, function (i, e) {
                html += "<li style='text-align:left; padding-left:3px;' value='" + e.value + "'>" + e.text + "</li>";
            });
        } else { // 没有查询结果;
            html = "";
            html += "<ul><li style='text-align:left; padding-left:3px;'>无法匹配:" + '"' + "<font style='color :red;'>" + value + "</font>" + '"' + "</li>";
            html += all_html;
        }
        html += "</ul>";
    }, sql);
    contentD.innerHTML = html;
    colOptions = $("#contentDiv li"); //所有列表元素
    setEvent(colOptions);
}

function initSelector(obj) {
    console.log("initSelector start");
    console.log(obj);
    oRegion.style.background = "url(images/select2.jpg)  right -3px no-repeat";
    oRegion.style.backgroundColor = "#fff";
    getJsonListFromCode("", function (data) {
        if (data != null && data != "") {		// 存在查询结果 ;
            $.each(data, function (i, e) {
                all_html += "<li style='text-align:left; padding-left:3px;' value='" + e.value + "'>" + e.text + "</li>";
            });
        }
    }, '');
        
    $(document).click(function (e) {
        var target_id = $(e.target).attr('id');		// 获取点击dom元素id ;
        if (target_id != oRegion.id) {
            oDivList.style.display = "none";//隐藏div，实现关闭下拉框的效果 ;
            oRegion.style.background = "url(images/select2.jpg)  right -3px no-repeat";
            oRegion.style.backgroundColor = "#fff";
        }
    });

    //文本获得焦点时的事件  
    $(oRegion).focus(function () {
        oRegion.style.background = "url(images/select.jpg)  right -3px no-repeat";
        oRegion.style.backgroundColor = "#fff";
        contentD.innerHTML = all_html;
        oDivList.style.display = "block";
        if (bNoAdjusted) { //控制div是否已经显示的变量  
            bNoAdjusted = false;
            //设置下拉列表的宽度和位置  
            oDivList.style.width = this.offsetWidth - 4;
            oDivList.style.posTop = oRegion.offsetTop + oRegion.offsetHeight + 1; 		// 设定高度
            oDivList.style.posLeft = oRegion.offsetLeft + 1;  		// 设定与左边的位置;
        }
    });

// 文本内容改变时监听事件 ;
    $(oRegion).propertychange (function () {
        contentD.innerHTML = ""; // 清空div中所有li元素;
        html = "";
        InitializeDIV(oRegion.value);
    });
    $(oRegion).keyup(function () {
        contentD.innerHTML = ""; // 清空div中所有li元素;
        html = "";
        InitializeDIV(oRegion.value);
    });
    
    console.log("initSelector end");
}