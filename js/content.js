//
'use strict';
$(document).ready(function() {
// переменные
let initialState = {}; //начальное состояние 
initialState.offon = 'off'; 

let resSelList = []; // результирующая коллекция селекторов
/*
resSelList = [
 {
  id : Number
  project: NAME,
  url: URL,
  name: NAME,
  sel: SELECTOR
  content: text/img/html
  ref: href
  note: TEXT
 }
 ];
*/
let currentFindSel; // текущий найденый селектор
let currentUrl = ""; // текущий урл страницы
let currentFindContent = "";
let currentFindRef = "";

let canExe = true;
let delayExe = 300; //интервал инспекции элемента
//
offOnBtn();
create2Wind();
setRelateToggles('#myW2WinInner');
tabMainHdlr();

//currentUrl = getCurrentUrl();

keyCheck('z');
saveSelBtnHdlr('#myW2ItemNameBtn');
saveResList(resSelList);



// 
//      ФУНКЦИЯ  ----------------------------------------
//     стартует и оставливает проверку по нажатию кнопки key
// 

function keyCheck(key) {
  let $body = $('body');
  document.onkeypress = function(e) {
    e = e || window.event;
    let keyCode = String.fromCharCode(e.keyCode);
    let activeScrap = $body.is('.activeScrap');
    //console.log(keyCode);
    
    if (keyCode == key && activeScrap) stopCheck();
    if (keyCode == key && !activeScrap) moveCheck();
  }

}

//      ФУНКЦИЯ  ----------------------------------------
//      устанавливает обработчик на элемент

function moveCheck() {
  let body = document.body;
  let $body = $('body');
  
  body.addEventListener('mousemove', mouseMoveHdlr);
  $body.addClass('activeScrap');
}


//      ФУНКЦИЯ  ----------------------------------------
//      убирает обработчик с элемента

function stopCheck() {
  let body = document.body;
  let $body = $('body');
  $body.removeClass('activeScrap');
  body.removeEventListener('mousemove', mouseMoveHdlr);
  $('*').each((i, el)=>{
    $(el).removeClass('hover_sel');
  });

}

//  ФУНКЦИЯ  ----------------------------------------
//  обработчик события под курсором
//
function mouseMoveHdlr(event){
  if(canExe == false) return;
  let body = document.body;
  let letterEl = $('#myW2TabPan3');
  let translateEl = $('#myW2Section2');
  let checkFildEl = $('#myW2Section3');
  let target = event.target;
  let foundEl;

    target.classList.add('hover_sel');

    if(target) {
      
      // теги
      let tagName = target.tagName;
      
      // id
      let id = target.getAttribute('id');
      if(!id) id = 'нет';

      // классы
      let clasess; // список классов
      let classList = target.classList;
      let arr = [];
      classList.forEach((el)=> arr.push(el));
      arr.splice(arr.indexOf('hover_sel'), 1);//вырезаем подсвечивающий класс
      if(arr.length) clasess = arr.join(', ');
      if(!arr.length) clasess = 'нет';

      // текст контент
      let content = getTextContent(target);
      let foundContent;
      
      // вложенные элементы
      currentFindContent = "text"; 
      let innerHtml = target.innerHTML;
      if(innerHtml.indexOf('<') != -1  && tagName != 'CODE') currentFindContent = "html";
      if(tagName == 'CODE') currentFindContent = "code";
      if(tagName == 'IMG') currentFindContent = "img";
      

      // ссылки
      
      if(tagName == 'A') {
        //let ref = target.getAttribute('href');
        currentFindRef = target.href + '';
      }
      

      // картинки
      content = getImgContent(target, content);
      
      // уникальный селектор
      // getUnicSel(target);
      let selArr = [];
      let selStr;
      let clearSelStr;
      let unic = {};
      getUnicSel(target, selArr, unic);
      
      if(unic.res) {
        selArr.reverse();
        selStr = selArr.join('>');
        // проверяем правильность селектора
        foundEl = document.querySelector(selStr); 
        foundContent = getTextContent(foundEl);
        foundContent = getImgContent(foundEl, foundContent);

        // очищаем массив от служебного класса
        let clearSelArr = clearSel(selArr, '.hover_sel');
        clearSelStr = clearSelArr.join('>');
        // сохраняем селектор
        currentFindSel = clearSelStr;

      } else {
        console.log('вызов более 100 раз');
      }

      // рендеринг
      letterEl.text('');
      letterEl.append('<p>тег: '+tagName+'</p>');
      letterEl.append('<p>вложенные элементы: '+currentFindContent+'</p>');
      letterEl.append('<p>id: '+id+'</p>');
      letterEl.append('<p>Класс: '+clasess+'</p>');
      letterEl.append('<p>Селектор: '+clearSelStr+'</p>');

      //letterEl.append('<p>background: '+bg+'</p>');
      translateEl.text('');
      translateEl.append(content);

      checkFildEl.text('');
      checkFildEl.append(foundContent);

      canExe = false;
      setTimeout(function(){canExe = true}, delayExe); 
 
    } else {
      console.log('элемента нет');
    }
    

}
//  ФУНКЦИЯ  ----------------------------------------
//  очищаем массив от служебного класса
// name - класс

function clearSel(arr, name) {

  let newArr = [];
  let test = new RegExp(name, 'i');
  arr.forEach((el) => {
    let newItem = el.replace(test, '');
    newArr.push(newItem);
  });
  return newArr;

}


//  ФУНКЦИЯ  ----------------------------------------
// анализирует элемент 
// unic объкт в свойствах которого возвращаем значение функции
// изза рекурсии не работает return
// el - текущий элемент
//  selArr - массив селекторов от детей к родителям

function getUnicSel(el, selArr, unic){
 
  if(selArr.length > 100) {
    console.log('больше 100', selArr.length);
    unic.res = false;
    return false;
  } 

  let id = el.getAttribute('id');
  let idStr = '#'+ id;
  let tagName = el.tagName;
    
  if(tagName == 'BODY'){
    selArr.push('body');
    unic.res = true;
    return true;
  } 

  if(id) {
    selArr.push(idStr);
    unic.res = true;
    return true;
  } 

  let parentEl = el.parentElement;
  let classList = el.classList;
  let classStr = '';
  if(classList) {
    for(let i=0; i < classList.length; i++){
      classStr = classStr + '.'+ classList[i];
    }
  } 
  let resSel = tagName+classStr;
  let childEls = parentEl.querySelectorAll(resSel);
  let childsNam = childEls.length;
  if(childsNam === 1) {
    //return {selector: resSel , parent: parentEl};
    selArr.push(resSel);
    getUnicSel(parentEl, selArr, unic);

  } else if(childsNam > 1) {
    // находим номер тега сверху начиная с 1 - для css nth-of-type(i)
    //let i = countChild(el, 1);
    let iObj = {};
    countChild(el, 1, iObj);

    resSel = tagName+':nth-of-type('+iObj.i+')'+classStr;
    //return {selector: resSel , parent: parentEl};
    selArr.push(resSel);
    getUnicSel(parentEl, selArr, unic);

  } else {
    console.log('error - getUnicSel');
  }


}

//  ФУНКЦИЯ  ----------------------------------------
//  el - элемент
//  i - счетчик тегов сверху стартует с 1
//  res объкт в свойствах которого возвращаем значение функции

function countChild(el, i, res) {
 
 if(i > 1000) return false;
 let tagName = el.tagName; 
 let prevEl = el.previousElementSibling;
 
 if(prevEl === null) {
  
  res.i = i;
  return i;
}
 let prevTagName = prevEl.tagName;

 if(tagName === prevTagName) {
    i++;
    countChild(prevEl, i, res);
 } else {
    countChild(prevEl, i, res);
 }

}

//  ФУНКЦИЯ  ----------------------------------------
// возвращает строку с текстовым контентом
//

function getTextContent(el) {
    let textContent = '';
    if(el.textContent) textContent = el.textContent + '';
        
    if(textContent && textContent.length > 100) {
       return '<p>'+textContent.slice(0, 100) + '...</p>'; 
    }
    return '<p>'+textContent+ '</p>';
}

//  ФУНКЦИЯ  ----------------------------------------

function getImgContent(el, oldContent) {

    let tagName = el.tagName;
    if(tagName == 'IMG') {
        let imgSrc = el.getAttribute('src');
        let resImg = '<img src="'+imgSrc+'"  width="100px" />';

        return resImg;
    }

    let backgroundImage = el.style.backgroundImage;
    let background = getComputedStyle(el).background;
           
    let bgImgTest = backgroundImage.search(/url/i);
    let bgTest = background.search(/url/i);
    let textContent = el.textContent + '';

    if(bgImgTest != -1 && !textContent) {
        backgroundImage = backgroundImage.substring(bgImgTest + 5);
        bgImgTest = backgroundImage.search(/\)/);
        backgroundImage = backgroundImage.substring(0, bgImgTest-1);
        return '<img src="'+backgroundImage+'"  width="100px" />';
      }
      if(bgTest != -1 && !textContent) {
        letterEl.append('<p>background: '+background+'</p>');
        background = background.substring(bgTest + 5);
        bgTest = background.search(/\)/);
        background = background.substring(0, bgTest-1);
        return '<img src="'+background+'"  width="100px" />';
      }

    return oldContent;
}


