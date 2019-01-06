//----------------------------------------------------------------
//----------------------------------------------------------------
// Selector
//----------------------------------------------------------------
var displayDrawingStatus = $("#display-drawing-status");
var displayCurrentDrawedNumber = $("#display-current-drawed-number");
var inputAddPrizeName = $("#input-add-prize-name");
var inputAddPrizeAmount = $("#input-add-prize-amount");
var btnDrawANumber = $("#btn-draw-a-number");
var displaySelectedPrizeName = $("#display-selected-prize-name");
var displaySelectedPrizeRemain = $("#display-selected-prize-remain");
//----------------------------------------------------------------
//----------------------------------------------------------------
// Listener & Caller
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
// 變數
//----------------------------------------------------------------
//----------------------------------------------------------------
var currentDrawedNumber = 0;
var initial = {
    range: [1 , 600],
    effectTime: 1000,
    protectTimeInput: 1000
};
var drawProtectTime = [initial.protectTimeInput];
    drawProtectTime.push(drawProtectTime[0]);
var counter = {
    totalDrawTimes: 0,
    lotteryNumberRemain: (initial.range[1] - initial.range[0] + 1),
    totalCreatedPrizeAmount: 0
};
var judge = {
    lotteryIsNotFinish: true
};
var selected = {
    prizeID: -1,
    numberID: [-1, -1]
}
//----------------------------------------------------------------
//----------------------------------------------------------------
// DataBase
//----------------------------------------------------------------
//----------------------------------------------------------------
// 號碼
var numberDB = [-1];
function LotteryNumber(drawedOrder, ownerPrizeID, hasBeenDrawed) {
    this.drawedOrder = drawedOrder; // Number
    this.ownerPrizeID = ownerPrizeID; // Number
    this.hasBeenDrawed = hasBeenDrawed; // boolean
}
for (var i = 1 ; i < initial.range[0]; i++) {
    numberDB.push(-1);
}
for (var i = initial.range[0]; i <= initial.range[1]; i++) {
    numberDB.push(new LotteryNumber(-1, -1, false));
}
// 被抽的號碼清單
var totalDrawedNumberList = [];
function listTotalDrawedNumberOut() {
    totalDrawedNumberList = [];
    for (var i = initial.range[0]; i <= initial.range[1]; i++) {
        if (numberDB[i].hasBeenDrawed) {
            totalDrawedNumberList.push(i);
        }
    }
    return totalDrawedNumberList;
}
//----------------------------------------------------------------
// 禮物
var prizeDB = [];
function LotteryPrize(createdOrder, name, prizeAmount, remainAmount, stillRemain, ownNumbers) {
    this.createdOrder = createdOrder; //Number
    this.name = name; // String
    this.prizeAmount = prizeAmount; // Number
    this.remainAmount = remainAmount; // Number
    this.stillRemain = stillRemain; // boolean
    this.ownNumbers = ownNumbers; // Array
}
var totalPrizeList = [];
function listTotalPrizeOut() {
    totalPrizeList = [];
    for (var i = 0; i < prizeDB.length; i++) {
        totalPrizeList.push(prizeDB[i].name);
    }
    return totalPrizeList;
}
//----------------------------------------------------------------
//----------------------------------------------------------------
// 主要功能
//----------------------------------------------------------------
//----------------------------------------------------------------
// 按下抽獎按鈕
btnDrawANumber.on("click", function(){
    if (selected.prizeID !== -1 && prizeDB.length !== 0 && prizeDB[selected.prizeID].stillRemain) {
        drawANumber();
        setTimeout(function() {
            addNumberIntoPrize(currentDrawedNumber, selected.prizeID);
        }, initial.effectTime);
    } else if (prizeDB.length === 0) {
        alert("目前沒有禮物可以讓你抽。");
    } else if (selected.prizeID === -1) {
        alert("你沒有選擇禮物。");
    } else if (!prizeDB[selected.prizeID].stillRemain) {
        alert("這個禮物已經被抽完了。");
    }
});
// 抽一個號碼
function drawANumber() {
    while (judge.lotteryIsNotFinish) {
        currentDrawedNumber = randomGenerator((initial.range[1] - initial.range[0]) + 1) + initial.range[0] - 1; // 產生隨機數
        if (!numberDB[currentDrawedNumber].hasBeenDrawed) {  // 判斷新產生的數是否已經重複
            counter.totalDrawTimes++; // 總抽獎次數+1
            counter.lotteryNumberRemain--; // 還沒抽中的號碼數量-1
            numberDB[currentDrawedNumber].hasBeenDrawed = true;  // 紀錄這個數已經被抽過了
            numberDB[currentDrawedNumber].drawedOrder = counter.totalDrawTimes;  // 紀錄這個數被抽的順序
            drawProtect();  // 觸發抽獎保護
            drawEffect();  // 啟動抽獎效果
            outputCurrentDrawedNumber();
            judgeLotteryIsFinsh(drawProtectTime[1] + initial.effectTime + 30);
            drawedLog();
            break;
        }
    }
}
//----------------------------------------------------------------
// 新增獎品
$("#input-add-prize-btn").on("click", function () {
    if (inputAddPrizeName.val() !== "" && inputAddPrizeName.val() !== " ") {
        if (inputAddPrizeAmount.val() > 0 && inputAddPrizeAmount.val() % 1 === 0) {
            addAPrize(inputAddPrizeName.val(), inputAddPrizeAmount.val());
            inputAddPrizeName.val("");
            inputAddPrizeAmount.val("");
        } else if (inputAddPrizeAmount.val() <= 0) {
            alert("請輸入正確的禮物數量。至少為 1 。");
        } else if (inputAddPrizeAmount.val() % 1 !== 0) {
            alert("請輸入整數");
        } else {
            alert("輸入的數字錯誤。");
        }
    } else {
        alert("你沒有輸入禮物名稱啊，老兄！");
    }
    
});
function addAPrize(name, amount) {
    counter.totalCreatedPrizeAmount++;
    prizeDB.push(new LotteryPrize(counter.totalCreatedPrizeAmount, name, Number(amount), Number(amount), true, []));
    console.log("新增禮物： \"" + name + "\" 共 " + amount + " 份。");

    var a = "<li class='prize-box p-0 list-group-item'><div class='card'><button class='prize-title card-header' type='button'><div class='row'><div class='col-8'><span class='title-arrow'><i class='fas fa-caret-right collapsed' data-toggle='collapse' aria-expanded='false' aria-controls='collapsePrize' data-target='#prize-collapse-"
    var b = String(counter.totalCreatedPrizeAmount);
    var c = "'></i></span>";
    var d = name;
    var e = "</div><div class='text-right col-4'>0 / ";
    var f = String(amount);
    var g = "</div></div></button><ul class='list-group list-group-flush collapse flex-column-reverse' id='prize-collapse-";
    var h = String(counter.totalCreatedPrizeAmount);
    var i = "'></ul></div></li>";

    var temp = a + b + c + d + e + f + g + h + i;

    $("#main-prize-list").append(temp);
    // <li class='list-group-item'><div class='row'><div class='col-10 text-center'>3</div><div class='col-2 text-center'><i class='fas fa-trash-alt'></i></div></div></li>
}
//----------------------------------------------------------------
// 選擇一個獎品
$("#main-prize-list").on("click", ".prize-box", selectPrize);
function selectPrize() {
    if (!$(this).hasClass("prize-selected")) {
        $(".prize-box").removeClass("prize-selected");
        $(this).addClass("prize-selected");
        selected.prizeID = $("#main-prize-list .prize-box").index(this);
        displaySelectedPrizeName.text(prizeDB[selected.prizeID].name);
        displaySelectedPrizeRemain.text(prizeDB[selected.prizeID].remainAmount);
        console.log("現在選擇的禮物為ID：" + selected.prizeID);
    } else if ($(this).hasClass("prize-selected")) {
        $(this).removeClass("prize-selected");
        selected.prizeID = -1
        displaySelectedPrizeName.text("");
        displaySelectedPrizeRemain.text("");
    }
}
// 防止誤觸
$("#main-prize-list").on("click", ".prize-box .list-group-item", doNotActOnClickTheLi);
function doNotActOnClickTheLi(event) {
    event.stopPropagation();
}
//----------------------------------------------------------------
// 將號碼加入獎品
function addNumberIntoPrize(number, prizeID) {
    if (prizeDB[prizeID].stillRemain) {
        prizeDB[prizeID].ownNumbers.push(number);
        prizeDB[prizeID].remainAmount--;
        if (prizeDB[prizeID].remainAmount === 0) {
            prizeDB[prizeID].stillRemain = false;
        }
        numberDB[number].ownerPrizeID = prizeID;

        var a = "<li class='list-group-item list-number-item'><div class='row'><div class='col-10 text-center'>";
        var b = number;
        var c = "</div><div class='delete-number-icon text-center'><i class='fas fa-trash-alt'></i></div></div></li>"
        var numberToAddTemp = a + b + c;

        $("#main-prize-list .prize-box:nth-child(" + (prizeID + 1) + ") ul").append(numberToAddTemp);
        $("#main-prize-list .prize-box:nth-child(" + (prizeID + 1) + ") div.text-right").text(prizeDB[prizeID].ownNumbers.length + " / " + prizeDB[prizeID].prizeAmount);
        displaySelectedPrizeRemain.text(prizeDB[prizeID].remainAmount);

        console.log("號碼 " + number + " 已經被加到ID為 " + prizeID + " 的禮物中。");
    } else {
        console.log("The prize has no remain.");
    }
}
//----------------------------------------------------------------
// 刪除獎品
$("#input-btn-delete-selected-prize").on("click", function(){
    deleteAPrize(selected.prizeID);
});
function deleteAPrize(prizeID) {
    if (prizeDB.length !== 0 && prizeID !== -1) {
        console.log("刪除了ID為 " + prizeID + " 的獎品。該獎品之中獎號碼如下：")
        for (var i = 0; i < prizeDB[prizeID].ownNumbers.length; i++) {
            numberDB[prizeDB[prizeID].ownNumbers[i]].drawedOrder = -1;
            numberDB[prizeDB[prizeID].ownNumbers[i]].ownerPrizeID = -1;
            numberDB[prizeDB[prizeID].ownNumbers[i]].hasBeenDrawed = false;
            counter.lotteryNumberRemain++;
            console.log(prizeDB[prizeID].ownNumbers[i] + "號。");
        }
        $("#main-prize-list .prize-box")[prizeID].remove();
        console.log("以上號碼移除完畢。");
        prizeDB.splice(prizeID, 1);
        selected.prizeID = -1;
        displaySelectedPrizeName.text("");
        displaySelectedPrizeRemain.text("");
    } else if (prizeDB.length === 0){
        alert("目前沒有禮物可以讓你刪除哦！");
    } else if (prizeID === -1) {
        alert("你還沒有選擇禮物哦！");
    } 
}
//----------------------------------------------------------------
// 刪除號碼
// click
$("#btn-delete-a-number-forever").on("click", function () {
    deleteANumberForever(selected.numberID);
});
$("#btn-delete-a-number-fornow").on("click", function () {
    deleteANumberFornow(selected.numberID);
});

