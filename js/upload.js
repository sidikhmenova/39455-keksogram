/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  //
  var CookiesFilter = docCookies.getItem('filterImagePreview') || '';

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Заполнение значениями по-умолчанию.
   * Значения берутся из параметров картинки и вычисляемого значения side,
   * вычисляемого в файле resizer.js
   */
  function setDefaultValues() {
    if (currentResizer) {
      resizeForm['resize-x'].value = currentResizer._resizeConstraint.x;
      resizeForm['resize-y'].value = currentResizer._resizeConstraint.y;
      resizeForm['resize-size'].value = currentResizer._resizeConstraint.side;
    }
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    //return true;

    //значения полей ввода. Т.е. считаваем заполненные поля ввода
    var resizeX = resizeForm['resize-x'].value;
    var resizeY = resizeForm['resize-y'].value;
    var resizeSize = resizeForm['resize-size'].value;

    //минимальные значения для полей
    return (+resizeX > 0 && +resizeY > 0 && +resizeSize > 0) &&
        (+resizeX + +resizeSize <= currentResizer._image.naturalWidth) &&
        (+resizeY + +resizeSize <= currentResizer._image.naturalHeight);
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;

      case Action.resizeForm:
        isError = true;
        message = message || 'Данные для кадрирования не корректны<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
  //uploadForm.onchange = function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
          // Объект currentResizer заполняется не сразу, поэтому использован небольшой таймаут
          setTimeout(setDefaultValues, 20);
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });
  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
  //resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
  //resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');

      filterImage.classList.add(CookiesFilter);

    } else {
    // Показ сообщения об ошибке, если не валидны значения для кадрирования изображения
      showMessage(Action.resizeForm);
    }
  });

  /**
   * Блокировка кнопки кадрирования, если введены не валидные данные
   */

  var btnSubmitResize = resizeForm.querySelector('[type="submit"]');

  var resizeSize = resizeForm['resize-size'];
  var resizeX = resizeForm['resize-x'];
  var resizeY = resizeForm['resize-y'];

  //var evt = document.createEvent('CustomEvent');


  resizeForm.addEventListener('change', function() {
  //resizeForm.onchange = function() {

    //var resizeSizeX = document.getElementById('resize-x');
    //var resizeSizeY = document.getElementById('resize-y');
    //var resizeSizeInput = document.getElementById('resize-size');

    currentResizer.setConstraint(+resizeX.value, +resizeY.value, +resizeSize.value);
    console.log('resizeSize' + resizeSize.value);
    console.log('resizeX' + resizeX.value);
    console.log('resizeY' + resizeY.value);

    if (resizeFormIsValid()) {
      btnSubmitResize.removeAttribute('disabled');
      //resizeSizeInput.classList.remove('input-error');
      //resizeSizeX.classList.add('input-error');
      //resizeSizeY.classList.add('input-error');

    } else {
      btnSubmitResize.setAttribute('disabled', 'true');

      //if (resizeSize >= currentResizer._image.naturalWidth - resizeX) {
      //  resizeSizeInput.classList.add('input-error');
      //  resizeSizeX.classList.add('input-error');
      //}
      //
      //if (resizeSize >= currentResizer._image.naturalHeight - resizeY) {
      //  resizeSizeInput.classList.add('input-error');
      //  resizeSizeY.classList.add('input-error');
      //}
    }
  });

  /*Работаем с фильтром*/

  // Вычисояем кол-во дней для хранения Куки
  // Вычесляется как:
  // 1) Определяем кол-во дней, прошедших с последнего дня рождения
  // 2) Прибавляем к текущей дате
  function getDateExpire() {
    var today = new Date();
    var dateBD = new Date(2015, 4, 8);
    var dateExp = +today - +dateBD;

    var dateToExpire = +Date.now() + +dateExp;
    return new Date(dateToExpire).toUTCString();
  }


  // Функция определения выбранного фильтра.
  // Нужно для:
  // 1. для дальнейшего приобразования
  // 2. Для записи в cookies
  function setFilter() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    return filterMap[selectedFilter];
  }

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
  //filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
  //filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();
    docCookies.setItem('filterImagePreview', setFilter(), getDateExpire());

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
  //filterForm.onchange = function() {
    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + setFilter();
  });

  function setConstraint() {
    var resizeData = currentResizer.getConstraint();
    resizeX.value = Math.round(resizeData.x);
    resizeY.value = Math.round(resizeData.y);
    console.log('resizeY' + resizeY.value);
    resizeSize.value = Math.round(resizeData.side);
  }


  window.addEventListener('resizerchange', setConstraint);

  cleanupResizer();
  updateBackground();
})();
