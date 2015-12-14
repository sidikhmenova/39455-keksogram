/**
 * Created by Катэ on 27.11.2015.
 */

'use strict';

(function() {
  var template = document.querySelector('#picture-template');
  var container = document.querySelector('.pictures');
  var filter = document.querySelector('.filters');
  var activeFilter = 'filter-popular';// ID фильтра по-умолчанию
  var images = [];
  var filteredImages = [];
  var currentPage = 0;
  var PAGE_SIZE = 11;

  var filters = document.querySelector('.filters');//Берем весь блок с фильтрами
  filters.addEventListener('click', function(evt) {
    // определяем на каком событии произошло "всплытие"
    var clickedElement = evt.target;
    if (clickedElement.classList.contains('filters-radio')) {
      setActiveFilter(clickedElement.id);
    }
  });

  var scrollTimeout;

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(getPageNumbers, 100);
  });

  function getPageNumbers() {
    // определяем положение футера относительно экрана
    var footerCoordinates = container.getBoundingClientRect();

    // определяем высоту экрана (вьюпорта)
    var viewportSize = window.innerHeight;

    // Анализируем положение футера относительно экрана (вьюпорта)
    if (footerCoordinates.bottom <= viewportSize) {
      if (currentPage < Math.ceil(filteredImages.length / PAGE_SIZE)) {
        renderImage(filteredImages, ++currentPage);
      }
    }
  }

  container.classList.add('pictures-loading');

  getImages();
  /*
   * Отрисовка изображений
   * @param {Array.<object>} pictures
   * */
  function renderImage(ArrayImages, pageNumber, replace) {
    // чистим список изображений до загрузки, если нужно (зависит от значения replace - булево).
    if (replace) {
      container.innerHTML = '';
    }
    // создаем фрагмент документа для последующей загрузки (контейнер для других нод)
    var fragment = document.createDocumentFragment();

    // с какого элемента будем вырезать
    var from = pageNumber * PAGE_SIZE;
    // по какой элемент будем вырезать
    var to = from + PAGE_SIZE;
    // вырезаем отели со страницы
    var pageImage = ArrayImages.slice(from, to);

    pageImage.forEach(function(image) {
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
  function setActiveFilter(id, force) {
    // Защита от повторного выбора текущего фильтра
    if (activeFilter === id && !force) {
      return;
    }

    // Алгоритм фильтрации
    // выполняем сортировку/фильтрацию списка и вывод на страницу
    currentPage = 0;
    filteredImages = images.slice(0);

    // перебираем варианты фильтров
    switch (id) {
      case 'filter-popular':
        // Для показа популярных, т.е. всех
        activeFilter = id;
        break;
      case 'filter-new':
        // Для показа новых изображений - сортируем по порядку
        // список фотографий, сделанных за последние три месяца, отсортированные по убыванию даты
        filteredImages = filteredImages.sort(function(a, b) {
          var dateA = new Date(a.date);
          var dateB = new Date(b.date);
          return dateB - dateA;
        });
        // фильтруем массив с датами и отбираем изображения за 3 месяца
        filteredImages = filteredImages.filter(selectedDay);
        activeFilter = id;
        break;
      case 'filter-discussed':
        // Для показа популярных оизображений - сортируем по порядку убывания популярности
        filteredImages = filteredImages.sort(function(a, b) {
          return b.comments - a.comments;
        });
        activeFilter = id;
        break;
    }

    renderImage(filteredImages, 0, true);
    getPageNumbers();
  }

  var lastDate = new Date();
  var lastMonth = lastDate.getMonth();
  lastMonth = lastMonth - 3;
  lastDate.setMonth(lastMonth);

  // Функция анализа даты публикации
  function selectedDay(date) {
    // делаем выборку за последние 3 месяца
    var pictureDate = new Date(date.date);
    return pictureDate > lastDate;
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
      setActiveFilter(activeFilter, true);
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