//  ФУНКЦИЯ  ----------------------------------------
//  рисуем кнопку активации приложения
//  навешиваем на нее обработчик который записывает состояние

function offOnBtn(){

  if(initialState.offon === 'off' ){
    $('body').prepend(
      "<div id='myW2_offon'>"+
        'OFF' +
      "</div>"
    );
  } else {
    $('body').prepend(
      "<div id='myW2_offon' class ='active'>"+
       'ON' +
      "</div>"
    );
  }

  let offonEl = $("#myW2_offon");    

  offonEl.off("click").on('click', function(){
            
    if (initialState.offon === 'on'){
      $(this).removeClass('active');
      initialState.offon = 'off';
      $(this).text('OFF');
      $('#myW2Win').removeClass('active');
    /*                
      // перезаписываем настройку в фоне
      currentContent.key = 'addContentScriptSettings';// --------------- 3
      chrome.extension.sendMessage(currentContent); // отправляем их на запись
    */
    } else {
      $(this).addClass('active');
      initialState.offon = 'on';
      $(this).text('ON');
      $('#myW2Win').addClass('active');
      /*
      currentContent.key = 'addContentScriptSettings';// --------------- 4
      chrome.extension.sendMessage(currentContent); // отправляем их на запись 
      */
    }

  });
}