// 按下刪除按鈕
$("#main-prize-list").on("click", ".delete-number-icon", function(){
    selected.numberID[0] = $("#main-prize-list .prize-box").index($(this).parent().parent().parent().parent().parent()); // 所屬的.prize-box 之 index
    selected.numberID[1] = $(".prize-box:nth-of-type(" + (selected.numberID[0] + 1) + ")").children("div").children("ul").children("li").index($(this).parent().parent()); // 所屬的li 之index
    console.log("按下ID為 [ " + selected.numberID + " ] 之刪除按鈕"); // 所按下的刪除按鈕之ID
    $('#modal-delete-a-number').modal({backdrop: "static"});
});
// 永遠刪除
function deleteANumberForever(numberID) {
    console.log("\"btn-delete-a-number-forever\" clicked!");
    console.log("當前刪除號碼之ID為 [ " + numberID + " ]");
    console.log("該號碼為 " + prizeDB[numberID[0]].ownNumbers[numberID[1]] + " 號");
    deleteTargetNumber = prizeDB[numberID[0]].ownNumbers[numberID[1]];
    numberDB[deleteTargetNumber].ownerPrizeID = -1;
    numberDB[deleteTargetNumber].hasBeenDrawed = true;
    prizeDB[numberID[0]].remainAmount++;
    prizeDB[numberID[0]].stillRemain = true;
    prizeDB[numberID[0]].ownNumbers.splice(numberID[1], 1);
    deleteSelectedNumberLi(numberID);
    selected.numberID = [-1, -1];
}

