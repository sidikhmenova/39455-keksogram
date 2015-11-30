/**
 * Created by Катэ on 27.11.2015.
 */

'use strict';

(function() {
  var template = document.querySelector('#picture-template');
  var container = document.querySelector('.pictures');
  var filter = document.querySelector('.filters');
  var activeFilter = 'filter-all';// ID фильтра по-умолчанию
  var images = [];

  var filters = document.querySelectorAll('.filters-radio');//Берем весь блок с фильтрами
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var currentID = evt.target.id;
      setActiveFilter(currentID);
    };
  }

  container.classList.add('pictures-loading');

  getImages();
  /*
   * Отрисовка изображений
   * @param {Array.<object>} pictures
   * */
  function renderImage(ArrayImages) {
    // чистим список изображений до загрузки.
    container.innerHTML = '';
    // создаем фрагмент документа для последующей загрузки (контейнер для других нод)
    var fragment = document.createDocumentFragment();

    ArrayImages.forEach(function(image) {
      var element = getElementFromTemplate(image);
      fragment.appendChild(element);
    });

    // загружаем все изображения разово
    container.appendChild(fragment);
  }
  /*
   * Установка выбранного фильтра
   * @param {string} id
   * */
  function setActiveFilter(id) {
    // Защита от повторного выбора текущего фильтра
    if (activeFilter === id) {
      return;
    }

    // Алгоритм фильтрации
    // выполняем сортировку/фильтрацию списка и вывод на страницу
    var filteredImages = images.slice(0);

    // перебираем варианты фильтров
    switch (id) {
      case 'filter-new':
        // Для показа новых изображений - сортируем по порядку
        // список фотографий, сделанных за последние три месяца, отсортированные по убыванию даты
        filteredImages = filteredImages.sort(function(a, b) {
          return b.date - a.date;
        });
          // фильтруем массив с датами и отбираем изображения за 3 месяца
        filteredImages = filteredImages.filter(function(date) {
          // делаем выборку за последние 3 месяца
          var pictureDate = new Date(date.date);
          var lastDate = new Date();
          var lastMonth = lastDate.getMonth();
          lastMonth = lastMonth - 3;
          lastDate.setMonth(lastMonth);
          return pictureDate > lastDate;
        });
        break;
      case 'filter-discussed':
        // Для показа популярных оизображений - сортируем по порядку убывания популярности
        filteredImages = filteredImages.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }

    renderImage(filteredImages);
  }


  //Загрузка списка изображений
  function getImages() {
    // создаем новый xhr запрос
    var xhr = new XMLHttpRequest();
    // указываем, что грузим его с сервера с помощью метода GET
    xhr.open('GET', 'data/pictures.json');
    // ставим обработчик
    xhr.onload = function(evt) {
      // берем данные и парсим их
      var rowData = evt.target.response;
      var loadedImages = JSON.parse(rowData);
      // помещаем в массив images распарсенные данные
      images = loadedImages;

      //Обработка загружаемых данных
      renderImage(loadedImages);
    };

    // обработчик возникших ошибок (сервера)
    xhr.onerror = function() {
      picturesFailure();
    };
    // истек таймаут
    xhr.timeout = 10000;
    xhr.ontimeout = function() {
      picturesFailure();
    };

    xhr.send();
  }

  // Функция, возвращающая ошибку
  function picturesFailure() {
    container.classList.add('pictures-failure');// Показываем ошибку
  }

  /*
    * Для каждого элемента создаем DOM - элемент на основе шаблона
    * @param {object} data
    * @return {element}
  * */
  function getElementFromTemplate(data) {
    var element;
    var IMAGE_TIMEOUT = 10000;

    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
    }

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    /*
     *@const
     *@type {number}
     * */

    // Установка таймаута на загрузку изображения. Таймер ожидает 10 секунд
    // после которых он уберет src у изображения и добавит класс picture-load-failure,
    // который показывает, что фотография не загрузилась.
    var imageLoadTimeout = setTimeout(function() {
      backgroundImage.src = ''; // Прекращаем загрузку
      element.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);

    /*
    * @type {Image}
    * */
    var backgroundImage = new Image();

    backgroundImage.onload = function() {
      clearTimeout(imageLoadTimeout);
    };

    // Если изображение не загрузилось (404 ошибка, ошибка сервера),
    // показываем сообщение, что отсутствует изображение
    backgroundImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    backgroundImage.src = data.url;
    backgroundImage.setAttribute('width', '182');
    backgroundImage.setAttribute('height', '182');
    element.replaceChild(backgroundImage, element.children[0]);

    return element;
  }

  container.classList.remove('pictures-loading');
  filter.classList.remove('hidden');

})();