// ФУНКЦИЯ =================== создания  окна
// 
  
function create2Wind () {

    let secWind = "<div class='ui-widget-content myW2Win' id='myW2Win'>"+

                "<div id='myW2WinInner' class='myW2WinInner'>"+
                    "<div id='myW2_handle' class='myW2_handle'>"+
                      "<ul class= 'tabList' >"+
                        "<li id='myW2TabBtn1' class='relateSwitch active' data-switch-target='#myW2TabPan1'>main</li>"+
                        "<li id='myW2TabBtn2' class='relateSwitch' data-switch-target='#myW2TabPan2'>all list</li>"+
                        "<li id='myW2TabBtn3' class='relateSwitch' data-switch-target='#myW2TabPan3'>full info</li>"+
                      "</ul>"+

                    "</div>"+

                    "<div id='myW2Section1' class='myW2Letter myW2WinSection'>"+
                     
                      "<div id='myW2TabPan1' class='myW2TabPan myW2TabPan1 active'>"+

                        "<p>"+
                          "<span >Item Name:</span>"+
                          "<span id='myW2TabItemName' class='myW2TabItemName'></span>"+
                        "</p>"+

                        "<p>"+
                          "<input id='myW2TabInput' type='text' placeholder='input Item Name'  pattern='[a-zA-Z]{3,}' required/>"+
                          "<span id='myW2SaveAllBtn' class='myW2Btn myW2ItemNameBtn'>Save All</span>"+
                          "<span id='myW2ItemNameBtn' class='myW2Btn myW2ItemNameBtn'>Save</span>"+
                          
                        "</p>"+
                        
                        
                        "<p>"+
                          "<span id='myW2Tab1Mess' class='myW2Tab1Mess'></span>"+
                        "</p>"+


                      "</div>"+

                      "<div id='myW2TabPan2' class='myW2TabPan myW2TabPan2'>"+
                      "</div>"+

                      "<div id='myW2TabPan3' class='myW2TabPan myW2TabPan3'>"+
                      "</div>"+


                    "</div>"+

                    "<div id='myW2Section2' class='myW2Translate myW2WinSection'>"+
                    "</div>"+

                    "<div id='myW2Section3' class='myW2Input myW2WinSection'>"+
                    
                    "</div>"+

                   
                   
                "</div>"+

            "</div>";

   if(!document.getElementById('myW2Win')) {
    $('body').prepend(secWind);
    onSettingsWind (300, 330, 50, 40, 30, 30);
   }   

}