//暫時刪除
function deleteANumberFornow(numberID) {
    console.log("\"btn-delete-a-number-fornow\" clicked!");
    console.log("當前刪除號碼之ID為 [ " + numberID + " ]");
    console.log("該號碼為 " + prizeDB[numberID[0]].ownNumbers[numberID[1]] + " 號");
    deleteTargetNumber = prizeDB[numberID[0]].ownNumbers[numberID[1]];
    counter.lotteryNumberRemain++;
    numberDB[deleteTargetNumber].ownerPrizeID = -1;
    numberDB[deleteTargetNumber].drawedOrder = -1;
    numberDB[deleteTargetNumber].hasBeenDrawed = false;
    prizeDB[numberID[0]].remainAmount++;
    prizeDB[numberID[0]].stillRemain = true;
    prizeDB[numberID[0]].ownNumbers.splice(numberID[1], 1);
    deleteSelectedNumberLi(numberID);
    selected.numberID = [-1, -1];
}

// 刪除號碼所屬之li元素
function deleteSelectedNumberLi(numberID) {
    $("#main-prize-list .prize-box:nth-of-type(" + (numberID[0] + 1) + ") ul li")[numberID[1]].remove();
    $("#main-prize-list .prize-box:nth-of-type(" + (numberID[0] + 1) + ") div.text-right").text(prizeDB[numberID[0]].ownNumbers.length + " / " + prizeDB[numberID[0]].prizeAmount);
    if (selected.prizeID === numberID[0] !== -1) {
        displaySelectedPrizeRemain.text(prizeDB[numberID[0]].remainAmount);
    }
}
//----------------------------------------------------------------
// 加入指定號碼
$("#input-add-specific-number").on("click", function(){
    var inputSpecificNumber = Number($("#input-specific-number").val());
    if (inputSpecificNumber >= initial.range[0] && inputSpecificNumber <=initial.range[1]) {
        if (selected.prizeID !== -1 && prizeDB.length !== 0 && prizeDB[selected.prizeID].stillRemain) {
            console.log("你指定加入的號碼為：" + inputSpecificNumber);
            if (!numberDB[inputSpecificNumber].hasBeenDrawed) {
                currentDrawedNumber = inputSpecificNumber;
                counter.totalDrawTimes++; // 總抽獎次數+1
                counter.lotteryNumberRemain--; // 還沒抽中的號碼數量-1
                numberDB[currentDrawedNumber].hasBeenDrawed = true;  // 紀錄這個數已經被抽過了
                numberDB[currentDrawedNumber].drawedOrder = counter.totalDrawTimes;  // 紀錄這個數被抽的順序
                displayCurrentDrawedNumber.text(currentDrawedNumber);
                judgeLotteryIsFinsh(1);
                drawedLog();
                setTimeout(function () {
                    addNumberIntoPrize(currentDrawedNumber, selected.prizeID);
                }, 10);
            } else {
                alert("這個號碼已經被抽過了哦！");
                console.log("該號碼已經被抽過");
            }
        } else if (prizeDB.length === 0) {
            alert("目前沒有禮物可以讓你抽。");
        } else if (selected.prizeID === -1) {
            alert("你沒有選擇禮物。");
        } else if (!prizeDB[selected.prizeID].stillRemain) {
            alert("這個禮物已經被抽完了。");
        }
    } else {
        alert("你輸入的數字不在抽獎範圍啊！看清楚再輸入嘛～");
    }
});



