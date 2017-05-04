//
//
'use strict';

$(document).ready(function() {

    //----------------------------
    let projectListFromDb = [];
    let currentSelList = [];
    /*{
`     id : Number  
      project: NAME,
      url: URL,
      name: NAME,
      sel: SELECTOR
      content: text/img/html
      ref: href
      note: TEXT
     } */
    const DBNAME     = 'ScrupSetter',
          PAGESTORE  = 'PAGESTORE';
          
    let onDelElsArr =[]; // массив элементов на удаление

  //   кнопки управления сортировкой   
  let sortControlsTab1 = [ 
      {
        "up": "#tab1_titles_list>.proj_title>.expand_less",
        "down": "#tab1_titles_list>.proj_title>.expand_more",
        "prop": "project"
      },
      {
        "up": "#tab1_titles_list>.url_title>.expand_less",
        "down": "#tab1_titles_list>.url_title>.expand_more",
        "prop": "url"
      },
      {
        "up": "#tab1_titles_list>.name_title>.expand_less",
        "down": "#tab1_titles_list>.name_title>.expand_more",
        "prop": "name"
      }
  ];
  let sortControlsTab2 = [ 
      {
        "up": "#tab2_titles_list>.proj_title>.expand_less",
        "down": "#tab2_titles_list>.proj_title>.expand_more",
        "prop": "project"
      },
     
  ];


// кнопки управления навигацией
let navControlTab1 = {
    "pageContainer": "#tab1 > .projContent",
    "indxDisplay"  : "#play_state",
    "startButt": "#skip_prev",
    "finishButt":"#skip_next",
    "nextButt":"#fast_forward",
    "prevButt":"#fast_rewind"
} 
let navControlTab2 = {
    "pageContainer": "#tab2 > .projContent",
    "indxDisplay"  : "#play_stateT2",
    "startButt": "#skip_prevT2",
    "finishButt":"#skip_nextT2",
    "nextButt":"#fast_forwardT2",
    "prevButt":"#fast_rewindT2"
} 

//
let projectSet = {};
  
  //------ RUN ----------------------
  // заполняем таб с настройками
  //  buildSettingsTab();
  // заполняем табы

  buildAllTabs();




  //----------------------------


// =========  фУНКЦИЯ  ========= ЗАПИСИ ========================= 
//  обновляем Табы
//
function buildAllTabs () {

  // получаем массив из базы  
  getListFromDb (DBNAME, PAGESTORE, "by_project", projectListFromDb)
  .then(result => {
    buildAllRecTab(result, 12);
    buildProjectTab(result);

  });  

}


// =========  фУНКЦИЯ  ========= ЗАПИСИ ========================= 
//  обновляем AllRecTab
//
function buildAllRecTab (recList, pageStep) {
   // клонируем recList
   currentSelList = [];
   currentSelList = [...recList]; 
    
   setPageSelControls (navControlTab1, 0, pageStep, recList, createAllRecList);
   let input ='#searchCon>input';
   searchFilter(input, recList, 'project', pageStep);
   // напрямую сортируем currentSelList 
   onSortHdlr(sortControlsTab1, pageStep);
}


// =========  фУНКЦИЯ  ========= ЗАПИСИ ========================= 
//  обновляем ProjectTab
//
function buildProjectTab (recList) {
    // группируем проекты в массив 
    projectSet = _.groupBy(recList, 'project');
    console.log('projectSet', projectSet);
   let projectList = []; 
   for(let project in projectSet) {
      projectList.push({"name": project, "note" : "", "path":"not saved"});  
   }


   createProjectList (projectList, navControlTab2.pageContainer);

}

// =========  фУНКЦИЯ  ========= ЗАПИСИ ========================= 
//  создает список из записей и выводит их в target
//
function createProjectList (recList, target) {
    let targrtEl = $(target);
    targrtEl.text('');// очищаем
    let i = 0;
    recList.forEach((el)=> {
    i++;
    targrtEl.append(

       "<div id='projEl_"+i+"' class='recEls projEls' >"+
           "<div class='recEl projEl projEl-number'>"+
             i+   
           "</div>"+ 
           "<div class='recEl projEl projEl-name'>"+
             el.name+  
           "</div>"+

            "<div class='btn btn-default btn-xs  projEl-save' type='button'>"+
             'save'+   
           "</div>"+ 

           "<div class='recEl projEl  projEl-path'>"+
             el.path+  
           "</div>"+

            "<div class='btn btn-default btn-xs  projEl-note' type='button'>"+
             'note'+   
           "</div>"+
           
       
       "</div>" 
       

    );
    // обрабатываем нажатие кнопки note
    //let selBtnEl = $('#projEl_'+i+'>.projEl-note');
    //onNoteProjHdlr(refBtnEl, ".hideEl-ref");
    // обрабатываем нажатие кнопки save
    let saveBtnEl = $('#projEl_'+i+'>.projEl-save');
    
    onSaveProjHdlr(saveBtnEl, el.name, projectSet);




 });
}
// =========  фУНКЦИЯ  ========= ЗАПИСИ ========================= 

function onSaveProjHdlr(saveEl, name, projSet){
    saveEl.off("click").on('click', () => {
        let resObj = {};
         resObj.proj = projSet[name];
         resObj.name = name;
        console.log('resObj',resObj);
        let result = JSON.stringify(resObj,"", 4);
        let downObj = {
            "filename": name+"_local1.json",
            "url": 'data:application/json;charset=utf-8,' + encodeURIComponent(result),
            "conflictAction": "prompt",
            "saveAs": true
          };
        chrome.downloads.download(downObj);


    });
}

// =========  фУНКЦИЯ  ========= ЗАПИСИ ========================= 
 //
 // управляет листанием страниц, устанавливает обработчики на кнопки
 // и выводит индикацию состояния +
 // перерендерит страницы вызывая функцию createList
 // вставляет их в pageContainer
 //  arrRec - массив записей  startIndx - начальный индекс, step - шаг
 //  использует getSelectionFromArr
 //  controls - объект с селекторами кнопок управления + контейнер
 //  createList - функция перерисовки нового массива записей

function setPageSelControls (controls, startIndx, step, arrRec, createList){
  
  let pageContainer = controls.pageContainer;// сюда рендерятся страницы
  let indxDisplayEl = $(controls.indxDisplay);//индикатор
  let startButt = $(controls.startButt); // кнопки навигации
  let finishButt = $(controls.finishButt);// кнопки навигации
  let nextButt = $(controls.nextButt);// кнопки навигации
  let prevButt = $(controls.prevButt);// кнопки навигации  

  let recLength = arrRec.length;
  let start = startIndx;
  let finish = start + step -1;
  let last = recLength -1;

  let selRec = [];
  indxDisplayEl.text(''+(start + 1)+ ' - '+ (finish+1));
  selRec = getSelectionFromArr (arrRec, start, finish);
  createList (selRec, pageContainer);

  nextButt.off("click").on('click', () => {
   // console.log('nextButt');
    if(finish < last ){
      start = start + step;
      if((finish + step) <= last){
        finish = finish + step;
      } else {
        finish = last;
      }
    }
    // вызываем функцию обновления индикаторов
    indxDisplayEl.text(''+(start + 1)+ ' - '+ (finish+1));
    // вызываем функцию действия - вывод другой таблицы
    selRec = getSelectionFromArr (arrRec, start, finish);
    createList (selRec, pageContainer);
  });

  prevButt.off("click").on('click', function(){
    //console.log('prevButt');
    if(start > 0){
      finish = start - 1;
      if((start -step) >= 0 ){
        start = start -step;
      } else {
        start = 0;
      }
    }  
     // вызываем функцию обновления индикаторов
     indxDisplayEl.text(''+(start + 1)+ ' - '+ (finish+1));
     // вызываем функцию действия - вывод другой таблицы
     selRec = getSelectionFromArr (arrRec, start, finish);
     createList (selRec, pageContainer);
  }); 

  startButt.off("click").on('click', function(){
    console.log('startButt');
    start = 0;
    finish = start + step -1;
     // вызываем функцию обновления индикаторов
     indxDisplayEl.text(''+(start + 1)+ ' - '+ (finish+1));
     // вызываем функцию действия - вывод другой таблицы
    selRec = getSelectionFromArr (arrRec, start, finish);
    createList (selRec, pageContainer);

  });

  finishButt.off("click").on('click', function(){
    let nam = Math.floor(recLength / step);
    start = nam * step ;
    finish = last;
    if(recLength / step - nam === 0){
      start = start -step;
    }
     // вызываем функцию обновления индикаторов
    indxDisplayEl.text(''+(start + 1)+ ' - '+ (finish+1));
     // вызываем функцию действия - вывод другой таблицы
    selRec = getSelectionFromArr (arrRec, start, finish);
    createList (selRec, pageContainer);
  });
 
}

// фУНКЦИЯ получает массив объектов и делает из него выборку
 // от n до m включительно - возвращает массив с выборкой
 // 

function getSelectionFromArr (arr, n, m){
  let result = [];
  let lengthArr = arr.length;
  if(!lengthArr) return result;
  
  if(n > lengthArr) return result;
  if(m <= 0) return result;
  if(n < 0) n = 0;
  if(m > (lengthArr - 1)) m = lengthArr - 1;

  for(let i = n; i <= m; i++){
    result.push(arr[i]);
  }
  return result;
}

// !!!!   фУНКЦИЯ   !!!!!!!!!  ФИЛЬТР ===============ФФФФФФФФФФФ
//   фильтр по буквам
//   вызывает setPageSelControls для рендеринга страниц
// arrRec - коллекция которую фильтруем
// prop - свойство по которому фильтровать
// step - шаг вывода страниц (для setPageSelControls)

function searchFilter(input, arrRec, prop, step) {
  let res = arrRec;
  let inputEl = $(input);
  inputEl.on('input paste', function(event){
      let res = [];
      let sample = inputEl.val().toLowerCase();
      let sampleLength = sample.length; 
      $.map(arrRec, function(elem, index) {
  
       let letter = $.trim(elem[prop]).substring(0,sampleLength).toLowerCase();
       if(letter == sample){
         res.push(elem);
       }
      });
      // обновляем currentSelList
      currentSelList = [];
      currentSelList = [...res];
      setPageSelControls (navControlTab1, 0, step, currentSelList, createAllRecList);  

  });

}


// !!!!   фУНКЦИЯ   !!!!!!!!!  СОРТИРОВКА  ===============ФФФФФФФФФФФ
//   
//   вызывает setPageSelControls для рендеринга страниц
// arrRec -ссылка на  коллекция - не используется!!!
//  (пока сортируем наружный массив currentSelList напрямую)
// step - шаг вывода страниц (для setPageSelControls)
// controls - коллекция кнопок (со свойствами up , down и prop)prop -свойство сортировки

function onSortHdlr(controls, step) {

    controls.forEach((item)=> {

        let upBtnEl = $(item.up);
        let downBtnEl = $(item.down);
        let prop = item.prop;
        // функция для сортировки по первым буквам ключа (prop)
        let urlFunc = (it) => {
            let url =  it.url.match(/(([a-z0-9\-\.]+)?[a-z0-9\-]+(!?\.[a-z]{2,4}))/ig);
            return $.trim(url).slice(0,3).toLowerCase();
        };

        let sortFunc = (it) => {
            if(prop == 'url') return urlFunc(it);
            return it[prop].slice(0,3).toLowerCase();
         };   


        upBtnEl.off('click').on('click', e => {
     
            let res = _.sortBy(currentSelList, el => sortFunc(el));
            setPageSelControls (navControlTab1, 0, step, res, createAllRecList);
        });

        downBtnEl.off('click').on('click', e => {

            let res = _.sortBy(currentSelList, el => sortFunc(el));
            res.reverse();
            setPageSelControls (navControlTab1, 0, step, res, createAllRecList);
        });

    });
}



// =========  фУНКЦИЯ  ========= ЗАПИСИ ========================= 
//  создает список из записей и выводит их в target
//
function createAllRecList (recList, target) {
  //console.log('recList', recList);  
  let targrtEl = $(target);
  targrtEl.text('');// очищаем
  let i = 0;
  recList.forEach((el)=> {
    i++;
    let url = el.url.match(/(([a-z0-9\-\.]+)?[a-z0-9\-]+(!?\.[a-z]{2,4}))/ig);

    targrtEl.append(

       "<div id='recEl_"+i+"' class='recEls' data-id='"+el.id+"'>"+
           "<div class='recEl recEl-number'>"+
             i+   
           "</div>"+ 
           "<div class='recEl recEl-project'>"+
             el.project+  
           "</div>"+

            "<div class='recEl recEl-url'>"+
             url[0]+   
           "</div>"+

            "<div class='recEl recEl-name'>"+
             el.name+   
           "</div>"+ 

            "<div class='recEl recEl-content'>"+
             el.content+   
           "</div>"+ 
           
           "<div class='btn btn-default btn-xs recEl-del' type='button'>"+
             "del"+  
           "</div>"+

           "<div class='btn btn-default btn-xs recEl-sel' type='button'>"+
             "selector"+  
           "</div>"+ 
           "<div class='btn btn-default btn-xs recEl-ref' type='button'>"+
             "ref"+   
           "</div>"+ 
           
            "<div class='hideEl hideEl-ref'>"+
             el.ref+   
            "</div>"+

            "<div class='hideEl hideEl-sel'>"+
             el.sel+   
            "</div>"+

       "</div>" 
       

    );

    // скрываем лишние ref кнопки
    let refBtnEl = $('#recEl_'+i+'>.recEl-ref');
    if(!el.ref) refBtnEl.css("display", "none");
    // обрабатываем нажатие кнопки ref
    onRefRecsHdlr(refBtnEl, ".hideEl-ref");
    // обрабатываем нажатие кнопки sel
    let selBtnEl = $('#recEl_'+i+'>.recEl-sel');
    onRefRecsHdlr(selBtnEl, ".hideEl-sel");
    // обрабатываем нажатие кнопки del
    let delBtnEl = $('#recEl_'+i+'>.recEl-del');
    onDelRecsHdlr(delBtnEl, el.id);


  });
  

}
// =========  фУНКЦИЯ  ========= обработчик на кнопку ref ========================= 
//  ставит обработчик на кнопку ref и sel - одинаковый
// 
function onRefRecsHdlr(el, hide) {
    el.off('click').on('click',(e)=>{
        let hideEl = el.parent().find(hide);
        if(hideEl.is('.active')) {
           hideEl.removeClass('active');
           el.addClass('btn-default');
           el.removeClass('btn-info'); 
        } else {
           hideEl.addClass('active');
           el.addClass('btn-info');
           el.removeClass('btn-default'); 
        }

    });
}



// =========  фУНКЦИЯ  ========= обработчик на кнопку del ========================= 
//  ставит обработчик на кнопку del
//  onDelElsArr - массив элементов на удаление
function onDelRecsHdlr (delBtn, elId) {
    let messTabEl = $('#mess_tab1');
    delBtn.off('click').on('click',(e)=>{

        if(delBtn.is('.btn-danger')) {
           delBtn.removeClass('btn-danger');
           delBtn.addClass('btn-default');
           console.log('onDelElsArr', onDelElsArr);
           _.pull(onDelElsArr, elId);
           console.log('onDelElsArr.lenth', onDelElsArr.length);
           if(!onDelElsArr.length) messTabEl.removeClass('active');

        } else {
           delBtn.addClass('btn-danger');
           delBtn.removeClass('btn-default');
           // начинаем слушать OK button
           onOkBtnHdlr ('#mess_tab1>.btn_ok', onDelElsArr);

           onDelElsArr.push(elId);
           if(!messTabEl.is('.active')) messTabEl.addClass('active'); 
        }

    });

}

// =========  фУНКЦИЯ  ========= обработчик на кнопку OK ================= 
//  ставит обработчик на кнопку OK для удаления помеченных эл
//  onDelElsArr - массив элементов на удаление

function onOkBtnHdlr (okBtn, removeList){

    let okBtnEl = $(okBtn);
    let messTabEl = $('#mess_tab1');
    okBtnEl.off('click').on('click',(e)=>{
        messTabEl.removeClass('active');
        removeElListFromDb(DBNAME, PAGESTORE, removeList)
        .then(res => {
            buildAllTabs();
        });

    });    
}

// =========  фУНКЦИЯ  ========= удаляет элементы из базы ============= 
//  удаляет группу элементов (слов )    из базы
//  onDelElsArr - массив id элементов на удаление
//использует   openDb();
// удаляет синхронно - непонятна надежность !!!!!!!

function removeElListFromDb(dbName, storage, removeList){

  return new Promise(function(resolve, reject) {
    
    let request = openDb(dbName);

    request.onsuccess = function (){
        let db = request.result;
        console.log('открываем хранилище', storage);
        let tx = db.transaction(storage, "readwrite");
        let store = tx.objectStore(storage);
              
        removeList.forEach((el)=>{
           store.delete(el); 
        });

        tx.oncomplete= function(){
          //Все запросы выполнены успешно, можно закрыть соединение:
          db.close();
          resolve('Все запросы выполнены успешно');
        }
        tx.onabort= function(){
          //Во время транзакции произошла ошибка
          console.log(tx.error.message);
        }

    };

  });
}
  // WWW    ФУНКЦИЯ   WWWWWWWWW  ОБЩИЕ WWWWWWWW   РАБОТА С БАЗОЙ  WWWWWWWWWWWWWWWWWWWWWWWW 
//
// получает полный список записей  из базы и сохраняет их в массив объектов  allRecords
// objStore - хранилище, storeIndex- имя индекса
// возвращает промис с объектом allRecords
//  выборка прямая
// использует openDb(myDbName);

function getListFromDb (dbName, objStore, storeIndex, allRecords){

  return new Promise(function(resolve, reject) {

    allRecords = []; // очищаем 
    let request2;
    let request = openDb(dbName);

    request.onsuccess = function (){
      let db = request.result;
      let tx = db.transaction(objStore, "readwrite");
      let store = tx.objectStore(objStore);
      let index = store.index(storeIndex);
      request2 = index.openCursor();  // прямая выборка
      
      request2.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor)  {
          allRecords.push(cursor.value);
          cursor.continue();
        } else {
            console.log('allRecords', allRecords);
            resolve(allRecords);
        } // end  if (cursor) else
      }; // request2.onsuccess 
      request2.onerror= function(){
        console.log(' Во время получения данных произошла ошибка');
      };
      tx.oncomplete= function(){
        db.close();
        console.log('База закрывается - создание категории');
      };
    }; // request.onsuccess

  });
}

  //    ФУНКЦИЯ   WWWWWWWWW  ОБЩИЕ  WWWWWWWWWW   РАБОТА С БАЗОЙ   WWWWWWWWWWWWWWW
  //
  // ФУНКЦИЯ открывает базу и возвращает request
  //
  function openDb (dbName) {
      let request = indexedDB.open(dbName);
      console.log('соединяемся с базой');
      request.onerror = function(event){
        console.log(' Какая то ошибка !!! ' + event.target.errorCode);
        //Сюда надо написать обработчик ошибки
      };
      return request;
  }
  //----------------------------



});