// ФУНКЦИЯ =================== настраивает  окна
// startW - начальная ширина  startH - начальная высота
// handleH - высота хэндла в пикселях
// sec1H - высота 1 секции в процентах sec2H - высота 2 секции в процентах
// onSettingsWind (300, 330, 30, 40, 30, 30);

  function onSettingsWind (startW, startH, handleH, sec1H, sec2H, sec3H) {
    let secondWin =$('#myW2Win');
    let secondWinInner = $('#myW2WinInner');

    let section1El = secondWinInner.find('.myW2Letter');
    let section1TabPanEl = section1El.find('.myW2TabPan');

    let section2El = secondWinInner.find('.myW2Translate');
    let section3El = secondWinInner.find('.myW2Input');

    //let textArEls = secondWinInner.find('.myW2WinSection > textarea');

    secondWinInner.css({
      'width': startW +'px',
      'height': startH +'px'
    });
    let startClearInHeigth = startH - handleH;
    section1El.css('height', startClearInHeigth * sec1H / 100  + 'px');
    section1TabPanEl.css('height', startClearInHeigth * sec1H / 100  + 'px');

    section2El.css('height', startClearInHeigth * sec2H / 100  + 'px');
    section3El.css('height', startClearInHeigth * sec3H / 100  + 'px');

    secondWinInner.resizable({
      minWidth: startW, // минимальные размеры окна
      minHeight: startH,
      resize: function( event, ui ) {
        secondWin.css({
         'width': ui.size.width, // изменяем ширину и высоту наружного окошка
         'height': ui.size.height,// так как ресайз не на нем а на вложенном
        });
        let clearInnerHeigth = ui.size.height - handleH;

        section1El.css('height', clearInnerHeigth * sec1H / 100  + 'px');
        section1TabPanEl.css('height', clearInnerHeigth * sec1H / 100  + 'px');

        section2El.css('height', clearInnerHeigth * sec2H / 100  + 'px');
        section3El.css('height', clearInnerHeigth * sec3H / 100  + 'px');
        
      }
    });

    secondWin.draggable({
      containment: "window",
      handle:'#myW2_handle'
    });

  }

  // ФУНКЦИЯ =================== выключатель
  // настраивает все выключатели внутри selector
  // selector = '.class' или '#id'
  //
  // switchTarget - id которым помечается открываемая панель
  // data-switch-target = '#panel1'

  function setToggles(selector) {
    
    let switches = $(selector).find('.switch');

    if(switches.length) {

      switches.each((i, el)=>{
        
        $(el).off('click').on('click', () => {
           //console.log('click1');

           $(el).toggleClass('active');
           let switchTarget = $(el).attr('data-switch-target');
           $(switchTarget).toggleClass('active');

        });

      });

    }
  }

  // ФУНКЦИЯ =================== связанный выключатель
  // настраивает все выключатели внутри selector
  // selector = '.class' или '#id'
  //
  // switchTarget - id которым помечается открываемая панель
  // data-switch-target = '#panel1'

  function setRelateToggles(selector) {
    
    let switches = $(selector).find('.relateSwitch');

    if(switches.length) {

      switches.each((i, el)=>{
        
        $(el).off('click').on('click', () => {
           if(!$(el).is('.active')) {

             switches.each((i, el)=>{
                $(el).removeClass('active');
                let switchTarget = $(el).attr('data-switch-target');
                $(switchTarget).removeClass('active');
             }); 

             $(el).addClass('active');
             let switchTarget = $(el).attr('data-switch-target');
             $(switchTarget).addClass('active');
           }
           
        });

      });

    }
  }

  // ФУНКЦИЯ =================== обрабатывает таб main
 
  function tabMainHdlr() {
    
    let inputEl = $('#myW2TabInput');
    let tabItemName = $('#myW2TabItemName');
    inputEl.on('input past blur', (e) => {
       let val = inputEl.val();
       tabItemName.text(val); 

    });
  }

  // ФУНКЦИЯ =================== сохраняет селектор
  // 
  function saveSelBtnHdlr(btn) {
    let btnEl = $(btn);
    let tabItemName = $('#myW2TabItemName');
    let tab = '#myW2Tab1Mess';
    let tab3El = $('#myW2TabPan3');
    let inputEl = $('#myW2TabInput');

    btnEl.off('click').on('click', ()=>{

      let name = tabItemName.text();
      if(!name) return displayTabMess(tab, 'Input Name!!!');
      let checkRes = checkResList(name, currentFindSel);
      if(checkRes.name) return displayTabMess(tab, 'Name already exists!!!');
      if(checkRes.sel) return displayTabMess(tab, 'Selector already exists!!!');

      if(name && !checkRes.name && !checkRes.sel) {

        resSelList.push(
        {
          "id" : 0,
          "url": currentUrl,
          "name": name,
          "sel": currentFindSel,
          "content": currentFindContent,
          "ref": currentFindRef,
          "note": ""
        }
        );
        // очищаем
        inputEl.val('');
        tabItemName.text('');
        tab3El.text('');

        displayTabMess(tab, 'Item succesful saved!!!');
        crtAllList('#myW2TabPan2', resSelList);
      }
      
    });
  }

   // ФУНКЦИЯ =================== обрабатывает таб all list
 
  function tabAllListHdlr() {
    let allListBtnEl = $('#myW2TabBtn2');
    allListBtnEl.off('click').on('click', ()=> {
      
      crtAllList('#myW2TabPan2', resSelList);
      
    });
   
  }

   // ФУНКЦИЯ =================== выводит all list
   // target - '#myW2TabPan2'
   //  list - resSelList

   function crtAllList(target, list) {
      let targetEl = $(target);
      targetEl.text('');
      if(!list.length) return;
      
      let i = 0;
      list.forEach((el)=>{
        i++;
        let itemId = "myW2ListIt_"+i;
        let item = "<p id='"+itemId+"' class='myW2ListIt'>"+
                      "<span>"+
                        i+
                      "</span>"+

                      "<span class='switch' data-switch-target ='#myW2ListPanel_"+i+"'>"+
                        el.name+
                      "</span>"+

                      "<span class='myW2Btn myW2ListItBtn'>"+
                        "Del"+
                      "</span>"+
                   "</p>";

        let panel = "<div id='myW2ListPanel_"+i+"' class='myW2ListPanel'>"+
                      "Selector:  "+el.sel+
                    "</div>";

                    
        targetEl.append(item);
        targetEl.append(panel);
        let  myW2ListItBtnEl = $('#'+itemId+ '> .myW2ListItBtn');
        myW2ListItBtnEl.off('click').on('click', ()=> {
    
          removeItFromAllList(el.name, list);
          crtAllList('#myW2TabPan2', list);
        });          

      });
      setToggles(target);


   }

  // ФУНКЦИЯ =================== удаляет элемент из All List

  function removeItFromAllList(name, list) {

    if(!list.length) return;
    let i =0;
    list.forEach((el)=>{
      if(name === el.name) delete list[i];
      i++; 
    });
  }



  // ФУНКЦИЯ =================== показывает сообщения в табе
  // 
  function displayTabMess(target, mess) {

    let targetEl = $(target);
    targetEl.text('');
    targetEl.text(mess);
  }


  // ФУНКЦИЯ =================== проверяем результирующий
  // список на совпадение имен и селекторов
  // возвращает объект со свойствами
  // name === true и sel === true если такое уже найдено
  //
  function checkResList(name, currentSel) {
    let res = {};
    res.name = false;
    res.sel = false;
    if(resSelList.length) {
      resSelList.forEach((el) => {
        if(el.name === name) res.name = true;
        if(el.sel === currentSel) res.sel = true;
      });
    }

    return res;
    
  }

  // ФУНКЦИЯ =================== сохраняет результат

  function saveResList(res) {
    let tabMsg = '#myW2Tab1Mess';
    let butt = $('#myW2SaveAllBtn');
    butt.off('click').on('click', ()=>{
      if(!res.length) return displayTabMess(tabMsg, 'Save nothing!!!');
      getProjectName(res);
          
    });
  }  

  // ФУНКЦИЯ =================== получает имя проекта
  //
  //

  function getProjectName(res) {
    // перерисовываем интерфейс
    let myW2TabPan1 = $('#myW2TabPan1');
    myW2TabPan1.text('');
    let newTabCont = "<p>"+
                          "<span >Project Name:</span>"+
                          "<span id='myW2TabProjectName' class='myW2TabItemName'></span>"+
                        "</p>"+

                        "<p>"+
                          "<input id='myW2TabProject' type='text' placeholder='input Project Name'  pattern='[a-zA-Z]{3,}' required/>"+
                          "<span id='myW2SaveProjectBtn' class='myW2Btn myW2ItemNameBtn'>Save Project</span>"+
                                                   
                        "</p>"+
                        
                        
                        "<p>"+
                          "<span id='myW2Tab1Mess' class='myW2Tab1Mess'></span>"+
                        "</p>";


    myW2TabPan1.append(newTabCont);

    let tabMsg = '#myW2Tab1Mess';
    let inputEl = $('#myW2TabProject');
    let projectNameEl = $('#myW2TabProjectName');
    inputEl.on('input past blur', (e) => {
      let val = inputEl.val();
      projectNameEl.text(val);
    });  
    
    let butt = $('#myW2SaveProjectBtn');
    butt.off('click').on('click', ()=>{                   

      let projectNameVal = projectNameEl.text();
      if(!projectNameVal) return displayTabMess(tabMsg, 'Save nothing!!!');
      
        res.forEach((el)=> {
          el.project = projectNameVal;
        });

        let messObj = {};
        messObj.res = res;
        messObj.key = "getResList";
        chrome.extension.sendMessage(messObj);
        // очищаем все
        resSelList = []; 
        crtAllList('#myW2TabPan2', resSelList);
        displayTabMess(tabMsg, 'Object is written into the database!!!');
      
        // восстанавливаем первый таб
        crtFirstTab('#myW2TabPan1');
        tabMainHdlr();
        saveSelBtnHdlr('#myW2ItemNameBtn');
        saveResList(resSelList);

    });
  
  }  

  // ФУНКЦИЯ =================== получает имя проекта
  //
  //

  function crtFirstTab(tabSel) {

    let tabEl = $(tabSel);

    let tab = "<p>"+ 
                "<span >Item Name:</span>"+
                "<span id='myW2TabItemName' class='myW2TabItemName'></span>"+
              "</p>"+

              "<p>"+
                "<input id='myW2TabInput' type='text' placeholder='input Item Name'  pattern='[a-zA-Z]{3,}' required/>"+
                "<span id='myW2SaveAllBtn' class='myW2Btn myW2ItemNameBtn'>Save All</span>"+
                "<span id='myW2ItemNameBtn' class='myW2Btn myW2ItemNameBtn'>Save</span>"+
                          
              "</p>"+
                                  
              "<p>"+
                "<span id='myW2Tab1Mess' class='myW2Tab1Mess'></span>"+
              "</p>";

    tabEl.text('').append(tab);
              

  }
  





}); 