//----------------------------------------------------------------
//----------------------------------------------------------------
// 子功能
//----------------------------------------------------------------
//----------------------------------------------------------------
// 產生一個隨機號碼
function randomGenerator(range) {
    return Number(Math.floor(Math.random() * range + 1));
}
//----------------------------------------------------------------
// 判斷抽獎是否結束
function judgeLotteryIsFinsh(delayTime) {
    setTimeout(function () {
        if (counter.lotteryNumberRemain === 0) {
            judge.lotteryIsNotFinish = false;
            displayDrawingStatus.text("沒號碼可以抽了，抽獎結束！");
            btnDrawANumber.attr("disabled", true);
            drawedLog();
        } else {
            displayDrawingStatus.text("現在可以抽一個新號碼");
            btnDrawANumber.attr("disabled", false);
        }
    }, delayTime);
}
//----------------------------------------------------------------
// 為數字添加零
var addZero = {
    One(n) {
        if (n < 10) {
            n = "0" + n;
        }
        return n;
    },
    Two(n) {
        if (n < 10) {
            n = "00" + n;
        } else if (n < 100) {
            n = "0" + n;
        }
        return n;
    }
}
//----------------------------------------------------------------
// 重設全部並套用自訂參數
$("#input-btn-reset-all").on("click", function(){
    console.log("按下重設全部按鈕");
    $("#modal-reset-all").modal({ backdrop: "static" });
});
$("#btn-reset-all-confirm").on("click", resetAll);
function resetAll() {
    $("#main-prize-list .prize-box").remove();
    currentDrawedNumber = 0;
    if (Number($("#input-initial-range-min").val()) > Number($("#input-initial-range-max").val())) {
        initial.range = [1, 600];
        alert("你輸入的數字範圍怪怪的，請重新輸入。");
    } else {
        if ($("#input-initial-range-min").val() == "" || $("#input-initial-range-min").val() == " ") {
            initial.range[0] = 1;
        } else {
            initial.range[0] = Number($("#input-initial-range-min").val());
        }
        if ($("#input-initial-range-max").val() == "" || $("#input-initial-range-max").val() == " ") {
            initial.range[1] = 600;
        } else {
            initial.range[1] = Number($("#input-initial-range-max").val());
        }
    }
    
    drawProtectTime = [initial.protectTimeInput];
    drawProtectTime.push(drawProtectTime[0]);
    counter = {
        totalDrawTimes: 0,
        lotteryNumberRemain: (initial.range[1] - initial.range[0] + 1),
        totalCreatedPrizeAmount: 0
    };
    judge = {
        lotteryIsNotFinish: true
    };
    selected = {
        prizeID: -1,
        numberID: [-1, -1]
    }
    numberDB = [-1];
    for (var i = 1; i < initial.range[0]; i++) {
        numberDB.push(-1);
    }
    for (var i = initial.range[0]; i <= initial.range[1]; i++) {
        numberDB.push(new LotteryNumber(-1, -1, false));
    }
    totalDrawedNumberList = [];
    prizeDB = [];
    totalPrizeList = [];
    selected.prizeID = -1
    displaySelectedPrizeName.text("");
    displaySelectedPrizeRemain.text("");
    btnDrawANumber.attr("disabled", false);
    displayCurrentDrawedNumber.text("000");
    displayDrawingStatus.text("現在可以抽一個新號碼");
    console.log("");
    console.log("重設完成。");
    logCurrentMetaStatus();
}
// 設定時間參數
$("#input-protect-time").keydown(inputProtectTimeListener);
$("#input-protect-time").on("click", inputProtectTimeListener);
function inputProtectTimeListener() {
    setTimeout(function () {
        if ($("#input-protect-time").val() == "" || $("#input-protect-time").val() == " ") {
            initial.protectTimeInput = 1000;
            drawProtectTime = [initial.protectTimeInput];
            drawProtectTime.push(drawProtectTime[0]);
            console.log("你沒有設定保護時間，將自動設為預設值1000ms");
        } else {
            initial.protectTimeInput = Number($("#input-protect-time").val());
            drawProtectTime = [initial.protectTimeInput];
            drawProtectTime.push(drawProtectTime[0]);
        }
        console.log("目前設定的保護時間為 " + initial.protectTimeInput + " ms");
        console.log(drawProtectTime);
    }, 500);
}
$("#input-effect-time").keydown(inputEffectTimeListener);
$("#input-effect-time").on("click", inputEffectTimeListener);
function inputEffectTimeListener() {
    setTimeout(function() {
        if ($("#input-effect-time").val() == "" || $("#input-effect-time").val() == " ") {
            initial.effectTime = 1000;
            console.log("你沒有設定效果時間，將自動設為預設值1000ms");
        } else {
            initial.effectTime = Number($("#input-effect-time").val());
        }
        console.log("目前設定的效果時間為 " + initial.effectTime + " ms");
    },500);
}

//----------------------------------------------------------------
// 抽獎效果
function drawEffect() {
    if ($("#input-drawing-effect-checkbox").is(":checked")) {
        if (initial.effectTime > 100) {
            displayDrawingStatus.text("抽獎中......");
            drawingEffect = setInterval(function () {
                displayCurrentDrawedNumber.text(addZero.Two(randomGenerator(999)));
            }, 1);
            setTimeout("clearInterval(drawingEffect);", (initial.effectTime - 30));
        } else {
            alert("效果時間需大於100ms");
        }
    }
}
// 判斷是否啟用抽獎效果
$("#input-drawing-effect-checkbox").on("click", function() {
    if ($("#input-drawing-effect-checkbox").is(":checked")) {
        initial.effectTime = Number($("#input-effect-time").val());
        console.log("抽獎效果已啟用");
        console.log("目前設定的保護時間為 " + initial.effectTime + " ms");
    } else {
        initial.effectTime = 1;
        console.log("抽獎效果已關閉");
    }
});
//----------------------------------------------------------------
// 抽獎保護
function drawProtect() {
        btnDrawANumber.attr("disabled", true);
        setTimeout(function() {
            protecter = setInterval(function() {
                drawProtectTime[0] -= 10;
                displayDrawingStatus.text("請等待 " + (drawProtectTime[0] / 1000).toFixed(2) + " 秒");
            }, 10);
            setTimeout(function () {
                clearInterval(protecter);
                drawProtectTime[0] = drawProtectTime[1];
            }, drawProtectTime[1] + 20);
        }, initial.effectTime);
}
//----------------------------------------------------------------
// 歷程紀錄
function drawedLog() {
    var currentTime = new Date();
    var timeLogText = currentTime.getFullYear() + "/" + (currentTime.getMonth() + 1) + "/" + currentTime.getDate() + " " + addZero.One(currentTime.getHours()) + ":" + addZero.One(currentTime.getMinutes()) + ":" + addZero.One(currentTime.getSeconds());

    if (judge.lotteryIsNotFinish) {
        console.log("【 第 " + addZero.Two(counter.totalDrawTimes) + " 個中獎號碼：" + addZero.Two(currentDrawedNumber) + " 】 -------  " + timeLogText);
    } else {
        console.log("【 沒號碼可以抽了，抽獎結束！ 】 -------  " + timeLogText);
    }   
}
//----------------------------------------------------------------
// 輸出抽中的號碼
function outputCurrentDrawedNumber() {
    setTimeout(function() {
        displayCurrentDrawedNumber.text(currentDrawedNumber);
    }, initial.effectTime);
}
//----------------------------------------------------------------
// Collapse 箭頭
$("#main-prize-list").on("click", ".fa-caret-right", collapseArrowIconChangeToDown);
function collapseArrowIconChangeToDown(event) {
    $(this).removeClass("fa-caret-right");
    $(this).addClass("fa-caret-down");
    event.stopPropagation();
    $(this).parent().parent().parent().parent().parent().children(".collapse").collapse("toggle");
}
$("#main-prize-list").on("click", ".fa-caret-down", collapseArrowIconChangeToRight);
function collapseArrowIconChangeToRight(event) {
    $(this).removeClass("fa-caret-down");
    $(this).addClass("fa-caret-right");
    event.stopPropagation();
    $(this).parent().parent().parent().parent().parent().children(".show").collapse("toggle");
}
//----------------------------------------------------------------
// Console.log Meta Status
function logCurrentMetaStatus() {
    console.log("");
    console.log("------------------------------------------");
    console.log("以下為目前的總資料狀態：")
    console.log("總共的抽獎範圍為 " + initial.range[0] + " 到 " + " " + initial.range[1] + " 號");
    console.log("設定的保護延遲時間為：" + initial.protectTimeInput + " ms");
    console.log("設定的抽獎效果時間為：" + initial.effectTime + " ms");
    if ($("#input-drawing-effect-checkbox").is(":checked")) {
        console.log("抽獎效果是否啟用：是");
    } else {
        console.log("抽獎效果是否啟用：否");
    }
    console.log("總計的抽獎次數為 " + counter.totalDrawTimes + " 次");
    console.log("已經被抽到的號碼如下： [" + listTotalDrawedNumberOut() + "]");
    console.log("還有 " + counter.lotteryNumberRemain + " 個號碼還沒被抽到");
    console.log("目前的禮物共有 " + prizeDB.length + " 個");
    console.log("禮物清單如下： [" + listTotalPrizeOut() + "]");
    console.log("各個禮物的總個數以及剩餘個數如下：");
    for (var i = 0; i < prizeDB.length; i++) {
        console.log("ID " + i + ". " + prizeDB[i].name + " - " + "剩餘 " + prizeDB[i].remainAmount + " 個 / 共 " + prizeDB[i].prizeAmount + " 個");
    }
    console.log("------------------------------------------");
}